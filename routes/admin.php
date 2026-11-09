<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ShopController;
use App\Http\Controllers\Admin\ShopOwnerController;
use App\Http\Controllers\Admin\SubcategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authenticated Dashboard Redirect
Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    if ($user?->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    }

    if ($user?->hasRole('shop_owner')) {
        return redirect()->route('owner.products.index');
    }

    return redirect()->route('home');
})->middleware(['auth'])->name('dashboard');

// Admin Protected Routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function (): void {
    Route::get('/', fn () => redirect()->route('admin.dashboard'));
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Shop Management (CRUD)
    Route::resource('shops', ShopController::class)->except(['create', 'show', 'edit']);

    // Shop Owner Accounts (Create & Manage)
    Route::resource('shop-owners', ShopOwnerController::class)->except(['create', 'show', 'edit']);

    // Product Management (Shared Catalog CRUD)
    Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);

    // Categories & Subcategories
    Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
    Route::resource('subcategories', SubcategoryController::class)->except(['create', 'show', 'edit']);
});
