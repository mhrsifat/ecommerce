<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id',
            ],
            'subcategory_id' => [
                'required',
                'integer',
                Rule::exists('subcategories', 'id')->where('category_id', $this->input('category_id')),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'required',
                'string',
            ],
            'new_price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'old_price' => [
                'nullable',
                'numeric',
                'min:0',
                'gt:new_price',
            ],
            'image' => $product
                ? ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048']
                : ['required', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'subcategory_id.exists' => 'The selected subcategory does not belong to the chosen category.',
            'old_price.gt' => 'The old price must be greater than the new selling price.',
        ];
    }
}
