import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, Mail, MapPin, Package, Phone, Search, Store } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData, Shop } from '@/types';

type ShopsIndexProps = {
    shops: PaginatedData<Shop>;
    filters: { search?: string | null };
};

export default function ShopsIndex({ shops, filters }: ShopsIndexProps) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/shops',
            search.trim() ? { search: search.trim() } : {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <ShopLayout>
            <Head title="Explore Shops — Multi-Vendor Marketplace" />

            <div className="flex flex-col gap-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            Explore Verified Merchant Shops
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Browse independent stores, discover local brands, and shop genuine products directly.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-md w-full">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search shops by name or city..."
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Shops Grid */}
                {shops.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <Store className="h-12 w-12 text-muted-foreground/40 mb-3" />
                            <h3 className="text-base font-semibold">No stores found</h3>
                            <p className="text-xs mt-1">Try searching with a different keyword.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setSearch('');
                                    router.get('/shops');
                                }}
                            >
                                Reset Search
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {shops.data.map((shop) => (
                            <div
                                key={shop.id}
                                className="group flex flex-col rounded-2xl border bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md"
                            >
                                <div className="flex items-start gap-4">
                                    <img
                                        src={shop.logo_url}
                                        alt={shop.name}
                                        className="h-16 w-16 rounded-2xl border bg-muted object-cover shadow-xs transition-transform group-hover:scale-105 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition truncate">
                                            {shop.name}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge variant="secondary" className="text-[11px] font-medium">
                                                {shop.shop_products_count ?? shop.products_count ?? 0} Products
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                                                Verified Shop
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-muted-foreground line-clamp-2 flex-1">
                                    {shop.description || 'Welcome to our verified merchant store on CSN Bangladesh.'}
                                </p>

                                {/* Contact Details */}
                                <div className="mt-4 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                                    {shop.address && (
                                        <div className="flex items-center gap-2 truncate">
                                            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <span className="truncate">{shop.address}</span>
                                        </div>
                                    )}
                                    {shop.phone && (
                                        <div className="flex items-center gap-2 truncate">
                                            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <span className="truncate">{shop.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action */}
                                <div className="mt-5 pt-3 border-t">
                                    <Button asChild className="w-full gap-2">
                                        <Link href={`/shops/${shop.slug}`}>
                                            <span>Visit Storefront</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {shops.last_page > 1 && (
                    <div className="border-t pt-6 flex justify-center">
                        <Pagination data={shops} />
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
