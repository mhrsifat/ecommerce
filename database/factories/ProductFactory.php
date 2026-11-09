<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        /** @var array<string> $words */
        $words = fake()->unique()->words(3);
        $name = implode(' ', $words);
        $price = fake()->randomFloat(2, 20, 500);

        return [
            'category_id' => Category::factory(),
            'subcategory_id' => function (array $attributes) {
                return Subcategory::factory()->create([
                    'category_id' => $attributes['category_id'],
                ])->id;
            },
            'created_by_id' => null,
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'image' => 'products/sample.jpg',
            'old_price' => $price + 20,
            'new_price' => $price,
        ];
    }
}
