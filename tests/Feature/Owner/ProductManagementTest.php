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

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

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

        $this->owner1 = User::where('email', 'rahim@shop.com')->first();
        $this->owner2 = User::where('email', 'fatima@shop.com')->first();

        $this->shop1 = Shop::create([
            'user_id' => $this->owner1->id,
            'name' => 'Rahim Gadgets',
            'slug' => 'rahim-gadgets',
            'is_active' => true,
        ]);

        $this->shop2 = Shop::create([
            'user_id' => $this->owner2->id,
            'name' => 'Fatima Store',
            'slug' => 'fatima-store',
            'is_active' => true,
        ]);

        $this->category = Category::create(['name' => 'Gaming', 'slug' => 'gaming']);
        $this->subcategory = Subcategory::create([
            'category_id' => $this->category->id,
            'name' => 'Peripherals',
            'slug' => 'peripherals',
        ]);
    }

    public function test_shop_owner_can_create_product_which_becomes_available_in_shared_catalog(): void
    {
        Storage::fake('public');

        $image = UploadedFile::fake()->image('custom_mouse.jpg');

        $response = $this->actingAs($this->owner1)->post(route('owner.products.store'), [
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'name' => 'Pro Ergonomic Gaming Mouse',
            'description' => 'Flagship optical sensor 26000 DPI gaming mouse with ultra-light chassis.',
            'price' => '69.99',
            'old_price' => '89.99',
            'details' => 'Special Rahim Gadgets edition with braided gold-plated cable.',
            'stock' => 30,
            'image' => $image,
        ]);

        $response->assertRedirect(route('owner.products.index'));

        // 1. Verify product exists in shared catalog
        $this->assertDatabaseHas('products', [
            'name' => 'Pro Ergonomic Gaming Mouse',
            'created_by_id' => $this->owner1->id,
            'new_price' => '69.99',
        ]);

        $product = Product::where('slug', 'pro-ergonomic-gaming-mouse')->first();
        $this->assertNotNull($product);
        $this->assertEquals($this->owner1->id, $product->created_by_id);

        // 2. Verify product is listed in shop1
        $this->assertDatabaseHas('shop_products', [
            'shop_id' => $this->shop1->id,
            'product_id' => $product->id,
            'price' => '69.99',
            'stock' => 30,
        ]);

        // 3. Verify other shop owner (owner2) can see this product in the shared catalog!
        $catalogResponse = $this->actingAs($this->owner2)->get(route('owner.catalog.index'));
        $catalogResponse->assertOk();
        $catalogResponse->assertSee('Pro Ergonomic Gaming Mouse');
    }

    public function test_shop_owner_can_modify_price_details_and_thumbnail_for_their_own_shop(): void
    {
        Storage::fake('public');

        $product = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'name' => 'Universal Bluetooth Controller',
            'slug' => 'universal-bluetooth-controller',
            'description' => 'Original description',
            'image' => 'products/ctrl.jpg',
            'new_price' => '40.00',
        ]);

        $shopProduct = ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $product->id,
            'price' => '40.00',
            'old_price' => '50.00',
            'details' => 'Original shop notes',
            'stock' => 20,
            'is_active' => true,
        ]);

        $newThumb = UploadedFile::fake()->image('updated_thumb.jpg');

        $response = $this->actingAs($this->owner1)->put(
            route('owner.products.update', $shopProduct),
            [
                'price' => '34.99', // Modified price!
                'old_price' => '45.00',
                'details' => 'Updated shop warranty: 1-year swap guarantee included.',
                'stock' => 15,
                'is_active' => true,
                'thumbnail' => $newThumb,
            ]
        );

        $response->assertRedirect();

        $shopProduct->refresh();
        $this->assertEquals('34.99', $shopProduct->price);
        $this->assertEquals('Updated shop warranty: 1-year swap guarantee included.', $shopProduct->details);
        $this->assertEquals(15, $shopProduct->stock);
        $this->assertNotNull($shopProduct->thumbnail);
        Storage::disk('public')->assertExists($shopProduct->thumbnail);
    }

    public function test_shop_owner_cannot_modify_another_shops_listing(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'name' => 'RGB Mousepad',
            'slug' => 'rgb-mousepad',
            'description' => 'Desc',
            'image' => 'pad.jpg',
            'new_price' => '20.00',
        ]);

        $shop2Listing = ShopProduct::create([
            'shop_id' => $this->shop2->id,
            'product_id' => $product->id,
            'price' => '25.00',
            'stock' => 10,
            'is_active' => true,
        ]);

        // Owner 1 attempts to modify Owner 2's listing
        $response = $this->actingAs($this->owner1)->put(
            route('owner.products.update', $shop2Listing),
            [
                'price' => '5.00',
                'stock' => 10,
            ]
        );

        $response->assertForbidden();
    }

    public function test_shop_owner_can_unlist_product_without_deleting_from_shared_catalog(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'name' => 'Studio Monitor Speakers',
            'slug' => 'studio-monitor-speakers',
            'description' => 'High quality studio sound',
            'image' => 'products/speakers.jpg',
            'new_price' => '299.00',
        ]);

        $shopListing = ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $product->id,
            'price' => '280.00',
            'stock' => 5,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->owner1)->delete(route('owner.products.destroy', $shopListing));

        $response->assertRedirect();

        // Listing deleted from shop1
        $this->assertDatabaseMissing('shop_products', ['id' => $shopListing->id]);

        // Product still exists in the shared catalog!
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_authenticated_shop_owner_is_redirected_to_products_index(): void
    {
        $response = $this->actingAs($this->owner1)->get(route('dashboard'));

        $response->assertRedirect(route('owner.products.index'));

        $ownerPrefixResponse = $this->actingAs($this->owner1)->get('/owner');
        $ownerPrefixResponse->assertRedirect(route('owner.products.index'));
    }

    public function test_shop_owner_can_view_my_shop_products_page(): void
    {
        $response = $this->actingAs($this->owner1)->get(route('owner.products.index'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('owner/products/index')
                ->has('shop')
                ->has('shopProducts')
                ->has('categories')
            );
    }

    public function test_shop_owner_can_view_and_update_shop_settings(): void
    {
        $response = $this->actingAs($this->owner1)->get(route('owner.shop.edit'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('owner/shop/edit')
                ->has('shop')
            );

        $updateResponse = $this->actingAs($this->owner1)->put(route('owner.shop.update'), [
            'name' => 'Updated Rahim Tech Hub',
            'description' => 'Top gadget retail store in Dhaka',
            'phone' => '+8801700000000',
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('shops', [
            'id' => $this->shop1->id,
            'name' => 'Updated Rahim Tech Hub',
            'phone' => '+8801700000000',
        ]);
    }
}
