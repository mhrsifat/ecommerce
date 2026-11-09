import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const oldPriceNum =
        product.old_price !== null ? Number(product.old_price) : null;
    const newPriceNum = Number(product.new_price);
    const hasDiscount = oldPriceNum !== null && oldPriceNum > newPriceNum;

    const productUrl = `/products/${product.slug}`;

    const categoryUrl = product.category
        ? `/categories/${product.category.slug}`
        : '#';

    const subcategoryUrl =
        product.subcategory && product.category
            ? `/categories/${product.category.slug}/${product.subcategory.slug}`
            : product.subcategory
              ? `/categories/${product.subcategory.slug}`
              : '#';

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md">
            {/* Image Container with Zoom */}
            <Link
                href={productUrl}
                className="relative aspect-square w-full overflow-hidden bg-muted/30"
            >
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
            </Link>

            {/* Product Meta & Info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Category & Subcategory Badges */}
                <div className="mb-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                    {product.category && (
                        <Link href={categoryUrl}>
                            <Badge
                                variant="outline"
                                className="cursor-pointer text-[11px] font-medium transition hover:bg-muted"
                            >
                                {product.category.name}
                            </Badge>
                        </Link>
                    )}
                    {product.subcategory && (
                        <Link href={subcategoryUrl}>
                            <Badge
                                variant="secondary"
                                className="cursor-pointer text-[11px] font-medium transition hover:bg-secondary/80"
                            >
                                {product.subcategory.name}
                            </Badge>
                        </Link>
                    )}
                </div>

                {/* Title */}
                <h3 className="line-clamp-2 text-base leading-snug font-semibold tracking-tight text-foreground transition group-hover:text-primary">
                    <Link href={productUrl}>{product.name}</Link>
                </h3>

                {/* Description (subtle preview) */}
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                    {product.description}
                </p>

                {/* Price and Action Footer */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-foreground">
                                ${newPriceNum.toFixed(2)}
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
