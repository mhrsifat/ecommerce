<?php

namespace Tests\Feature\Storefront;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\Subcategory;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerViewTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner1;

    protected User $owner2;

    protected Shop $shop1;

    protected Shop $shop2;

    protected Category $category;

    protected Subcategory $subcategory;

    protected Product $assignedProduct;

    protected Product $unassignedProduct;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);

        $this->owner1 = User::where('email', 'rahim@shop.com')->first();
        $this->owner2 = User::where('email', 'fatima@shop.com')->first();

        $this->shop1 = Shop::create([
            'user_id' => $this->owner1->id,
            'name' => 'TechWorld Dhaka',
            'slug' => 'techworld-dhaka',
            'is_active' => true,
        ]);

        $this->shop2 = Shop::create([
            'user_id' => $this->owner2->id,
            'name' => 'Gadget Hub BD',
            'slug' => 'gadget-hub-bd',
            'is_active' => true,
        ]);

        $this->category = Category::create(['name' => 'Computers', 'slug' => 'computers']);
        $this->subcategory = Subcategory::create([
            'category_id' => $this->category->id,
            'name' => 'Laptops',
            'slug' => 'laptops',
        ]);

        // 1. Product assigned to shop1
        $this->assignedProduct = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'name' => 'Active Listed Laptop Pro',
            'slug' => 'active-listed-laptop-pro',
            'description' => 'Catalog description for laptop',
            'image' => 'products/laptop.jpg',
            'new_price' => '1200.00',
        ]);

        ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $this->assignedProduct->id,
            'price' => '1150.00', // Shop1 specific price
            'details' => 'TechWorld Dhaka special: Includes backpack and wireless mouse.',
            'stock' => 10,
            'is_active' => true,
        ]);

        // 2. Product in shared catalog but NOT assigned to ANY shop
        $this->unassignedProduct = Product::create([
            'category_id' => $this->category->id,
            'subcategory_id' => $this->subcategory->id,
            'name' => 'Secret Unassigned Prototype',
            'slug' => 'secret-unassigned-prototype',
            'description' => 'Unlisted factory warehouse device',
            'image' => 'products/proto.jpg',
            'new_price' => '5000.00',
        ]);
    }

    public function test_customers_only_see_products_assigned_to_a_shop_on_homepage(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        // Assigned product is visible
        $response->assertSee('Active Listed Laptop Pro');
        // Unassigned product MUST NOT be visible!
        $response->assertDontSee('Secret Unassigned Prototype');
    }

    public function test_unassigned_products_are_not_visible_in_category_pages(): void
    {
        $response = $this->get("/categories/{$this->category->slug}");

        $response->assertOk();
        $response->assertSee('Active Listed Laptop Pro');
        $response->assertDontSee('Secret Unassigned Prototype');
    }

    public function test_unassigned_products_are_not_visible_in_live_search(): void
    {
        // Search for assigned product -> found
        $assignedSearch = $this->getJson('/search/live?q=Laptop');
        $assignedSearch->assertOk();
        $this->assertGreaterThan(0, $assignedSearch->json('total'));

        // Search for unassigned product -> 0 results!
        $unassignedSearch = $this->getJson('/search/live?q=Secret');
        $unassignedSearch->assertOk();
        $this->assertEquals(0, $unassignedSearch->json('total'));
        $this->assertEmpty($unassignedSearch->json('products'));
    }

    public function test_visiting_unassigned_product_route_returns_not_found(): void
    {
        $response = $this->get("/products/{$this->unassignedProduct->slug}");

        // Renders not-found page because it's not assigned to any shop
        $response->assertOk();
        $response->assertSee('This product is not currently available in any active shop.');
    }

    public function test_customer_view_displays_shop_specific_information_prices_and_thumbnails(): void
    {
        // Also assign the product to shop2 with DIFFERENT price and details!
        ShopProduct::create([
            'shop_id' => $this->shop2->id,
            'product_id' => $this->assignedProduct->id,
            'price' => '1099.00', // Shop2 has cheaper price
            'details' => 'Gadget Hub price match guarantee with free delivery.',
            'stock' => 5,
            'is_active' => true,
        ]);

        // 1. View from Shop 1
        $responseShop1 = $this->get("/shops/{$this->shop1->slug}/products/{$this->assignedProduct->slug}");
        $responseShop1->assertOk();
        $responseShop1->assertSee('1150.00');
        $responseShop1->assertSee('TechWorld Dhaka special: Includes backpack and wireless mouse.');
        $responseShop1->assertSee($this->shop1->name);

        // 2. View from Shop 2
        $responseShop2 = $this->get("/shops/{$this->shop2->slug}/products/{$this->assignedProduct->slug}");
        $responseShop2->assertOk();
        $responseShop2->assertSee('1099.00');
        $responseShop2->assertSee('Gadget Hub price match guarantee with free delivery.');
        $responseShop2->assertSee($this->shop2->name);
    }

    public function test_customer_can_browse_shops_directory_and_individual_shop_storefront(): void
    {
        // Shops Directory
        $dirResponse = $this->get('/shops');
        $dirResponse->assertOk();
        $dirResponse->assertSee('TechWorld Dhaka');
        $dirResponse->assertSee('Gadget Hub BD');

        // Dedicated Shop Storefront Page
        $shopResponse = $this->get("/shops/{$this->shop1->slug}");
        $shopResponse->assertOk();
        $shopResponse->assertSee('TechWorld Dhaka');
        $shopResponse->assertSee('Active Listed Laptop Pro');
    }
}
