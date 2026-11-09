<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubcategoryRequest;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubcategoryController extends Controller
{
    /**
     * Display a listing of subcategories.
     */
    public function index(): Response
    {
        $subcategories = Subcategory::with('category:id,name,slug')
            ->withCount('products')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/subcategories/index', [
            'subcategories' => $subcategories,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created subcategory.
     */
    public function store(SubcategoryRequest $request): RedirectResponse
    {
        Subcategory::create($request->validated());

        return redirect()->route('admin.subcategories.index')->with('success', 'Subcategory created successfully.');
    }

    /**
     * Update the specified subcategory.
     */
    public function update(SubcategoryRequest $request, Subcategory $subcategory): RedirectResponse
    {
        $subcategory->update($request->validated());

        return redirect()->route('admin.subcategories.index')->with('success', 'Subcategory updated successfully.');
    }

    /**
     * Remove the specified subcategory.
     */
    public function destroy(Subcategory $subcategory): RedirectResponse
    {
        if ($subcategory->products()->exists()) {
            return back()->with('error', 'Cannot delete this subcategory because it contains associated products.');
        }

        $subcategory->delete();

        return back()->with('success', 'Subcategory deleted successfully.');
    }
}
