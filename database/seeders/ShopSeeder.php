<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ShopSeeder extends Seeder
{
    /**
     * Run the database seeds for shops and shop-specific product listings.
     */
    public function run(): void
    {
        Storage::disk('public')->makeDirectory('shops');

        $rahim = User::where('email', 'rahim@shop.com')->first();
        $fatima = User::where('email', 'fatima@shop.com')->first();
        $kamal = User::where('email', 'kamal@shop.com')->first();
        $admin = User::where('email', 'admin@admin.com')->first();

        if (! $rahim || ! $fatima || ! $kamal) {
            return;
        }

        // 1. Create Shops
        $shopTechWorld = Shop::firstOrCreate(
            ['slug' => 'techworld-dhaka'],
            [
                'user_id' => $rahim->id,
                'name' => 'TechWorld Dhaka',
                'description' => 'Your premier destination for authentic flagship smartphones, smart wearables, and audio gear with official warranty.',
                'email' => 'sales@techworld.com.bd',
                'phone' => '+8801711223344',
                'address' => 'Level 4, Block C, Bashundhara City, Panthapath, Dhaka',
                'is_active' => true,
            ]
        );

        $shopElegance = Shop::firstOrCreate(
            ['slug' => 'elegance-fashion-boutique'],
            [
                'user_id' => $fatima->id,
                'name' => 'Elegance Fashion Boutique',
                'description' => 'Curated modern fashion, premium breathable fabrics, designer shirts, stylish midi dresses, and timeless apparel.',
                'email' => 'hello@elegancebd.com',
                'phone' => '+8801811556677',
                'address' => 'House 24, Road 11, Banani, Dhaka',
                'is_active' => true,
            ]
        );

        $shopPrimeGadget = Shop::firstOrCreate(
            ['slug' => 'prime-gadget-hub'],
            [
                'user_id' => $kamal->id,
                'name' => 'Prime Gadget Hub',
                'description' => 'Cutting-edge consumer gadgets, smart home automation, and high-performance tech accessories at unbeatable prices.',
                'email' => 'support@primegadget.com',
                'phone' => '+8801911889900',
                'address' => 'Shop 12, Multiplan Center, Elephant Road, Dhaka',
                'is_active' => true,
            ]
        );

        // 2. Add Shop-Created Products to Shared Catalog (Requirement: Shop owners can create products that become available in the catalog)
        $electronicsCat = Category::where('name', 'Electronics')->first();
        $audioSubcat = Subcategory::where('name', 'Audio & Wearables')->first();
        $phonesSubcat = Subcategory::where('name', 'Smartphones & Tablets')->first();
        $menClothingSubcat = Subcategory::where('name', "Men's Clothing")->first();

        // Rahim creates a product in catalog
        $rahimProduct = Product::firstOrCreate(
            ['slug' => 'wireless-mechanical-rgb-keyboard'],
            [
                'category_id' => $electronicsCat?->id,
                'subcategory_id' => $audioSubcat?->id,
                'created_by_id' => $rahim->id,
                'name' => 'Wireless Mechanical RGB Keyboard',
                'description' => 'Compact 75% wireless mechanical gaming keyboard with hot-swappable switches and custom RGB illumination.',
                'old_price' => '129.99',
                'new_price' => '99.99',
                'image' => 'products/mechanical_keyboard.jpg',
            ]
        );

        // Fatima creates a product in catalog
        $fatimaProduct = Product::firstOrCreate(
            ['slug' => 'handcrafted-artisan-leather-jacket'],
            [
                'category_id' => Category::where('name', 'Fashion & Apparel')->first()?->id,
                'subcategory_id' => $menClothingSubcat?->id,
                'created_by_id' => $fatima->id,
                'name' => 'Handcrafted Artisan Leather Jacket',
                'description' => 'Premium genuine lambskin leather motorcycle jacket with quilted satin interior and heavy-duty brass hardware.',
                'old_price' => '349.99',
                'new_price' => '289.99',
                'image' => 'products/leather_jacket.jpg',
            ]
        );

        // 3. Create an Unassigned Catalog Product (Demonstrating: Products NOT assigned to any shop are NEVER visible to customers)
        Product::firstOrCreate(
            ['slug' => 'unassigned-prototype-drone-4k'],
            [
                'category_id' => $electronicsCat?->id,
                'subcategory_id' => $phonesSubcat?->id,
                'created_by_id' => $admin?->id,
                'name' => 'Unassigned Prototype Drone 4K (Warehouse Only)',
                'description' => 'Exclusive factory prototype drone. This product is intentionally NOT assigned to any shop to demonstrate requirement isolation.',
                'old_price' => '1200.00',
                'new_price' => '950.00',
                'image' => 'products/unassigned_drone.jpg',
            ]
        );

        // 4. Assign products to shops with shop-specific prices, details, and thumbnails!
        $allProducts = Product::where('slug', '!=', 'unassigned-prototype-drone-4k')->get();

        foreach ($allProducts as $product) {
            // Assign Tech products to TechWorld
            if ($product->category?->name === 'Electronics' || $product->id === $rahimProduct->id) {
                ShopProduct::firstOrCreate(
                    [
                        'shop_id' => $shopTechWorld->id,
                        'product_id' => $product->id,
                    ],
                    [
                        // Custom shop price (slightly cheaper or adjusted)
                        'price' => number_format((float) $product->new_price * 0.95, 2, '.', ''),
                        'old_price' => $product->old_price,
                        'details' => $product->description.' Includes TechWorld 1-Year Official Replacement Guarantee & Free Express Setup.',
                        'thumbnail' => null, // falls back to product image unless customized
                        'stock' => 25,
                        'is_active' => true,
                    ]
                );
            }

            // Assign Fashion products to Elegance Fashion Boutique
            if ($product->category?->name === 'Fashion & Apparel' || $product->id === $fatimaProduct->id) {
                ShopProduct::firstOrCreate(
                    [
                        'shop_id' => $shopElegance->id,
                        'product_id' => $product->id,
                    ],
                    [
                        'price' => $product->new_price,
                        'old_price' => $product->old_price,
                        'details' => $product->description.' Styled and inspected by Elegance Boutique master stylists.',
                        'thumbnail' => null,
                        'stock' => 15,
                        'is_active' => true,
                    ]
                );
            }

            // Assign some Electronics and Home products to Prime Gadget Hub (overlap with TechWorld with DIFFERENT price!)
            if ($product->category?->name === 'Home & Appliances' || $product->slug === 'flagship-pro-smartphone-256gb' || $product->id === $rahimProduct->id) {
                ShopProduct::firstOrCreate(
                    [
                        'shop_id' => $shopPrimeGadget->id,
                        'product_id' => $product->id,
                    ],
                    [
                        // Prime Gadget Hub has different pricing!
                        'price' => number_format((float) $product->new_price * 0.98, 2, '.', ''),
                        'old_price' => $product->old_price,
                        'details' => $product->description.' Exclusive Prime Gadget Hub deal: includes 24/7 tech priority support.',
                        'thumbnail' => null,
                        'stock' => 40,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
