<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds for roles, permissions, and initial users.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Roles Setup
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $shopOwnerRole = Role::firstOrCreate(['name' => 'shop_owner', 'guard_name' => 'web']);
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        $permissions = [
            'manage shops',
            'manage shop owners',
            'manage categories',
            'manage subcategories',
            'manage products',
            'manage shop listings',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        $adminRole->syncPermissions($permissions);
        $shopOwnerRole->syncPermissions([
            'manage products',
            'manage shop listings',
        ]);

        // 1. Admin Users
        $adminUser1 = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $adminUser1->syncRoles([$adminRole]);

        $adminUser2 = User::firstOrCreate(
            ['email' => 'admin@csnbangladesh.com'],
            [
                'name' => 'CSN Bangladesh Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $adminUser2->syncRoles([$adminRole]);

        // 2. Demo Shop Owners
        $shopOwners = [
            [
                'name' => 'Rahim Ahmed',
                'email' => 'rahim@shop.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Fatima Zahra',
                'email' => 'fatima@shop.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Kamal Hossain',
                'email' => 'kamal@shop.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($shopOwners as $ownerData) {
            $owner = User::firstOrCreate(
                ['email' => $ownerData['email']],
                $ownerData
            );
            $owner->syncRoles([$shopOwnerRole]);
        }
    }
}
