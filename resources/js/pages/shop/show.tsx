import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronRight,
    Mail,
    MapPin,
    PackageCheck,
    Phone,
    ShieldCheck,
    Store,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import ShopProductCard from '@/components/shop-product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ShopLayout from '@/layouts/shop-layout';
import type { Product, ShopProduct } from '@/types';

type ShopProductShowProps = {
    shopProduct: ShopProduct;
    relatedProducts?: ShopProduct[];
    otherSellers?: ShopProduct[];
    // Fallback if accessed via legacy route
    product?: Product;
};

export default function ShopProductShow({
    shopProduct,
    relatedProducts = [],
    otherSellers = [],
    product: fallbackProduct,
}: ShopProductShowProps) {
    const [quantity, setQuantity] = useState<number>(1);

    const product = shopProduct?.product ?? fallbackProduct;
    const shop = shopProduct?.shop;

    const priceNum = Number(shopProduct?.price ?? product?.new_price ?? 0);
    const oldPriceNum = shopProduct?.old_price
        ? Number(shopProduct.old_price)
        : product?.old_price
          ? Number(product.old_price)
          : null;
    const hasDiscount = oldPriceNum !== null && oldPriceNum > priceNum;

    const thumbnailUrl = shopProduct?.thumbnail_url ?? product?.image_url ?? '';
    const details = shopProduct?.display_details ?? product?.description ?? '';

    return (
        <ShopLayout>
            <Head
                title={`${product?.name ?? 'Product'} — ${shop?.name ? `Sold by ${shop.name}` : 'Shop'}`}
            />

            <div className="flex flex-col gap-10 max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <nav
                    className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground"
                    aria-label="Breadcrumb"
                >
                    <Link href="/" className="transition hover:text-foreground">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                    <Link href="/shops" className="transition hover:text-foreground">
                        Shops
                    </Link>
                    {shop && (
                        <>
                            <ChevronRight className="h-4 w-4 shrink-0" />
                            <Link
                                href={`/shops/${shop.slug}`}
                                className="transition hover:text-foreground font-medium"
                            >
                                {shop.name}
                            </Link>
                        </>
                    )}
                    {product?.category && (
                        <>
                            <ChevronRight className="h-4 w-4 shrink-0" />
                            <Link
                                href={`/categories/${product.category.slug}`}
                                className="transition hover:text-foreground"
                            >
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-[200px] font-semibold text-foreground">
                        {product?.name}
                    </span>
                </nav>

                {/* Two-Column Product Detail View */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Left: Product Thumbnail Image Card */}
                    <div className="lg:col-span-6">
                        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border bg-card shadow-sm">
                            <img
                                src={thumbnailUrl}
                                alt={product?.name}
                                className="h-full w-full object-cover object-center"
                            />
                            {hasDiscount && (
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-destructive text-destructive-foreground font-bold px-3 py-1 text-sm shadow-md">
                                        Special Offer
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Shop-Specific Information & Pricing */}
                    <div className="flex flex-col lg:col-span-6">
                        {/* Sold By Shop Card */}
                        {shop && (
                            <div className="mb-4 flex items-center justify-between rounded-2xl border bg-muted/40 p-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={shop.logo_url}
                                        alt={shop.name}
                                        className="h-12 w-12 rounded-xl border bg-card object-cover"
                                    />
                                    <div>
                                        <div className="text-[11px] font-medium uppercase text-muted-foreground">
                                            Sold & Shipped By
                                        </div>
                                        <Link
                                            href={`/shops/${shop.slug}`}
                                            className="font-bold text-base text-foreground hover:text-primary transition"
                                        >
                                            {shop.name}
                                        </Link>
                                    </div>
                                </div>
                                <Button asChild variant="outline" size="sm" className="text-xs">
                                    <Link href={`/shops/${shop.slug}`}>
                                        Visit Store
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                            {product?.name}
                        </h1>

                        {/* Shop-Specific Price */}
                        <div className="mt-4 flex items-baseline gap-3 border-y py-4">
                            <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                                ${priceNum.toFixed(2)}
                            </span>
                            {hasDiscount && oldPriceNum !== null && (
                                <span className="text-lg text-muted-foreground line-through">
                                    ${oldPriceNum.toFixed(2)}
                                </span>
                            )}
                            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300 ml-2">
                                In Stock ({shopProduct?.stock ?? 100} available)
                            </Badge>
                        </div>

                        {/* Shop-Specific Details */}
                        <div className="mt-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Product Details & Store Terms
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                                {details}
                            </p>
                        </div>

                        {/* Purchase Action Box */}
                        <div className="mt-8 flex flex-col gap-4 rounded-2xl border bg-card p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-24">
                                    <label className="text-xs font-medium text-muted-foreground">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={shopProduct?.stock ?? 100}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                                    />
                                </div>
                                <Button size="lg" className="flex-1 mt-auto font-semibold gap-2">
                                    <PackageCheck className="h-5 w-5" />
                                    Add to Cart &bull; ${(priceNum * quantity).toFixed(2)}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t pt-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-primary shrink-0" />
                                    <span>Fast Delivery from {shop?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                                    <span>100% Genuine Guarantee</span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Contact Info */}
                        {shop && (shop.phone || shop.address) && (
                            <div className="mt-6 rounded-xl border bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
                                <div className="font-semibold text-foreground text-xs uppercase mb-1">
                                    Seller Contact Information
                                </div>
                                {shop.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span>{shop.address}</span>
                                    </div>
                                )}
                                {shop.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span>{shop.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Other Sellers Offering This Item */}
                {otherSellers.length > 0 && (
                    <div className="border-t pt-8">
                        <h2 className="text-lg font-bold tracking-tight">
                            Other Stores Selling This Product ({otherSellers.length})
                        </h2>
                        <p className="text-xs text-muted-foreground mb-4">
                            Compare prices and warranty offers from other verified merchants
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {otherSellers.map((seller) => (
                                <div
                                    key={seller.id}
                                    className="flex items-center justify-between rounded-xl border bg-card p-4 hover:border-primary/40 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={seller.shop?.logo_url}
                                            alt={seller.shop?.name}
                                            className="h-10 w-10 rounded-lg border object-cover"
                                        />
                                        <div>
                                            <div className="font-semibold text-sm">
                                                {seller.shop?.name}
                                            </div>
                                            <div className="font-bold text-primary text-sm">
                                                ${Number(seller.price).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <Button asChild size="sm" variant="outline" className="text-xs">
                                        <Link href={`/shops/${seller.shop?.slug}/products/${product?.slug}`}>
                                            View Offer
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* More Products From This Shop */}
                {relatedProducts.length > 0 && shop && (
                    <div className="border-t pt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">
                                    More Products from {shop.name}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Browse additional items offered by this store
                                </p>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={`/shops/${shop.slug}`}>
                                    View Full Store
                                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                            {relatedProducts.map((rel) => (
                                <ShopProductCard
                                    key={rel.id}
                                    shopProduct={{ ...rel, shop }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
