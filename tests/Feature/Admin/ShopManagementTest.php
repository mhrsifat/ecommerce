<?php

namespace Tests\Feature\Admin;

use App\Models\Shop;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ShopManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $shopOwner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);

        $this->admin = User::role('admin')->first();
        $this->shopOwner = User::role('shop_owner')->first();
    }

    public function test_guests_and_non_admins_cannot_access_shop_management(): void
    {
        $this->get(route('admin.shops.index'))->assertRedirect(route('login'));

        $this->actingAs($this->shopOwner)
            ->get(route('admin.shops.index'))
            ->assertForbidden();
    }

    public function test_admin_can_view_shops_list(): void
    {
        Shop::factory()->create([
            'user_id' => $this->shopOwner->id,
            'name' => 'Demo Alpha Shop',
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.shops.index'));

        $response->assertOk();
    }

    public function test_admin_can_create_a_shop_and_assign_an_owner(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin)->post(route('admin.shops.store'), [
            'name' => 'Apex Electronics',
            'user_id' => $this->shopOwner->id,
            'description' => 'A premier store for consumer electronics.',
            'email' => 'apex@example.com',
            'phone' => '+8801700000000',
            'address' => 'Dhaka, Bangladesh',
            'is_active' => true,
            'logo' => UploadedFile::fake()->image('logo.jpg'),
        ]);

        $response->assertRedirect(route('admin.shops.index'));

        $this->assertDatabaseHas('shops', [
            'name' => 'Apex Electronics',
            'slug' => 'apex-electronics',
            'user_id' => $this->shopOwner->id,
            'email' => 'apex@example.com',
            'is_active' => true,
        ]);

        $shop = Shop::where('slug', 'apex-electronics')->first();
        $this->assertNotNull($shop->logo);
        Storage::disk('public')->assertExists($shop->logo);
    }

    public function test_admin_can_update_shop_details_and_status(): void
    {
        $shop = Shop::create([
            'user_id' => $this->shopOwner->id,
            'name' => 'Original Name',
            'slug' => 'original-name',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.shops.update', $shop), [
            'name' => 'Updated Storefront',
            'user_id' => $this->shopOwner->id,
            'description' => 'Updated description text',
            'is_active' => false,
        ]);

        $response->assertRedirect(route('admin.shops.index'));

        $this->assertDatabaseHas('shops', [
            'id' => $shop->id,
            'name' => 'Updated Storefront',
            'is_active' => false,
        ]);
    }

    public function test_admin_can_delete_a_shop(): void
    {
        $shop = Shop::create([
            'user_id' => $this->shopOwner->id,
            'name' => 'Shop To Delete',
            'slug' => 'shop-to-delete',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.shops.destroy', $shop));

        $response->assertRedirect(route('admin.shops.index'));
        $this->assertDatabaseMissing('shops', ['id' => $shop->id]);
    }
}
