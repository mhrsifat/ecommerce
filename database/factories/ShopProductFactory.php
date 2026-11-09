<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShopProduct>
 */
class ShopProductFactory extends Factory
{
    protected $model = ShopProduct::class;

    public function definition(): array
    {
        $price = fake()->randomFloat(2, 15, 450);

        return [
            'shop_id' => Shop::factory(),
            'product_id' => Product::factory(),
            'price' => $price,
            'old_price' => $price + 25,
            'details' => fake()->sentence(8),
            'thumbnail' => null,
            'stock' => fake()->numberBetween(10, 100),
            'is_active' => true,
        ];
    }
}
