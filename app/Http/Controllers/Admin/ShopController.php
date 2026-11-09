<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShopRequest;
use App\Models\Shop;
use App\Models\User;
use App\Services\FileUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function __construct(
        protected FileUploadService $fileUploadService,
    ) {}

    /**
     * Display a listing of shops.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $shops = Shop::query()
            ->with(['owner:id,name,email'])
            ->withCount('products')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('owner', function ($q) use ($search): void {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $shopOwners = User::role('shop_owner')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/shops/index', [
            'shops' => $shops,
            'shopOwners' => $shopOwners,
            'filters' => [
                'search' => $search !== '' ? $search : null,
            ],
        ]);
    }

    /**
     * Store a newly created shop.
     */
    public function store(ShopRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            /** @var UploadedFile $logoFile */
            $logoFile = $request->file('logo');
            $validated['logo'] = $this->fileUploadService->upload($logoFile, 'shops');
        }

        $validated['is_active'] = $request->boolean('is_active', true);

        Shop::create($validated);

        return redirect()->route('admin.shops.index')->with('success', 'Shop created successfully.');
    }

    /**
     * Update the specified shop.
     */
    public function update(ShopRequest $request, Shop $shop): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            /** @var UploadedFile $logoFile */
            $logoFile = $request->file('logo');
            $validated['logo'] = $this->fileUploadService->replace($logoFile, $shop->logo, 'shops');
        } else {
            unset($validated['logo']);
        }

        $validated['is_active'] = $request->boolean('is_active', true);

        $shop->update($validated);

        return redirect()->route('admin.shops.index')->with('success', 'Shop updated successfully.');
    }

    /**
     * Remove the specified shop.
     */
    public function destroy(Shop $shop): RedirectResponse
    {
        if ($shop->logo) {
            $this->fileUploadService->delete($shop->logo);
        }

        $shop->delete();

        return redirect()->route('admin.shops.index')->with('success', 'Shop deleted successfully.');
    }
}
