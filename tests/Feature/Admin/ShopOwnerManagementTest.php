<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ShopOwnerManagementTest extends TestCase
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

    public function test_non_admins_cannot_manage_shop_owners(): void
    {
        $this->actingAs($this->shopOwner)
            ->get(route('admin.shop-owners.index'))
            ->assertForbidden();
    }

    public function test_admin_can_view_shop_owners_list(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.shop-owners.index'));

        $response->assertOk();
    }

    public function test_admin_can_create_a_shop_owner_account(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.shop-owners.store'), [
            'name' => 'Tariq Rahman',
            'email' => 'tariq@shopowner.com',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
        ]);

        $response->assertRedirect(route('admin.shop-owners.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'Tariq Rahman',
            'email' => 'tariq@shopowner.com',
        ]);

        $user = User::where('email', 'tariq@shopowner.com')->first();
        $this->assertTrue($user->hasRole('shop_owner'));
        $this->assertTrue(Hash::check('secret1234', $user->password));
    }

    public function test_admin_can_create_shop_owner_with_automatic_shop_creation(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.shop-owners.store'), [
            'name' => 'Salma Khatun',
            'email' => 'salma@crafts.com',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
            'shop_name' => 'Salma Artisan Crafts',
        ]);

        $response->assertRedirect(route('admin.shop-owners.index'));

        $user = User::where('email', 'salma@crafts.com')->first();
        $this->assertNotNull($user);

        $this->assertDatabaseHas('shops', [
            'user_id' => $user->id,
            'name' => 'Salma Artisan Crafts',
        ]);
    }

    public function test_admin_can_update_shop_owner_account(): void
    {
        $response = $this->actingAs($this->admin)->put(route('admin.shop-owners.update', $this->shopOwner), [
            'name' => 'Updated Owner Name',
            'email' => 'updated_owner@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertRedirect(route('admin.shop-owners.index'));

        $this->shopOwner->refresh();
        $this->assertEquals('Updated Owner Name', $this->shopOwner->name);
        $this->assertEquals('updated_owner@example.com', $this->shopOwner->email);
        $this->assertTrue(Hash::check('newpassword123', $this->shopOwner->password));
    }

    public function test_admin_can_delete_a_shop_owner_account(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('shop_owner');

        $response = $this->actingAs($this->admin)->delete(route('admin.shop-owners.destroy', $owner));

        $response->assertRedirect(route('admin.shop-owners.index'));
        $this->assertDatabaseMissing('users', ['id' => $owner->id]);
    }
}
