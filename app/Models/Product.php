<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $category_id
 * @property int $subcategory_id
 * @property int|null $created_by_id
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property string $image
 * @property string|null $old_price
 * @property string $new_price
 * @property-read string $image_url
 * @property-read int|null $discount_percentage
 * @property-read User|null $creator
 * @property bool|null $is_in_shop
 * @property ShopProduct|null $shop_product
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Product extends Model
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
        'subcategory_id',
        'created_by_id',
        'name',
        'slug',
        'description',
        'image',
        'old_price',
        'new_price',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'image_url',
        'discount_percentage',
        'path',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_price' => 'decimal:2',
            'new_price' => 'decimal:2',
        ];
    }

    /**
     * Get the category that owns the product.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the subcategory that owns the product.
     *
     * @return BelongsTo<Subcategory, $this>
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Get the user who created this product in the shared catalog.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * Get all shop listings for this product.
     *
     * @return HasMany<ShopProduct, $this>
     */
    public function shopProducts(): HasMany
    {
        return $this->hasMany(ShopProduct::class);
    }

    /**
     * Get all shops that have added this product.
     *
     * @return BelongsToMany<Shop, $this>
     */
    public function shops(): BelongsToMany
    {
        return $this->belongsToMany(Shop::class, 'shop_products')
            ->withPivot(['id', 'price', 'old_price', 'details', 'thumbnail', 'stock', 'is_active'])
            ->withTimestamps();
    }

    /**
     * Scope a query to only include products assigned to at least one active shop.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeAssignedToActiveShop(Builder $query): Builder
    {
        return $query->whereHas('shopProducts', function (Builder $q): void {
            $q->where('is_active', true)
                ->whereHas('shop', function (Builder $sq): void {
                    $sq->where('is_active', true);
                });
        });
    }

    /**
     * Get the publicly accessible URL for the product image.
     */
    public function getImageUrlAttribute(): string
    {
        if (! empty($this->image) && Storage::disk('public')->exists($this->image)) {
            return Storage::disk('public')->url($this->image);
        }

        return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="18">No Image Available</text></svg>';
    }

    /**
     * Calculate the discount percentage if an old price exists and is higher than the new price.
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if ($this->old_price !== null && (float) $this->old_price > (float) $this->new_price && (float) $this->old_price > 0) {
            return (int) round((((float) $this->old_price - (float) $this->new_price) / (float) $this->old_price) * 100);
        }

        return null;
    }

    /**
     * Get the relative canonical URL path for the product.
     */
    public function getPathAttribute(): string
    {
        return "/products/{$this->slug}";
    }
}
