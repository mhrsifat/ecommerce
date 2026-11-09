import { Head, Link, router } from '@inertiajs/react';
import {
    FilterX,
    Mail,
    MapPin,
    Package,
    Phone,
    Search,
    ShieldCheck,
    Store,
} from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import ShopProductCard from '@/components/shop-product-card';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Category, PaginatedData, Shop, ShopProduct } from '@/types';

type ShopShowProps = {
    shop: Shop;
    shopProducts: PaginatedData<ShopProduct>;
    shopCategories: Category[];
    filters: {
        search?: string | null;
        category?: string | null;
    };
};

export default function ShopShow({
    shop,
    shopProducts,
    shopCategories = [],
    filters,
}: ShopShowProps) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search.trim()) params.search = search.trim();
        if (filters.category) params.category = filters.category;

        router.get(`/shops/${shop.slug}`, params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryFilter = (categorySlug: string | null) => {
        const params: Record<string, string> = {};
        if (search.trim()) params.search = search.trim();
        if (categorySlug) params.category = categorySlug;

        router.get(`/shops/${shop.slug}`, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        router.get(`/shops/${shop.slug}`, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <ShopLayout>
            <Head title={`${shop.name} Storefront — Products, Prices & Deals`} />

            <div className="flex flex-col gap-8 max-w-7xl mx-auto">
                {/* 1. Shop Header Profile Banner */}
                <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-secondary/15 p-6 sm:p-10">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <img
                                src={shop.logo_url}
                                alt={shop.name}
                                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border bg-card object-cover shadow-sm shrink-0"
                            />
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        {shop.name}
                                    </h1>
                                    <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Verified Store
                                    </Badge>
                                </div>

                                <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                                    {shop.description || 'Welcome to our verified merchant storefront. Browse authentic products with exclusive warranties.'}
                                </p>

                                {/* Contact & Location Badges */}
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    {shop.address && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                            {shop.address}
                                        </span>
                                    )}
                                    {shop.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                                            {shop.phone}
                                        </span>
                                    )}
                                    {shop.email && (
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                                            {shop.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                            <div className="text-2xl font-extrabold text-foreground">
                                {shopProducts.total}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Active products listed
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Store Catalog Filters & Search */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">
                                {filters.category
                                    ? `Products in Category: ${filters.category}`
                                    : `All Products by ${shop.name}`}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Showing {shopProducts.total} shop-specific items with custom pricing & availability
                            </p>
                        </div>

                        {/* Search in this shop */}
                        <div className="flex items-center gap-2">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={`Search in ${shop.name}...`}
                                        className="pl-9 h-9 text-xs w-48 sm:w-64"
                                    />
                                </div>
                                <Button type="submit" variant="secondary" size="sm" className="text-xs">
                                    Search
                                </Button>
                            </form>

                            {(filters.category || filters.search) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="gap-1 text-xs"
                                >
                                    <FilterX className="h-3.5 w-3.5" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Shop Categories Tabs */}
                    {shopCategories.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleCategoryFilter(null)}
                                className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                                    !filters.category
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                }`}
                            >
                                All Categories
                            </button>
                            {shopCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryFilter(cat.slug)}
                                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                                        filters.category === cat.slug
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Products Grid */}
                {shopProducts.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
                            <h3 className="text-base font-semibold">No products found in this store</h3>
                            <p className="text-xs mt-1">
                                {filters.search
                                    ? `No items in ${shop.name} matched "${filters.search}".`
                                    : 'This shop has no products in this category.'}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={handleClearFilters}
                            >
                                View All Store Products
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {shopProducts.data.map((listing) => (
                            <ShopProductCard
                                key={listing.id}
                                shopProduct={{ ...listing, shop }}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {shopProducts.last_page > 1 && (
                    <div className="border-t pt-6 flex justify-center">
                        <Pagination data={shopProducts} />
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
