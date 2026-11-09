<?php

use App\Http\Controllers\Owner\CatalogController;
use App\Http\Controllers\Owner\ProductController;
use App\Http\Controllers\Owner\ShopProfileController;
use Illuminate\Support\Facades\Route;

// Shop Owner Management Routes
Route::prefix('owner')->name('owner.')->middleware(['auth', 'role:shop_owner|admin'])->group(function (): void {
    Route::get('/', fn () => redirect()->route('owner.products.index'));

    // Shared Product Catalog Browsing & Importing
    Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
    Route::post('/catalog/{product}/add', [CatalogController::class, 'addToShop'])->name('catalog.add');

    // Shop's Product Listings (Manage prices, details, thumbnails, and create products)
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{shopProduct}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{shopProduct}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Shop Profile & Settings
    Route::get('/shop', [ShopProfileController::class, 'edit'])->name('shop.edit');
    Route::put('/shop', [ShopProfileController::class, 'update'])->name('shop.update');
});
