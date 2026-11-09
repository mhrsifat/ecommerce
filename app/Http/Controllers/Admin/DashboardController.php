<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\Subcategory;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard summary.
     */
    public function index(): Response
    {
        $stats = [
            'totalShops' => Shop::count(),
            'totalShopOwners' => User::role('shop_owner')->count(),
            'totalCatalogProducts' => Product::count(),
            'totalActiveListings' => ShopProduct::where('is_active', true)->count(),
            'totalCategories' => Category::count(),
            'totalSubcategories' => Subcategory::count(),
        ];

        $recentShops = Shop::with(['owner:id,name,email'])
            ->withCount('products')
            ->latest()
            ->take(5)
            ->get();

        $recentProducts = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'creator:id,name',
        ])
            ->withCount('shopProducts')
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentShops' => $recentShops,
            'recentProducts' => $recentProducts,
        ]);
    }
}
