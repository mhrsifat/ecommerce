<?php

namespace Tests\Feature\Owner;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\Subcategory;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $owner1;

    protected User $owner2;

    protected Shop $shop1;

    protected Shop $shop2;

    protected Category $category;

    protected Subcategory $subcategory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);

        $this->admin = User::role('admin')->first();
        $this->owner1 = User::where('email', 'rahim@shop.com')->first();
        $this->owner2 = User::where('email', 'fatima@shop.com')->first();

        $this->shop1 = Shop::create([
            'user_id' => $this->owner1->id,
            'name' => 'Shop One',
            'slug' => 'shop-one',
            'is_active' => true,
        ]);

        $this->shop2 = Shop::create([
            'user_id' => $this->owner2->id,
            'name' => 'Shop Two',
            'slug' => 'shop-two',
            'is_active' => true,
        ]);

        $this->category = Category::create(['name' => 'Tech', 'slug' => 'tech']);
        $this->subcategory = Subcategory::create([
            'category_id' => $this->category->id,
            'name' => 'Audio',
            'slug' => 'audio',
        ]);
    }

    public function test_shop_owners_can_browse_shared_catalog(): void
    {
        // Admin creates a product in catalog
        $adminProduct = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'created_by_id' => $this->admin->id,
            'name' => 'Admin Created Headphones',
            'slug' => 'admin-headphones',
            'description' => 'Great headphones',
            'image' => 'products/hp.jpg',
            'new_price' => '150.00',
        ]);

        // Owner 2 creates a product in catalog
        $owner2Product = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'created_by_id' => $this->owner2->id,
            'name' => 'Owner 2 Wireless Mic',
            'slug' => 'owner-2-mic',
            'description' => 'Super clear mic',
            'image' => 'products/mic.jpg',
            'new_price' => '85.00',
        ]);

        // Owner 1 browses the catalog
        $response = $this->actingAs($this->owner1)->get(route('owner.catalog.index'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('owner/catalog/index')
                ->has('shop')
                ->has('products')
                ->has('categories')
            );
    }

    public function test_shop_owner_can_add_catalog_product_to_shop_with_custom_price_and_details(): void
    {
        Storage::fake('public');

        $catalogProduct = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'created_by_id' => $this->admin->id,
            'name' => 'Ultra HD Webcam 4K',
            'slug' => 'ultra-hd-webcam-4k',
            'description' => 'Original catalog description',
            'image' => 'products/webcam.jpg',
            'old_price' => '120.00',
            'new_price' => '99.00',
        ]);

        $fakeThumbnail = UploadedFile::fake()->image('custom_thumb.jpg');

        $response = $this->actingAs($this->owner1)->post(
            route('owner.catalog.add', $catalogProduct),
            [
                'price' => '89.99', // Custom shop price!
                'old_price' => '115.00',
                'details' => 'Shop One exclusive: Includes 2-year warranty and free tripod.', // Custom details!
                'stock' => 50,
                'is_active' => true,
                'thumbnail' => $fakeThumbnail, // Custom thumbnail!
            ]
        );

        $response->assertRedirect();

        $this->assertDatabaseHas('shop_products', [
            'shop_id' => $this->shop1->id,
            'product_id' => $catalogProduct->id,
            'price' => '89.99',
            'old_price' => '115.00',
            'details' => 'Shop One exclusive: Includes 2-year warranty and free tripod.',
            'stock' => 50,
            'is_active' => true,
        ]);

        $shopProduct = ShopProduct::where('shop_id', $this->shop1->id)->where('product_id', $catalogProduct->id)->first();
        $this->assertNotNull($shopProduct->thumbnail);
        Storage::disk('public')->assertExists($shopProduct->thumbnail);
    }

    public function test_shop_owner_can_add_catalog_product_using_numeric_id_url(): void
    {
        $catalogProduct = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'created_by_id' => $this->admin->id,
            'name' => 'Studio Microphone Pro',
            'slug' => 'studio-microphone-pro',
            'description' => 'Original mic description',
            'image' => 'products/mic.jpg',
            'new_price' => '150.00',
        ]);

        $response = $this->actingAs($this->owner1)->post(
            "/owner/catalog/{$catalogProduct->id}/add",
            [
                'price' => '139.99',
                'details' => 'Custom mic description',
                'stock' => 20,
                'is_active' => true,
            ]
        );

        $response->assertRedirect();

        $this->assertDatabaseHas('shop_products', [
            'shop_id' => $this->shop1->id,
            'product_id' => $catalogProduct->id,
            'price' => '139.99',
        ]);
    }
}
