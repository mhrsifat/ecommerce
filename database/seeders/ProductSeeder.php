<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds for products and real raster images.
     */
    public function run(): void
    {
        if (Category::count() === 0) {
            $this->call(CategorySeeder::class);
        }

        Storage::disk('public')->makeDirectory('products');

        $products = [
            // Electronics -> Smartphones & Tablets
            [
                'category' => 'Electronics',
                'subcategory' => 'Smartphones & Tablets',
                'name' => 'Flagship Pro Smartphone 256GB',
                'description' => 'High-performance flagship smartphone featuring a brilliant AMOLED display, versatile camera system, and all-day battery life.',
                'old_price' => '1099.99',
                'new_price' => '949.99',
                'image_url' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
                'color' => '#2563eb',
            ],
            [
                'category' => 'Electronics',
                'subcategory' => 'Smartphones & Tablets',
                'name' => 'Ultra Slim Tablet 11-inch',
                'description' => 'Ultra-thin, lightweight tablet engineered for high productivity, digital sketching, and high-resolution streaming.',
                'old_price' => '649.99',
                'new_price' => '549.99',
                'image_url' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
                'color' => '#0284c7',
            ],

            // Electronics -> Audio & Wearables
            [
                'category' => 'Electronics',
                'subcategory' => 'Audio & Wearables',
                'name' => 'Noise Cancelling Wireless Headphones',
                'description' => 'Over-ear headphones delivering supreme comfort, active noise cancellation, and high-fidelity acoustic performance.',
                'old_price' => '299.99',
                'new_price' => '229.99',
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
                'color' => '#4f46e5',
            ],
            [
                'category' => 'Electronics',
                'subcategory' => 'Audio & Wearables',
                'name' => 'Smart Fitness Watch Series 5',
                'description' => 'Next-generation fitness smartwatch with heart rate monitoring, GPS tracking, and comprehensive sleep analytics.',
                'old_price' => '199.99',
                'new_price' => '159.99',
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                'color' => '#0891b2',
            ],

            // Fashion & Apparel -> Men's Clothing
            [
                'category' => 'Fashion & Apparel',
                'subcategory' => "Men's Clothing",
                'name' => 'Classic Cotton Oxford Shirt',
                'description' => 'Tailored fit button-down oxford shirt crafted from 100% breathable organic cotton for everyday versatility.',
                'old_price' => '59.99',
                'new_price' => '44.99',
                'image_url' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
                'color' => '#7c3aed',
            ],
            [
                'category' => 'Fashion & Apparel',
                'subcategory' => "Men's Clothing",
                'name' => 'Slim Fit Stretch Denim Jeans',
                'description' => 'Modern slim fit jeans crafted with durable stretch cotton denim for effortless movement and timeless style.',
                'old_price' => '79.99',
                'new_price' => '59.99',
                'image_url' => 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
                'color' => '#6366f1',
            ],

            // Fashion & Apparel -> Women's Clothing
            [
                'category' => 'Fashion & Apparel',
                'subcategory' => "Women's Clothing",
                'name' => 'Elegant Floral Midi Dress',
                'description' => 'Charming floral print midi dress featuring a flattering waist tie and flowy silhouette perfect for any occasion.',
                'old_price' => '89.99',
                'new_price' => '69.99',
                'image_url' => 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
                'color' => '#db2777',
            ],
            [
                'category' => 'Fashion & Apparel',
                'subcategory' => "Women's Clothing",
                'name' => 'Lightweight Knit Cardigan Sweater',
                'description' => 'Soft fine-knit cardigan designed for easy seasonal layering with subtle rib-knit cuffs and hem.',
                'old_price' => '69.99',
                'new_price' => '49.99',
                'image_url' => 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80',
                'color' => '#e11d48',
            ],

            // Home & Appliances -> Kitchen Appliances
            [
                'category' => 'Home & Appliances',
                'subcategory' => 'Kitchen Appliances',
                'name' => 'Multi-Function Digital Air Fryer 6L',
                'description' => 'Healthier cooking made easy with rapid 360-degree air circulation, multiple one-touch presets, and nonstick basket.',
                'old_price' => '149.99',
                'new_price' => '119.99',
                'image_url' => 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80',
                'color' => '#059669',
            ],
            [
                'category' => 'Home & Appliances',
                'subcategory' => 'Kitchen Appliances',
                'name' => 'Automatic Espresso Coffee Machine',
                'description' => 'Compact 15-bar Italian pump espresso machine equipped with an adjustable milk frother for barista-level drinks.',
                'old_price' => '349.99',
                'new_price' => '289.99',
                'image_url' => 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=800&auto=format&fit=crop&q=80',
                'color' => '#10b981',
            ],

            // Home & Appliances -> Smart Home Devices
            [
                'category' => 'Home & Appliances',
                'subcategory' => 'Smart Home Devices',
                'name' => 'Smart Robot Vacuum Cleaner',
                'description' => 'LiDAR-assisted robotic vacuum with scheduled cleaning routines, strong suction power, and automatic dock recharging.',
                'old_price' => '399.99',
                'new_price' => '299.99',
                'image_url' => 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
                'color' => '#0d9488',
            ],
            [
                'category' => 'Home & Appliances',
                'subcategory' => 'Smart Home Devices',
                'name' => 'Voice-Controlled Smart LED Lamp',
                'description' => 'Adjustable color ambiance smart desk lamp with voice assistant compatibility and customizable lighting schedules.',
                'old_price' => '49.99',
                'new_price' => '34.99',
                'image_url' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
                'color' => '#14b8a6',
            ],
        ];

        foreach ($products as $productData) {
            $category = Category::where('name', $productData['category'])->firstOrFail();
            $subcategory = Subcategory::where('name', $productData['subcategory'])
                ->where('category_id', $category->id)
                ->firstOrFail();

            $slug = Str::slug($productData['name']);
            $imagePath = $this->ensureProductImage(
                slug: $slug,
                imageUrl: $productData['image_url'],
                productName: $productData['name'],
                categoryName: $category->name,
                accentColor: $productData['color']
            );

            Product::updateOrCreate(
                [
                    'category_id' => $category->id,
                    'subcategory_id' => $subcategory->id,
                    'name' => $productData['name'],
                ],
                [
                    'slug' => $slug,
                    'description' => $productData['description'],
                    'image' => $imagePath,
                    'old_price' => $productData['old_price'],
                    'new_price' => $productData['new_price'],
                ]
            );
        }
    }

    /**
     * Download or generate a real raster (.jpg) image for the product.
     */
    protected function ensureProductImage(
        string $slug,
        string $imageUrl,
        string $productName,
        string $categoryName,
        string $accentColor
    ): string {
        $imagePath = 'products/'.$slug.'.jpg';

        if (Storage::disk('public')->exists($imagePath)) {
            return $imagePath;
        }

        try {
            $response = Http::withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->timeout(4)
                ->get($imageUrl);

            if ($response->successful() && strlen($response->body()) > 1000) {
                Storage::disk('public')->put($imagePath, $response->body());

                return $imagePath;
            }
        } catch (\Throwable) {
            // Fall back to GD raster image generator if offline or network times out
        }

        $fallbackJpg = $this->generateFallbackJpg($productName, $categoryName, $accentColor);
        Storage::disk('public')->put($imagePath, $fallbackJpg);

        return $imagePath;
    }

    /**
     * Generate a modern, elegant JPEG placeholder raster image.
     */
    protected function generateFallbackJpg(string $productName, string $categoryName, string $accentHex): string
    {
        $width = 800;
        $height = 600;
        $image = imagecreatetruecolor($width, $height);

        $hex = ltrim($accentHex, '#');
        $r = max(0, min(255, (int) hexdec(substr($hex, 0, 2))));
        $g = max(0, min(255, (int) hexdec(substr($hex, 2, 2))));
        $b = max(0, min(255, (int) hexdec(substr($hex, 4, 2))));

        $bgColor = imagecolorallocate($image, 15, 23, 42);
        $cardColor = imagecolorallocate($image, 30, 41, 59);
        $accentColor = imagecolorallocate($image, $r, $g, $b);
        $textColor = imagecolorallocate($image, 248, 250, 252);
        $mutedColor = imagecolorallocate($image, 148, 163, 184);

        $bgColor = $bgColor === false ? 0 : $bgColor;
        $cardColor = $cardColor === false ? 0 : $cardColor;
        $accentColor = $accentColor === false ? 0 : $accentColor;
        $textColor = $textColor === false ? 0 : $textColor;
        $mutedColor = $mutedColor === false ? 0 : $mutedColor;

        imagefilledrectangle($image, 0, 0, $width, $height, $bgColor);
        imagefilledrectangle($image, 60, 50, $width - 60, $height - 50, $cardColor);
        imagerectangle($image, 60, 50, $width - 60, $height - 50, $accentColor);

        // Accent badge bar
        imagefilledrectangle($image, 340, 100, 460, 106, $accentColor);

        // Category header text
        $catText = strtoupper($categoryName);
        imagestring($image, 4, (int) (($width - strlen($catText) * 8) / 2), 170, $catText, $accentColor);

        // Product title text
        $title = strlen($productName) > 35 ? substr($productName, 0, 32).'...' : $productName;
        imagestring($image, 5, (int) (($width - strlen($title) * 9) / 2), 260, $title, $textColor);

        // Tagline text
        $sub = 'Authentic Store Collection';
        imagestring($image, 3, (int) (($width - strlen($sub) * 7) / 2), 320, $sub, $mutedColor);

        ob_start();
        imagejpeg($image, null, 85);
        $imageData = (string) ob_get_clean();

        return $imageData;
    }
}
