import { Link } from '@inertiajs/react';
import { ArrowRight, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ShopProduct } from '@/types';

type ShopProductCardProps = {
    shopProduct: ShopProduct;
};

export default function ShopProductCard({ shopProduct }: ShopProductCardProps) {
    const oldPriceNum =
        shopProduct.old_price !== null && shopProduct.old_price !== undefined
            ? Number(shopProduct.old_price)
            : null;
    const priceNum = Number(shopProduct.price);
    const hasDiscount = oldPriceNum !== null && oldPriceNum > priceNum;

    const shop = shopProduct.shop;
    const product = shopProduct.product;

    const productUrl = shop && product
        ? `/shops/${shop.slug}/products/${product.slug}`
        : product?.slug
          ? `/products/${product.slug}`
          : '#';

    const shopUrl = shop ? `/shops/${shop.slug}` : '#';

    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md">
            {/* Image Container with Zoom */}
            <Link
                href={productUrl}
                className="relative aspect-square w-full overflow-hidden bg-muted/30"
            >
                <img
                    src={shopProduct.thumbnail_url}
                    alt={product?.name ?? 'Product'}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Discount Badge */}
                {hasDiscount && shopProduct.discount_percentage && (
                    <div className="absolute top-2.5 right-2.5">
                        <Badge className="bg-destructive text-destructive-foreground font-bold shadow-xs">
                            -{shopProduct.discount_percentage}%
                        </Badge>
                    </div>
                )}
            </Link>

            {/* Product Meta & Info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Shop Badge (Sold by) */}
                {shop && (
                    <div className="mb-2">
                        <Link
                            href={shopUrl}
                            className="inline-flex items-center gap-1.5 rounded-md bg-muted/70 px-2 py-0.5 text-xs font-medium text-foreground transition hover:bg-primary/10 hover:text-primary"
                        >
                            <Store className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate max-w-[170px]">{shop.name}</span>
                        </Link>
                    </div>
                )}

                {/* Category Badge */}
                {product?.category && (
                    <div className="mb-1.5">
                        <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground"
                        >
                            {product.category.name}
                        </Badge>
                    </div>
                )}

                {/* Title */}
                <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground transition group-hover:text-primary">
                    <Link href={productUrl}>{product?.name}</Link>
                </h3>

                {/* Shop-Specific Details preview */}
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                    {shopProduct.display_details || product?.description}
                </p>

                {/* Price and Action Footer */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-foreground">
                                ${priceNum.toFixed(2)}
                            </span>
                            {hasDiscount && oldPriceNum !== null && (
                                <span className="text-xs text-muted-foreground line-through">
                                    ${oldPriceNum.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="group/btn gap-1 text-xs font-medium"
                    >
                        <Link href={productUrl}>
                            <span>View Details</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

