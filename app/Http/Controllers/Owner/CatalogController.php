<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Owner\Concerns\ResolvesOwnerShop;
use App\Http\Requests\ShopProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Services\FileUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    use ResolvesOwnerShop;

    public function __construct(
        protected FileUploadService $fileUploadService,
    ) {}

    /**
     * Browse the shared product catalog.
     */
    public function index(Request $request): Response
    {
        $shop = $this->resolveShop($request->user());

        $search = $request->string('search')->trim()->value();
        $categoryId = $request->integer('category_id');
        $status = $request->string('status')->trim()->value(); // 'all', 'added', 'not_added'

        $myProductIds = ShopProduct::where('shop_id', $shop->id)->pluck('product_id')->all();

        $query = Product::query()
            ->with([
                'category:id,name,slug',
                'subcategory:id,name,slug',
                'creator:id,name',
            ])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($categoryId > 0, function ($q) use ($categoryId): void {
                $q->where('category_id', $categoryId);
            })
            ->when($status === 'added', function ($q) use ($myProductIds): void {
                $q->whereIn('id', $myProductIds);
            })
            ->when($status === 'not_added', function ($q) use ($myProductIds): void {
                $q->whereNotIn('id', $myProductIds);
            })
            ->latest();

        $products = $query->paginate(12)->withQueryString();

        // Attach is_in_shop flag and existing shop_product info
        $myShopProducts = ShopProduct::where('shop_id', $shop->id)
            ->whereIn('product_id', $products->pluck('id'))
            ->get()
            ->keyBy('product_id');

        $products->through(function (Product $product) use ($myShopProducts) {
            $listing = $myShopProducts->get($product->id);
            $product->is_in_shop = $listing !== null;
            $product->shop_product = $listing;

            return $product;
        });

        $categories = Category::with('subcategories:id,category_id,name')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('owner/catalog/index', [
            'shop' => $shop,
            'products' => $products,
            'categories' => $categories,
            'myProductIds' => $myProductIds,
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'category_id' => $categoryId > 0 ? $categoryId : null,
                'status' => $status !== '' ? $status : 'all',
            ],
        ]);
    }

    /**
     * Add a product from the shared catalog to the shop.
     */
    public function addToShop(ShopProductRequest $request, Product $product): RedirectResponse
    {
        $shop = $this->resolveShop($request->user());

        $validated = $request->validated();

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            /** @var UploadedFile $file */
            $file = $request->file('thumbnail');
            $thumbnailPath = $this->fileUploadService->upload($file, 'shop_products');
        }

        $data = [
            'price' => $validated['price'],
            'old_price' => $validated['old_price'] ?? null,
            'details' => $validated['details'] ?? null,
            'stock' => $validated['stock'] ?? 100,
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($thumbnailPath !== null) {
            $data['thumbnail'] = $thumbnailPath;
        }

        ShopProduct::updateOrCreate(
            [
                'shop_id' => $shop->id,
                'product_id' => $product->id,
            ],
            $data
        );

        return back()->with('success', "\"{$product->name}\" was successfully added to your shop!");
    }
}
