<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ShopController extends Controller
{
    /**
     * Display the storefront index with shop-assigned products only.
     */
    public function index(Request $request, ?Category $category = null, ?Subcategory $subcategory = null): Response
    {
        $search = $request->string('search')->trim()->value();
        $queryCategorySlug = $request->string('category')->trim()->value();
        $querySubcategorySlug = $request->string('subcategory')->trim()->value();
        $shopSlug = $request->string('shop')->trim()->value();

        // Support query parameter fallback if not route-bound
        if ($category === null && $queryCategorySlug !== '') {
            $category = Category::where('slug', $queryCategorySlug)->first();

            if (! $category) {
                return Inertia::render('shop/not-found', [
                    'type' => 'category',
                    'slug' => $queryCategorySlug,
                ]);
            }
        }

        if ($subcategory === null && $querySubcategorySlug !== '') {
            $subcatQuery = Subcategory::where('slug', $querySubcategorySlug);
            if ($category) {
                $subcatQuery->where('category_id', $category->id);
            }
            $subcategory = $subcatQuery->first();

            if (! $subcategory) {
                return Inertia::render('shop/not-found', [
                    'type' => 'subcategory',
                    'slug' => $querySubcategorySlug,
                ]);
            }
        }

        $activeCategorySlug = $category?->slug;
        $activeSubcategorySlug = $subcategory?->slug;

        // Categories that have products assigned to at least one active shop
        $categories = Category::query()
            ->whereHas('products.shopProducts', function (Builder $q): void {
                $q->where('is_active', true)
                    ->whereHas('shop', fn (Builder $sq) => $sq->where('is_active', true));
            })
            ->with(['subcategories' => function ($query): void {
                $query->whereHas('products.shopProducts', function (Builder $q): void {
                    $q->where('is_active', true)
                        ->whereHas('shop', fn (Builder $sq) => $sq->where('is_active', true));
                })->orderBy('name');
            }])
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        // Base query strictly scoped to ACTIVE shop products of ACTIVE shops
        // Requirement: Products that are not assigned to any shop must not be visible to customers.
        $shopProductsQuery = ShopProduct::query()
            ->where('is_active', true)
            ->whereHas('shop', function (Builder $q): void {
                $q->where('is_active', true);
            })
            ->with([
                'shop:id,name,slug,logo,email,phone,address',
                'product:id,name,slug,description,image,category_id,subcategory_id',
                'product.category:id,name,slug',
                'product.subcategory:id,name,slug',
            ])
            ->when($category !== null, function (Builder $query) use ($category): void {
                $query->whereHas('product', fn (Builder $q) => $q->where('category_id', $category->id));
            })
            ->when($subcategory !== null, function (Builder $query) use ($subcategory): void {
                $query->whereHas('product', fn (Builder $q) => $q->where('subcategory_id', $subcategory->id));
            })
            ->when($shopSlug !== '', function (Builder $query) use ($shopSlug): void {
                $query->whereHas('shop', fn (Builder $q) => $q->where('slug', $shopSlug));
            })
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $q) use ($search): void {
                    $q->where('details', 'like', "%{$search}%")
                        ->orWhereHas('product', function (Builder $pq) use ($search): void {
                            $pq->where('name', 'like', "%{$search}%")
                                ->orWhere('description', 'like', "%{$search}%");
                        })
                        ->orWhereHas('shop', function (Builder $sq) use ($search): void {
                            $sq->where('name', 'like', "%{$search}%");
                        });
                });
            });

        $shopProducts = (clone $shopProductsQuery)
            ->latest()
            ->paginate(12)
            ->withQueryString();

        // Active shops for the storefront directory / filter
        $activeShops = Shop::query()
            ->where('is_active', true)
            ->whereHas('shopProducts', fn (Builder $q) => $q->where('is_active', true))
            ->withCount(['shopProducts' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('name')
            ->take(8)
            ->get(['id', 'name', 'slug', 'logo', 'description']);

        $featuredProducts = collect();
        $isRootHome = ($category === null && $subcategory === null && $search === '' && $shopSlug === '');

        if ($isRootHome) {
            $featuredProducts = ShopProduct::query()
                ->where('is_active', true)
                ->whereHas('shop', fn (Builder $q) => $q->where('is_active', true))
                ->whereNotNull('old_price')
                ->whereColumn('old_price', '>', 'price')
                ->with([
                    'shop:id,name,slug,logo',
                    'product:id,name,slug,description,image,category_id,subcategory_id',
                    'product.category:id,name,slug',
                    'product.subcategory:id,name,slug',
                ])
                ->latest()
                ->take(6)
                ->get();
        }

        return Inertia::render('shop/index', [
            'categories' => $categories,
            'shopProducts' => $shopProducts,
            'activeShops' => $activeShops,
            'featuredProducts' => $featuredProducts,
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'category' => $activeCategorySlug,
                'subcategory' => $activeSubcategorySlug,
                'shop' => $shopSlug !== '' ? $shopSlug : null,
            ],
        ]);
    }

    /**
     * Display a directory of all active shops.
     */
    public function shopsIndex(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $shops = Shop::query()
            ->where('is_active', true)
            ->withCount(['shopProducts' => fn ($q) => $q->where('is_active', true)])
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('shop/shops-index', [
            'shops' => $shops,
            'filters' => [
                'search' => $search !== '' ? $search : null,
            ],
        ]);
    }

    /**
     * Display a specific shop's storefront with its product listings.
     */
    public function shopShow(Shop $shop, Request $request): Response
    {
        abort_if(! $shop->is_active, 404, 'Shop is currently unavailable.');

        $search = $request->string('search')->trim()->value();
        $categorySlug = $request->string('category')->trim()->value();

        $shopProducts = ShopProduct::query()
            ->where('shop_id', $shop->id)
            ->where('is_active', true)
            ->with([
                'product:id,name,slug,description,image,category_id,subcategory_id',
                'product.category:id,name,slug',
                'product.subcategory:id,name,slug',
            ])
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $q) use ($search): void {
                    $q->where('details', 'like', "%{$search}%")
                        ->orWhereHas('product', function (Builder $pq) use ($search): void {
                            $pq->where('name', 'like', "%{$search}%")
                                ->orWhere('description', 'like', "%{$search}%");
                        });
                });
            })
            ->when($categorySlug !== '', function (Builder $query) use ($categorySlug): void {
                $query->whereHas('product.category', fn (Builder $q) => $q->where('slug', $categorySlug));
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $shopCategories = Category::whereHas('products.shopProducts', function (Builder $q) use ($shop): void {
            $q->where('shop_id', $shop->id)->where('is_active', true);
        })->get(['id', 'name', 'slug']);

        return Inertia::render('shop/shop-show', [
            'shop' => $shop->load(['owner:id,name']),
            'shopProducts' => $shopProducts,
            'shopCategories' => $shopCategories,
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'category' => $categorySlug !== '' ? $categorySlug : null,
            ],
        ]);
    }

    /**
     * Display a shop-specific product details page.
     * Displays shop-specific product information, prices, and thumbnails.
     */
    public function shopProductShow(Shop $shop, string $productSlug): Response
    {
        abort_if(! $shop->is_active, 404, 'Shop is currently unavailable.');

        $shopProduct = ShopProduct::query()
            ->where('shop_id', $shop->id)
            ->where('is_active', true)
            ->whereHas('product', fn (Builder $q) => $q->where('slug', $productSlug))
            ->with([
                'shop:id,name,slug,logo,email,phone,address,description',
                'product:id,name,slug,description,image,category_id,subcategory_id',
                'product.category:id,name,slug',
                'product.subcategory:id,name,slug',
            ])
            ->first();

        if (! $shopProduct) {
            return Inertia::render('shop/not-found', [
                'type' => 'product',
                'slug' => $productSlug,
                'message' => "This product is not currently listed by \"{$shop->name}\".",
            ]);
        }

        // Other products from this same shop
        $relatedProducts = ShopProduct::query()
            ->where('shop_id', $shop->id)
            ->where('is_active', true)
            ->where('id', '!=', $shopProduct->id)
            ->with([
                'shop:id,name,slug,logo',
                'product:id,name,slug,description,image,category_id',
                'product.category:id,name,slug',
            ])
            ->latest()
            ->take(4)
            ->get();

        // Other shops that also list this same catalog product
        $otherSellers = ShopProduct::query()
            ->where('product_id', $shopProduct->product_id)
            ->where('shop_id', '!=', $shop->id)
            ->where('is_active', true)
            ->whereHas('shop', fn (Builder $q) => $q->where('is_active', true))
            ->with(['shop:id,name,slug,logo,address'])
            ->get();

        return Inertia::render('shop/show', [
            'shopProduct' => $shopProduct,
            'relatedProducts' => $relatedProducts,
            'otherSellers' => $otherSellers,
        ]);
    }

    /**
     * Storefront canonical product route: /products/{slug}
     * Requirement: Products that are not assigned to any shop must not be visible to customers.
     */
    public function show(string $slug): Response|RedirectResponse
    {
        // First check if product exists at all
        $product = Product::where('slug', $slug)->first();

        if (! $product) {
            return Inertia::render('shop/not-found', [
                'type' => 'product',
                'slug' => $slug,
                'message' => "No product found with the slug \"{$slug}\".",
            ]);
        }

        // Requirement: Products that are not assigned to any shop must not be visible to customers!
        $firstShopProduct = ShopProduct::query()
            ->where('product_id', $product->id)
            ->where('is_active', true)
            ->whereHas('shop', fn (Builder $q) => $q->where('is_active', true))
            ->with('shop:id,slug')
            ->first();

        if (! $firstShopProduct) {
            // Unassigned product: NOT visible to customers!
            return Inertia::render('shop/not-found', [
                'type' => 'product',
                'slug' => $slug,
                'message' => 'This product is not currently available in any active shop.',
            ]);
        }

        // Redirect to the shop-specific product view
        return redirect()->route('shops.products.show', [
            'shop' => $firstShopProduct->shop->slug,
            'productSlug' => $product->slug,
        ]);
    }

    /**
     * Search products live for the storefront autocomplete popover.
     * Strictly limits to products assigned to active shops!
     */
    public function liveSearch(Request $request): JsonResponse
    {
        $query = $request->string('q')->trim()->value();

        if ($query === '') {
            return response()->json([
                'products' => [],
                'total' => 0,
            ]);
        }

        $baseQuery = ShopProduct::query()
            ->where('is_active', true)
            ->whereHas('shop', fn (Builder $q) => $q->where('is_active', true))
            ->where(function (Builder $builder) use ($query): void {
                $builder->where('details', 'like', "%{$query}%")
                    ->orWhereHas('product', function (Builder $pq) use ($query): void {
                        $pq->where('name', 'like', "%{$query}%")
                            ->orWhere('description', 'like', "%{$query}%");
                    })
                    ->orWhereHas('shop', function (Builder $sq) use ($query): void {
                        $sq->where('name', 'like', "%{$query}%");
                    });
            });

        $total = (clone $baseQuery)->count();

        $shopProducts = $baseQuery
            ->with([
                'shop:id,name,slug,logo',
                'product:id,name,slug,description,image,category_id,subcategory_id',
                'product.category:id,name,slug',
            ])
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'products' => $shopProducts,
            'total' => $total,
        ]);
    }

    /**
     * Handle missing category or subcategory from route model binding.
     */
    public static function categoryNotFound(Request $request): SymfonyResponse
    {
        $categoryParam = $request->route('category');
        $category = $categoryParam instanceof Category
            ? $categoryParam
            : Category::where('slug', (string) $categoryParam)->first();

        $categorySlug = $category ? $category->slug : (string) $categoryParam;

        if (! $category) {
            return Inertia::render('shop/not-found', [
                'type' => 'category',
                'slug' => $categorySlug,
            ])->toResponse($request)->setStatusCode(404);
        }

        $subcategoryParam = $request->route('subcategory');
        $subcategorySlug = $subcategoryParam instanceof Subcategory
            ? $subcategoryParam->slug
            : (string) $subcategoryParam;

        return Inertia::render('shop/not-found', [
            'type' => 'subcategory',
            'slug' => $subcategorySlug,
        ])->toResponse($request)->setStatusCode(404);
    }
}
