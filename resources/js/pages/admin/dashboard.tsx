import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    FolderTree,
    Layers,
    Package,
    Store,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Product, Shop } from '@/types';

type DashboardProps = {
    stats: {
        totalShops: number;
        totalShopOwners: number;
        totalCatalogProducts: number;
        totalActiveListings: number;
        totalCategories: number;
        totalSubcategories: number;
    };
    recentShops: Shop[];
    recentProducts: Product[];
};

export default function Dashboard({
    stats,
    recentShops = [],
    recentProducts = [],
}: DashboardProps) {
    const statCards = [
        {
            title: 'Total Shops',
            count: stats.totalShops,
            icon: Store,
            href: '/admin/shops',
            linkText: 'Manage Shops',
            description: 'Registered vendor stores',
        },
        {
            title: 'Shop Owners',
            count: stats.totalShopOwners,
            icon: Users,
            href: '/admin/shop-owners',
            linkText: 'Manage Owners',
            description: 'Vendor account holders',
        },
        {
            title: 'Shared Product Catalog',
            count: stats.totalCatalogProducts,
            icon: Package,
            href: '/admin/products',
            linkText: 'Products',
            description: 'Catalog products available to shops',
        },
        {
            title: 'Active Listings',
            count: stats.totalActiveListings,
            icon: ArrowUpRight,
            href: '/admin/shops',
            linkText: 'Storefront Listings',
            description: 'Products listed across shops',
        },
        {
            title: 'Categories',
            count: stats.totalCategories,
            icon: FolderTree,
            href: '/admin/categories',
            linkText: 'Categories',
            description: 'Main product categories',
        },
        {
            title: 'Subcategories',
            count: stats.totalSubcategories,
            icon: Layers,
            href: '/admin/subcategories',
            linkText: 'Subcategories',
            description: 'Specific sub-classifications',
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col gap-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Multi-shop management system: monitor shops, shop owners, and products.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/shops">Manage Shops</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/shop-owners">Manage Shop Owners</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/admin/products">Manage Catalog</Link>
                        </Button>
                    </div>
                </div>

                {/* 6 Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card
                                key={card.title}
                                className="overflow-hidden transition-all hover:border-primary/40"
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {card.title}
                                    </CardTitle>
                                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {card.count}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {card.description}
                                    </p>
                                    <div className="mt-4 border-t pt-3">
                                        <Link
                                            href={card.href}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                        >
                                            {card.linkText}
                                            <ArrowUpRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Shops */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Recent Shops</CardTitle>
                                <CardDescription>
                                    Active vendors and store listings
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/shops">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentShops.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No shops registered yet.
                                </p>
                            ) : (
                                <div className="divide-y">
                                    {recentShops.map((shop) => (
                                        <div
                                            key={shop.id}
                                            className="flex items-center justify-between py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={shop.logo_url}
                                                    alt={shop.name}
                                                    className="h-9 w-9 rounded-lg border object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {shop.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Owner: {shop.owner?.name ?? 'Unassigned'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={shop.is_active ? 'default' : 'secondary'}>
                                                    {shop.products_count ?? 0} products
                                                </Badge>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/shops/${shop.slug}`} target="_blank">
                                                        Visit
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Shared Catalog Products */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Shared Product Catalog</CardTitle>
                                <CardDescription>
                                    Recently added products available to all shops
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/products">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentProducts.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No products yet.
                                </p>
                            ) : (
                                <div className="divide-y">
                                    {recentProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="h-9 w-9 rounded-lg border object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium text-sm line-clamp-1">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {product.category?.name} &bull; Base ${Number(product.new_price).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className="text-xs">
                                                    {product.shop_products_count ?? 0} shops
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    {product.creator ? product.creator.name : 'Admin'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
    ],
};
