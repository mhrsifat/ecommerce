<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds for categories and subcategories.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'subcategories' => [
                    'Smartphones & Tablets',
                    'Audio & Wearables',
                ],
            ],
            [
                'name' => 'Fashion & Apparel',
                'subcategories' => [
                    "Men's Clothing",
                    "Women's Clothing",
                ],
            ],
            [
                'name' => 'Home & Appliances',
                'subcategories' => [
                    'Kitchen Appliances',
                    'Smart Home Devices',
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = Category::firstOrCreate([
                'name' => $categoryData['name'],
            ]);

            foreach ($categoryData['subcategories'] as $subcategoryName) {
                Subcategory::firstOrCreate([
                    'category_id' => $category->id,
                    'name' => $subcategoryName,
                ]);
            }
        }
    }
}
