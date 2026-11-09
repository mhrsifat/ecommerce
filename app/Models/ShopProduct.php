<?php

namespace App\Models;

use Database\Factories\ShopProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $shop_id
 * @property int $product_id
 * @property string $price
 * @property string|null $old_price
 * @property string|null $details
 * @property string|null $thumbnail
 * @property int $stock
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $thumbnail_url
 * @property-read string $display_details
 * @property-read int|null $discount_percentage
 * @property-read Shop $shop
 * @property-read Product $product
 */
class ShopProduct extends Model
{
    /** @use HasFactory<ShopProductFactory> */
    use HasFactory;

    protected $table = 'shop_products';

    protected $fillable = [
        'shop_id',
        'product_id',
        'price',
        'old_price',
        'details',
        'thumbnail',
        'stock',
        'is_active',
    ];

    protected $appends = [
        'thumbnail_url',
        'display_details',
        'discount_percentage',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'old_price' => 'decimal:2',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the shop that owns this product listing.
     *
     * @return BelongsTo<Shop, $this>
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get the catalog product for this listing.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the thumbnail URL for the shop product (falls back to catalog image).
     */
    public function getThumbnailUrlAttribute(): string
    {
        if (! empty($this->thumbnail) && Storage::disk('public')->exists($this->thumbnail)) {
            return Storage::disk('public')->url($this->thumbnail);
        }

        return $this->product->image_url;
    }

    /**
     * Get the shop product details (falls back to product description).
     */
    public function getDisplayDetailsAttribute(): string
    {
        if (! empty($this->details)) {
            return $this->details;
        }

        return $this->product->description;
    }

    /**
     * Calculate discount percentage if old price is greater than new price.
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if ($this->old_price !== null && (float) $this->old_price > (float) $this->price && (float) $this->old_price > 0) {
            return (int) round((((float) $this->old_price - (float) $this->price) / (float) $this->old_price) * 100);
        }

        return null;
    }
}
