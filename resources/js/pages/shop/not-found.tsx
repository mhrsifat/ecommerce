import { Head, Link } from '@inertiajs/react';
import { Home, PackageX, SearchX } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import { Button } from '@/components/ui/button';

type ShopNotFoundProps = {
    type: 'product' | 'category' | 'subcategory';
    message: string;
};

export default function ShopNotFound({ type, message }: ShopNotFoundProps) {
    const title =
        type === 'product'
            ? 'No Product Found'
            : type === 'category'
              ? 'No Category Found'
              : 'No Subcategory Found';

    const Icon = type === 'product' ? PackageX : SearchX;

    return (
        <ShopLayout>
            <Head title={`${title} — CSN Bangladesh`} />

            <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
                {/* Icon */}
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-xs">
                    <Icon className="h-10 w-10 text-primary" />
                </div>

                {/* Title & Description */}
                <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {title}
                </h1>

                {message && (
                    <p className="mt-3 max-w-md text-sm text-muted-foreground">
                        {message}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button asChild size="default" className="gap-2">
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Go to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </ShopLayout>
    );
}
