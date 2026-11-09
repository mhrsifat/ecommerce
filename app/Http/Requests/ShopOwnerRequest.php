<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ShopOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $shopOwner = $this->route('shop_owner');
        $userId = $shopOwner instanceof User ? $shopOwner->id : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => $shopOwner
                ? ['nullable', 'string', Password::defaults(), 'confirmed']
                : ['required', 'string', Password::defaults(), 'confirmed'],
            'shop_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
