<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use Database\Factories\ShopFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $logo
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $logo_url
 * @property-read User $owner
 */
class Shop extends Model
{
    /** @use HasFactory<ShopFactory> */
    use HasFactory, HasUniqueSlug;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'logo',
        'email',
        'phone',
        'address',
        'is_active',
    ];

    protected $appends = [
        'logo_url',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the owner user of the shop.
     *
     * @return BelongsTo<User, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the shop's product listings.
     *
     * @return HasMany<ShopProduct, $this>
     */
    public function shopProducts(): HasMany
    {
        return $this->hasMany(ShopProduct::class);
    }

    /**
     * The catalog products assigned to this shop.
     *
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'shop_products')
            ->withPivot(['id', 'price', 'old_price', 'details', 'thumbnail', 'stock', 'is_active'])
            ->withTimestamps();
    }

    /**
     * Get the publicly accessible URL for the shop logo.
     */
    public function getLogoUrlAttribute(): string
    {
        if (! empty($this->logo) && Storage::disk('public')->exists($this->logo)) {
            return Storage::disk('public')->url($this->logo);
        }

        $initial = strtoupper(substr($this->name, 0, 1) ?: 'S');

        return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%234f46e5" rx="24"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="80" font-weight="bold">'.$initial.'</text></svg>';
    }
}
