<?php

namespace App\Http\Controllers\Owner\Concerns;

use App\Models\Shop;
use App\Models\User;

trait ResolvesOwnerShop
{
    /**
     * Resolve or get the primary shop belonging to the merchant.
     */
    protected function resolveShop(User $user): Shop
    {
        return Shop::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $user->name."'s Shop",
                'is_active' => true,
            ]
        );
    }
}
