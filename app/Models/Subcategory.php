<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property string $name
 * @property string $slug
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Subcategory extends Model
{
    /** @use HasFactory<Factory<self>> */
    use HasFactory, HasUniqueSlug;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'name',
        'slug',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'path',
    ];

    /**
     * Get the relative canonical URL path for the subcategory.
     */
    public function getPathAttribute(): string
    {
        $categorySlug = $this->category?->slug;

        if (! $categorySlug) {
            $this->loadMissing('category:id,slug');
            $categorySlug = $this->category?->slug;
        }

        if ($categorySlug) {
            return "/categories/{$categorySlug}/{$this->slug}";
        }

        return "/categories/{$this->slug}";
    }

    /**
     * Get the parent category.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the products for the subcategory.
     *
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
