<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        /** @var array<string> $words */
        $words = fake()->unique()->words(2);
        $name = implode(' ', $words);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
        ];
    }
}
