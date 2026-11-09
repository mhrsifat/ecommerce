<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShopOwnerRequest;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ShopOwnerController extends Controller
{
    /**
     * Display a listing of shop owners.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $shopOwners = User::role('shop_owner')
            ->with(['shops:id,user_id,name,slug,is_active'])
            ->withCount('shops')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/shop-owners/index', [
            'shopOwners' => $shopOwners,
            'filters' => [
                'search' => $search !== '' ? $search : null,
            ],
        ]);
    }

    /**
     * Store a newly created shop owner.
     */
    public function store(ShopOwnerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $user->assignRole('shop_owner');

        if (! empty($validated['shop_name'])) {
            Shop::create([
                'user_id' => $user->id,
                'name' => $validated['shop_name'],
                'is_active' => true,
            ]);
        }

        return redirect()->route('admin.shop-owners.index')->with('success', 'Shop owner account created successfully.');
    }

    /**
     * Update the specified shop owner.
     */
    public function update(ShopOwnerRequest $request, User $shopOwner): RedirectResponse
    {
        $validated = $request->validated();

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $shopOwner->update($userData);

        return redirect()->route('admin.shop-owners.index')->with('success', 'Shop owner account updated successfully.');
    }

    /**
     * Remove the specified shop owner.
     */
    public function destroy(User $shopOwner): RedirectResponse
    {
        // Prevent deleting admin accounts
        if ($shopOwner->hasRole('admin')) {
            return back()->with('error', 'Cannot delete an administrator account.');
        }

        $shopOwner->delete();

        return redirect()->route('admin.shop-owners.index')->with('success', 'Shop owner account deleted successfully.');
    }
}
