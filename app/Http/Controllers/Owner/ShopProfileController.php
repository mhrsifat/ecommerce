<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Owner\Concerns\ResolvesOwnerShop;
use App\Models\Shop;
use App\Services\FileUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class ShopProfileController extends Controller
{
    use ResolvesOwnerShop;

    public function __construct(
        protected FileUploadService $fileUploadService,
    ) {}

    /**
     * Show shop profile settings.
     */
    public function edit(Request $request): Response
    {
        $shop = $this->resolveShop($request->user());

        return Inertia::render('owner/shop/edit', [
            'shop' => $shop,
        ]);
    }

    /**
     * Update shop profile settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $shop = $this->resolveShop($request->user());

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            /** @var UploadedFile $logoFile */
            $logoFile = $request->file('logo');
            $validated['logo'] = $this->fileUploadService->replace($logoFile, $shop->logo, 'shops');
        } else {
            unset($validated['logo']);
        }

        $shop->update($validated);

        return back()->with('success', 'Shop profile updated successfully.');
    }
}
