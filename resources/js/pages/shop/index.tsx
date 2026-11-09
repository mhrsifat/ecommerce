import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    ExternalLink,
    FilterX,
    Flame,
    Layers,
    ShieldCheck,
    Store,
    Truck,
    Zap,
} from 'lucide-react';
import ShopProductCard from '@/components/shop-product-card';
import Pagination from '@/components/pagination';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Category, PaginatedData, Shop, ShopProduct } from '@/types';

type ShopIndexProps = {
    categories: Category[];
    shopProducts: PaginatedData<ShopProduct>;
    activeShops: Shop[];
    featuredProducts: ShopProduct[];
    filters: {
        search: string | null;
        category: string | null;
        subcategory: string | null;
        shop: string | null;
    };
};

export default function ShopIndex({
    categories = [],
    shopProducts,
    activeShops = [],
    featuredProducts = [],
    filters,
}: ShopIndexProps) {
    const isHomePage =
        !filters.category && !filters.subcategory && !filters.search && !filters.shop;

    const handleReset = () => {
        router.get(
            '/',
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <ShopLayout>
            <Head title="Small E-Commerce Management — Multi-Vendor Storefront" />

            <div className="flex flex-col gap-12">
                {/* 1. Hero Showcase Banner with Cover Photo */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-xl">
                    {/* Background Cover Image (Brighter & more vibrant) */}
                    <img
                        src="/images/hero-banner.jpg"
                        alt="CSN Bangladesh E-Commerce Cover"
                        className="absolute inset-0 h-full w-full object-cover object-center scale-[1.02] transition-transform duration-700"
                    />

                    {/* Lighter, balanced overlay so the photo's rich colors pop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/45" />

                    {/* Content */}
                    <div className="relative z-10 mx-auto max-w-3xl px-6 py-12 sm:px-12 sm:py-16 text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                            <span>
                                Multi-Merchant Marketplace &bull; Shop-Specific Listings & Catalog
                            </span>
                        </div>

                        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">
                            Discover Top Products From Local Shops
                        </h1>
                        <p className="mt-4 text-sm text-neutral-100 sm:text-base max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                            Browse authentic products listed by verified merchant stores with shop-specific prices, custom details, and exclusive warranties.
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Button asChild size="lg" className="gap-2 bg-white text-slate-900 hover:bg-neutral-100 shadow-lg font-semibold">
                                <a href="#products-section">
                                    <span>Browse Shop Products</span>
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2 border-white/30 bg-black/40 text-white hover:bg-white/20 hover:text-white backdrop-blur-md shadow-md">
                                <Link href="/shops">
                                    <Store className="h-4 w-4" />
                                    <span>Explore All Shops ({activeShops.length})</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. Featured Verified Shops Section */}
                {isHomePage && activeShops.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">
                                    Featured Merchant Stores
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Browse dedicated storefronts managed by independent shop owners
                                </p>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs font-medium">
                                <Link href="/shops">
                                    View All Shops ({activeShops.length})
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                            {activeShops.map((shop) => (
                                <Link
                                    key={shop.id}
                                    href={`/shops/${shop.slug}`}
                                    className="group rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={shop.logo_url}
                                            alt={shop.name}
                                            className="h-14 w-14 rounded-xl border bg-muted object-cover shadow-xs transition-transform group-hover:scale-105"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary">
                                                {shop.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                {shop.description || 'Verified merchant storefront'}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {shop.shop_products_count ?? shop.products_count ?? 0} Products
                                                </Badge>
                                                <span className="text-[11px] text-primary font-medium flex items-center gap-0.5">
                                                    Visit Store &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Category & Active Shop Filter Navigation */}
                <div id="products-section" className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                {filters.shop
                                    ? `Products From Shop: ${filters.shop}`
                                    : filters.category
                                      ? `Category: ${filters.category}`
                                      : 'Products Listed by Shops'}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {shopProducts.total} available items listed across active shops
                            </p>
                        </div>

                        {/* Reset Filter Button if active */}
                        {(filters.category || filters.search || filters.shop) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground"
                            >
                                <FilterX className="h-3.5 w-3.5" />
                                <span>Clear Filters</span>
                            </Button>
                        )}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/"
                            preserveScroll
                            preserveState
                            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                                !filters.category && !filters.shop
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            }`}
                        >
                            All Categories
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                preserveScroll
                                preserveState
                                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                                    filters.category === cat.slug
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                }`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>

                    {/* Subcategory Tabs (shown when active category has subcategories) */}
                    {(() => {
                        const activeCat = categories.find((c) => c.slug === filters.category);
                        if (!activeCat?.subcategories || activeCat.subcategories.length === 0) return null;

                        return (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] font-medium text-muted-foreground mr-1">
                                    Subcategory:
                                </span>
                                <Link
                                    href={`/categories/${activeCat.slug}`}
                                    preserveScroll
                                    preserveState
                                    className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                                        !filters.subcategory
                                            ? 'bg-secondary text-secondary-foreground font-semibold shadow-xs'
                                            : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    All in {activeCat.name}
                                </Link>
                                {activeCat.subcategories.map((subcat) => (
                                    <Link
                                        key={subcat.id}
                                        href={`/categories/${activeCat.slug}/${subcat.slug}`}
                                        preserveScroll
                                        preserveState
                                        className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                                            filters.subcategory === subcat.slug
                                                ? 'bg-secondary text-secondary-foreground font-semibold shadow-xs'
                                                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        {subcat.name}
                                    </Link>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* 4. Products Grid */}
                {shopProducts.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <Store className="h-12 w-12 text-muted-foreground/40 mb-3" />
                            <h3 className="text-base font-semibold">No products found</h3>
                            <p className="text-xs mt-1">
                                {filters.search
                                    ? `No active shop listings matched "${filters.search}".`
                                    : 'There are currently no shop listings under this filter.'}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={handleReset}
                            >
                                Reset Search & Filters
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {shopProducts.data.map((listing) => (
                            <ShopProductCard key={listing.id} shopProduct={listing} />
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
