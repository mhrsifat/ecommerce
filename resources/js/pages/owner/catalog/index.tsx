import { Head, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Check,
    CheckCircle2,
    Filter,
    Package,
    Plus,
    Search,
    Store,
    UploadCloud,
} from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import type { Category, PaginatedData, Product, Shop } from '@/types';

type CatalogIndexProps = {
    shop: Shop;
    products: PaginatedData<Product>;
    categories: Category[];
    myProductIds: number[];
    filters: {
        search?: string | null;
        category_id?: number | null;
        status?: string;
    };
};

export default function CatalogIndex({
    shop,
    products,
    categories = [],
    myProductIds = [],
    filters,
}: CatalogIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState<string>(
        filters?.category_id ? String(filters.category_id) : 'all',
    );
    const [statusFilter, setStatusFilter] = useState<string>(
        filters?.status ?? 'all',
    );

    const form = useForm<{
        price: string;
        old_price: string;
        details: string;
        stock: string;
        is_active: boolean;
        thumbnail: File | null;
    }>({
        price: '',
        old_price: '',
        details: '',
        stock: '100',
        is_active: true,
        thumbnail: null,
    });

    const openAddDialog = (product: Product) => {
        setSelectedProduct(product);
        setThumbnailPreview(product.image_url);
        form.clearErrors();

        // If product already in shop, prefill with existing values
        if (product.shop_product) {
            form.setData({
                price: String(product.shop_product.price),
                old_price: product.shop_product.old_price ? String(product.shop_product.old_price) : '',
                details: product.shop_product.details ?? product.description,
                stock: String(product.shop_product.stock),
                is_active: product.shop_product.is_active,
                thumbnail: null,
            });
            if (product.shop_product.thumbnail_url) {
                setThumbnailPreview(product.shop_product.thumbnail_url);
            }
        } else {
            // New addition, prefill with catalog defaults
            form.setData({
                price: String(product.new_price),
                old_price: product.old_price ? String(product.old_price) : '',
                details: product.description,
                stock: '100',
                is_active: true,
                thumbnail: null,
            });
        }

        setDialogOpen(true);
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('thumbnail', file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        form.post(`/owner/catalog/${selectedProduct.slug || selectedProduct.id}/add`, {
            forceFormData: true,
            onSuccess: () => {
                setDialogOpen(false);
                form.reset();
            },
        });
    };

    const handleFilterChange = (
        searchVal: string,
        catVal: string,
        statusVal: string,
    ) => {
        const params: Record<string, string> = {};
        if (searchVal.trim()) params.search = searchVal.trim();
        if (catVal !== 'all') params.category_id = catVal;
        if (statusVal !== 'all') params.status = statusVal;

        router.get('/owner/catalog', params, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title={`Products - ${shop.name}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Products
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Browse items created by administrators and other shop owners. Add them to <strong>{shop.name}</strong> with your custom price, details, and thumbnail.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="shrink-0 gap-2">
                        <a href="/owner/products">
                            <Store className="h-4 w-4" />
                            Manage My Shop Products ({myProductIds.length})
                        </a>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="py-4">
                        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-4">
                            {/* Search Input */}
                            <div className="relative md:col-span-2">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleFilterChange(searchQuery, categoryFilter, statusFilter);
                                        }
                                    }}
                                    placeholder="Search products in shared catalog..."
                                    className="pl-9"
                                />
                            </div>

                            {/* Category Filter */}
                            <div>
                                <Select
                                    value={categoryFilter}
                                    onValueChange={(val) => {
                                        setCategoryFilter(val);
                                        handleFilterChange(searchQuery, val, statusFilter);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(val) => {
                                        setStatusFilter(val);
                                        handleFilterChange(searchQuery, categoryFilter, val);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Listing Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Products</SelectItem>
                                        <SelectItem value="not_added">Not in My Shop</SelectItem>
                                        <SelectItem value="added">Already in My Shop</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Catalog Product Grid */}
                {products.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
                            <h3 className="text-base font-semibold">No catalog products match your filter</h3>
                            <p className="text-xs mt-1">Try adjusting your search terms or filters.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setSearchQuery('');
                                    setCategoryFilter('all');
                                    setStatusFilter('all');
                                    handleFilterChange('', 'all', 'all');
                                }}
                            >
                                Reset Filters
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {products.data.map((product) => {
                            const isAdded = myProductIds.includes(product.id);
                            const creatorName = product.creator?.name ?? 'Admin';

                            return (
                                <Card
                                    key={product.id}
                                    className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${
                                        isAdded ? 'border-primary/50 bg-primary/2' : ''
                                    }`}
                                >
                                    {/* Image Container with Badges */}
                                    <div className="relative aspect-4/3 overflow-hidden bg-muted">
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs text-[11px] shadow-xs">
                                                By: {creatorName}
                                            </Badge>
                                        </div>

                                        {isAdded && (
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-emerald-600 text-white gap-1 text-[11px] shadow-xs">
                                                    <Check className="h-3 w-3" />
                                                    In Your Shop
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <CardContent className="flex flex-1 flex-col p-4">
                                        <div className="mb-1 text-[11px] font-medium text-muted-foreground uppercase">
                                            {product.category?.name ?? 'General'}
                                        </div>
                                        <h3 className="font-semibold text-sm line-clamp-1 text-foreground" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-3 flex-1">
                                            {product.description}
                                        </p>

                                        <div className="border-t pt-3 mt-auto flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] text-muted-foreground uppercase">
                                                    Catalog Base
                                                </div>
                                                <div className="font-bold text-sm text-foreground">
                                                    ${Number(product.new_price).toFixed(2)}
                                                </div>
                                            </div>

                                            {isAdded && product.shop_product && (
                                                <div className="text-right">
                                                    <div className="text-[10px] text-emerald-600 font-medium uppercase">
                                                        Your Price
                                                    </div>
                                                    <div className="font-bold text-sm text-emerald-600">
                                                        ${Number(product.shop_product.price).toFixed(2)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-3">
                                            <Button
                                                onClick={() => openAddDialog(product)}
                                                variant={isAdded ? 'outline' : 'default'}
                                                className="w-full gap-1.5 text-xs"
                                                size="sm"
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                        Update Shop Pricing
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add to My Shop
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <div className="border-t pt-4">
                    <Pagination data={products} />
                </div>
            </div>

            {/* Add / Modify Shop Product Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedProduct && myProductIds.includes(selectedProduct.id)
                                ? 'Update Shop Product Listing'
                                : 'Add Catalog Product to Your Shop'}
                        </DialogTitle>
                        <DialogDescription>
                            Set your shop-specific price, custom product details, and optional thumbnail for <strong>{shop.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedProduct && (
                        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
                            {/* Product Summary Box */}
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                                <img
                                    src={thumbnailPreview || selectedProduct.image_url}
                                    alt={selectedProduct.name}
                                    className="h-12 w-12 rounded-lg border object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-sm truncate">
                                        {selectedProduct.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Catalog Base Price: ${Number(selectedProduct.new_price).toFixed(2)} &bull; Created by {selectedProduct.creator?.name ?? 'Admin'}
                                    </div>
                                </div>
                            </div>

                            {/* Price Inputs */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="shop_price">Your Selling Price ($) *</Label>
                                    <Input
                                        id="shop_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.price}
                                        onChange={(e) => form.setData('price', e.target.value)}
                                        placeholder="e.g. 79.99"
                                        className="mt-1 font-semibold"
                                        required
                                    />
                                    <InputError message={form.errors.price} />
                                </div>

                                <div>
                                    <Label htmlFor="shop_old_price">Original Price ($) (Optional)</Label>
                                    <Input
                                        id="shop_old_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.old_price}
                                        onChange={(e) => form.setData('old_price', e.target.value)}
                                        placeholder="e.g. 99.99 (shows discount)"
                                        className="mt-1"
                                    />
                                    <InputError message={form.errors.old_price} />
                                </div>
                            </div>

                            {/* Shop Details / Description */}
                            <div>
                                <Label htmlFor="shop_details">
                                    Shop-Specific Details & Description
                                </Label>
                                <textarea
                                    id="shop_details"
                                    rows={3}
                                    value={form.data.details}
                                    onChange={(e) => form.setData('details', e.target.value)}
                                    placeholder="Add warranty terms, condition, bundle info, or custom marketing copy..."
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Defaults to catalog description. Customize this specifically for your shop customers.
                                </p>
                                <InputError message={form.errors.details} />
                            </div>

                            {/* Custom Thumbnail */}
                            <div>
                                <Label>Shop-Specific Thumbnail (Optional)</Label>
                                <div className="mt-1 flex items-center gap-4">
                                    {thumbnailPreview && (
                                        <img
                                            src={thumbnailPreview}
                                            alt="Preview"
                                            className="h-14 w-14 rounded-lg border object-cover"
                                        />
                                    )}
                                    <input
                                        ref={thumbnailInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="gap-2 text-xs"
                                    >
                                        <UploadCloud className="h-4 w-4" />
                                        Upload Custom Thumbnail
                                    </Button>
                                    <span className="text-[11px] text-muted-foreground">
                                        Leave empty to use catalog image
                                    </span>
                                </div>
                                <InputError message={form.errors.thumbnail} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <Label htmlFor="shop_stock">Stock Available</Label>
                                    <Input
                                        id="shop_stock"
                                        type="number"
                                        min="0"
                                        value={form.data.stock}
                                        onChange={(e) => form.setData('stock', e.target.value)}
                                        className="mt-1"
                                    />
                                    <InputError message={form.errors.stock} />
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        id="shop_listing_active"
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="shop_listing_active" className="cursor-pointer text-xs">
                                        Active in My Shop
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter className="pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing && <Spinner className="mr-2" />}
                                    {selectedProduct && myProductIds.includes(selectedProduct.id)
                                        ? 'Save Changes'
                                        : 'Add to My Shop'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

CatalogIndex.layout = {
    breadcrumbs: [
        {
            title: 'Shop Management',
            href: '/owner/products',
        },
        {
            title: 'Shared Catalog',
            href: '/owner/catalog',
        },
    ],
};
