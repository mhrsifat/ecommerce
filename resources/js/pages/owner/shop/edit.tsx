import { Head, useForm } from '@inertiajs/react';
import { ExternalLink, Store, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { Shop } from '@/types';

type ShopEditProps = {
    shop: Shop;
};

export default function ShopEdit({ shop }: ShopEditProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(shop.logo_url ?? null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<{
        name: string;
        description: string;
        email: string;
        phone: string;
        address: string;
        logo: File | null;
    }>({
        name: shop.name ?? '',
        description: shop.description ?? '',
        email: shop.email ?? '',
        phone: shop.phone ?? '',
        address: shop.address ?? '',
        logo: null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/owner/shop', {
            headers: {
                'X-HTTP-Method-Override': 'PUT',
            },
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={`Shop Settings - ${shop.name}`} />

            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Shop Profile & Settings
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update public store details, contact information, and branding.
                        </p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <a href={`/shops/${shop.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            View Public Storefront
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" />
                            Storefront Details
                        </CardTitle>
                        <CardDescription>
                            This information is displayed to customers on your dedicated shop page and product listings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Logo */}
                            <div>
                                <Label>Shop Logo / Brand Image</Label>
                                <div className="mt-2 flex items-center gap-5">
                                    <img
                                        src={logoPreview || shop.logo_url}
                                        alt={shop.name}
                                        className="h-20 w-20 rounded-2xl border bg-muted object-cover shadow-xs"
                                    />
                                    <div>
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="gap-2 text-xs"
                                        >
                                            <UploadCloud className="h-4 w-4" />
                                            Change Logo
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-1.5">
                                            Recommended: square image, at least 300x300px (PNG, JPG, WebP)
                                        </p>
                                    </div>
                                </div>
                                <InputError message={form.errors.logo} />
                            </div>

                            {/* Name */}
                            <div>
                                <Label htmlFor="name">Shop Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g. Dhaka Tech Mart"
                                    className="mt-1"
                                    required
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="description">Store Bio & Description</Label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Tell customers about your store, warranties, return policies, and expertise..."
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Customer Support Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="support@myshop.com"
                                        className="mt-1"
                                    />
                                    <InputError message={form.errors.email} />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Customer Helpline Phone</Label>
                                    <Input
                                        id="phone"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="+8801..."
                                        className="mt-1"
                                    />
                                    <InputError message={form.errors.phone} />
                                </div>
                            </div>

                            {/* Physical Address */}
                            <div>
                                <Label htmlFor="address">Physical Store Address</Label>
                                <Input
                                    id="address"
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    placeholder="e.g. Level 4, Bashundhara City, Panthapath, Dhaka"
                                    className="mt-1"
                                />
                                <InputError message={form.errors.address} />
                            </div>

                            <div className="pt-3 border-t flex justify-end">
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing && <Spinner className="mr-2" />}
                                    Save Shop Settings
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShopEdit.layout = {
    breadcrumbs: [
        {
            title: 'Shop Management',
            href: '/owner/products',
        },
        {
            title: 'Shop Settings',
            href: '/owner/shop',
        },
    ],
};
