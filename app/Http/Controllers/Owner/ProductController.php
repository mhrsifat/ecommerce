<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Owner\Concerns\ResolvesOwnerShop;
use App\Http\Requests\OwnerProductCreateRequest;
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

class ProductController extends Controller
{
    use ResolvesOwnerShop;

    public function __construct(
        protected FileUploadService $fileUploadService,
    ) {}

    /**
     * Display a listing of products in this shop.
     */
    public function index(Request $request): Response
    {
        $shop = $this->resolveShop($request->user());

        $search = $request->string('search')->trim()->value();

        $shopProducts = ShopProduct::where('shop_id', $shop->id)
            ->with([
                'product:id,name,slug,description,image,old_price,new_price,category_id,subcategory_id,created_by_id',
                'product.category:id,name,slug',
                'product.subcategory:id,name,slug',
                'product.creator:id,name',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('product', function ($q) use ($search): void {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Category::with('subcategories:id,category_id,name')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('owner/products/index', [
            'shop' => $shop,
            'shopProducts' => $shopProducts,
            'categories' => $categories,
            'filters' => [
                'search' => $search !== '' ? $search : null,
            ],
        ]);
    }

    /**
     * Store a newly created product (adds to both shared catalog and this shop).
     */
    public function store(OwnerProductCreateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $shop = $this->resolveShop($user);

        $validated = $request->validated();

        /** @var UploadedFile $imageFile */
        $imageFile = $request->file('image');
        $imagePath = $this->fileUploadService->upload($imageFile, 'products');

        // 1. Create in Shared Catalog
        $product = Product::create([
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'created_by_id' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'image' => $imagePath,
            'old_price' => $validated['old_price'] ?? null,
            'new_price' => $validated['price'],
        ]);

        // 2. Add to this shop's listings
        ShopProduct::create([
            'shop_id' => $shop->id,
            'product_id' => $product->id,
            'price' => $validated['price'],
            'old_price' => $validated['old_price'] ?? null,
            'details' => $validated['details'] ?? $validated['description'],
            'thumbnail' => null, // falls back to product image
            'stock' => $validated['stock'] ?? 100,
            'is_active' => true,
        ]);

        return redirect()->route('owner.products.index')
            ->with('success', "\"{$product->name}\" was successfully created and added to your shop and the shared catalog!");
    }

    /**
     * Update the specified shop product listing.
     */
    public function update(ShopProductRequest $request, ShopProduct $shopProduct): RedirectResponse
    {
        $shop = $this->resolveShop($request->user());

        abort_if($shopProduct->shop_id !== $shop->id, 403, 'Unauthorized action.');

        $validated = $request->validated();

        if ($request->hasFile('thumbnail')) {
            /** @var UploadedFile $thumbnailFile */
            $thumbnailFile = $request->file('thumbnail');
            $validated['thumbnail'] = $this->fileUploadService->replace($thumbnailFile, $shopProduct->thumbnail, 'shop_products');
        } else {
            unset($validated['thumbnail']);
        }

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['stock'] = $validated['stock'] ?? 100;

        $shopProduct->update($validated);

        return back()->with('success', 'Shop product listing updated successfully.');
    }

    /**
     * Remove the specified product from the shop (unlists it without deleting from shared catalog).
     */
    public function destroy(Request $request, ShopProduct $shopProduct): RedirectResponse
    {
        $shop = $this->resolveShop($request->user());

        abort_if($shopProduct->shop_id !== $shop->id, 403, 'Unauthorized action.');

        if ($shopProduct->thumbnail) {
            $this->fileUploadService->delete($shopProduct->thumbnail);
        }

        $shopProduct->delete();

        return back()->with('success', 'Product has been unlisted from your shop. It remains available in the shared catalog.');
    }
}
