<?php

use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

// Public Storefront Routes
Route::get('/', [ShopController::class, 'index'])->name('home');
Route::get('/shops', [ShopController::class, 'shopsIndex'])->name('shops.index');
Route::get('/shops/{shop:slug}', [ShopController::class, 'shopShow'])->name('shops.show');
Route::get('/shops/{shop:slug}/products/{productSlug}', [ShopController::class, 'shopProductShow'])->name('shops.products.show');
Route::get('/search/live', [ShopController::class, 'liveSearch'])->name('search.live');
Route::get('/categories/{category:slug}/{subcategory:slug?}', [ShopController::class, 'index'])
    ->scopeBindings()
    ->name('categories.show')
    ->missing(ShopController::categoryNotFound(...));
Route::get('/products/{slug}', [ShopController::class, 'show'])->name('products.show');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/owner.php';
