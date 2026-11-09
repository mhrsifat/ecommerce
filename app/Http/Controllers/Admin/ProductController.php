<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\FileUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected FileUploadService $fileUploadService,
    ) {}

    /**
     * Display a listing of products in the shared catalog.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $categoryId = $request->integer('category_id');

        $products = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'creator:id,name,email',
        ])
            ->withCount('shopProducts')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($categoryId > 0, function ($query) use ($categoryId): void {
                $query->where('category_id', $categoryId);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Category::with('subcategories:id,category_id,name')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'category_id' => $categoryId > 0 ? $categoryId : null,
            ],
        ]);
    }

    /**
     * Store a newly created product in the shared catalog.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        /** @var UploadedFile $imageFile */
        $imageFile = $request->file('image');
        $validated['image'] = $this->fileUploadService->upload($imageFile);
        $validated['created_by_id'] = $request->user()?->id;

        Product::create($validated);

        return redirect()->route('admin.products.index')->with('success', 'Product added to shared catalog successfully.');
    }

    /**
     * Update the specified product in the shared catalog.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            /** @var UploadedFile $imageFile */
            $imageFile = $request->file('image');
            $validated['image'] = $this->fileUploadService->replace($imageFile, $product->image);
        } else {
            unset($validated['image']);
        }

        $product->update($validated);

        return redirect()->route('admin.products.index')->with('success', 'Shared catalog product updated successfully.');
    }

    /**
     * Remove the specified product from the shared catalog.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $this->fileUploadService->delete($product->image);

        $product->delete();

        return back()->with('success', 'Product removed from catalog successfully.');
    }
}
