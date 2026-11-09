import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Edit2,
    ExternalLink,
    Package,
    Plus,
    Search,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { useRef, useState } from 'react';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
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
import type { Category, PaginatedData, Shop, ShopProduct } from '@/types';

type ProductsIndexProps = {
    shop: Shop;
    shopProducts: PaginatedData<ShopProduct>;
    categories: Category[];
    filters: { search?: string | null };
};

export default function OwnerProductsIndex({
    shop,
    shopProducts,
    categories = [],
    filters,
}: ProductsIndexProps) {
    // 1. Create New Product Dialog (Adds to Catalog & Shop)
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
    const createImageRef = useRef<HTMLInputElement>(null);

    const createForm = useForm<{
        category_id: string;
        subcategory_id: string;
        name: string;
        description: string;
        price: string;
        old_price: string;
        details: string;
        stock: string;
        image: File | null;
    }>({
        category_id: '',
        subcategory_id: '',
        name: '',
        description: '',
        price: '',
        old_price: '',
        details: '',
        stock: '100',
        image: null,
    });

    // 2. Edit Listing Dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<ShopProduct | null>(null);
    const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
    const editThumbnailRef = useRef<HTMLInputElement>(null);

    const editForm = useForm<{
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

    // 3. Unlist / Remove Dialog
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<ShopProduct | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');

    // Category / Subcategory cascading for creation
    const selectedCategory = categories.find(
        (c) => String(c.id) === createForm.data.category_id,
    );

    const openCreateDialog = () => {
        setCreateImagePreview(null);
        createForm.reset();
        createForm.clearErrors();
        setCreateDialogOpen(true);
    };

    const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            createForm.setData('image', file);
            setCreateImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/owner/products', {
            forceFormData: true,
            onSuccess: () => {
                setCreateDialogOpen(false);
                createForm.reset();
                setCreateImagePreview(null);
            },
        });
    };

    const openEditDialog = (listing: ShopProduct) => {
        setEditingListing(listing);
        setEditThumbnailPreview(listing.thumbnail_url);
        editForm.clearErrors();
        editForm.setData({
            price: String(listing.price),
            old_price: listing.old_price ? String(listing.old_price) : '',
            details: listing.details ?? listing.product?.description ?? '',
            stock: String(listing.stock),
            is_active: listing.is_active,
            thumbnail: null,
        });
        setEditDialogOpen(true);
    };

    const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            editForm.setData('thumbnail', file);
            setEditThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingListing) return;

        editForm.post(`/owner/products/${editingListing.id}`, {
            headers: {
                'X-HTTP-Method-Override': 'PUT',
            },
            forceFormData: true,
            onSuccess: () => {
                setEditDialogOpen(false);
                editForm.reset();
            },
        });
    };

    const confirmDelete = (listing: ShopProduct) => {
        setListingToDelete(listing);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!listingToDelete) return;

        setIsDeleting(true);
        router.delete(`/owner/products/${listingToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteOpen(false);
                setListingToDelete(null);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/owner/products',
            searchQuery.trim() ? { search: searchQuery.trim() } : {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title={`My Shop Products - ${shop.name}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            My Shop Products
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage products listed in <strong>{shop.name}</strong>. Set custom prices, details, thumbnails, and add new products to the shared catalog.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" className="gap-2">
                            <Link href="/owner/catalog">
                                <BookOpen className="h-4 w-4" />
                                Browse Shared Catalog
                            </Link>
                        </Button>
                        <Button onClick={openCreateDialog} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create New Product
                        </Button>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <Card>
                    <CardHeader className="py-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search your listed products..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                </Card>

                {/* Shop Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Listed Products ({shopProducts.total})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {shopProducts.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <Package className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                <p className="font-medium">No products listed in your shop.</p>
                                <p className="text-xs mt-1">
                                    Browse the shared catalog to add existing items, or create a new product of your own.
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/owner/catalog">Browse Catalog</Link>
                                    </Button>
                                    <Button onClick={openCreateDialog} size="sm">
                                        Create New Product
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Catalog Price</th>
                                            <th className="px-4 py-3">Your Shop Price</th>
                                            <th className="px-4 py-3 text-center">Stock</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {shopProducts.data.map((listing) => {
                                            const oldPrice = listing.old_price ? Number(listing.old_price) : null;
                                            const price = Number(listing.price);
                                            const hasDiscount = oldPrice !== null && oldPrice > price;

                                            return (
                                                <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={listing.thumbnail_url}
                                                                alt={listing.product?.name}
                                                                className="h-11 w-11 rounded-lg border object-cover shrink-0"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-foreground">
                                                                    {listing.product?.name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                                                    {listing.display_details}
                                                                </div>
                                                                {listing.thumbnail && (
                                                                    <span className="text-[10px] text-primary font-medium">
                                                                        Custom Thumbnail
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <Badge variant="outline" className="text-xs">
                                                            {listing.product?.category?.name ?? '—'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                                        ${Number(listing.product?.new_price ?? 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="font-bold text-foreground">
                                                                ${price.toFixed(2)}
                                                            </span>
                                                            {hasDiscount && oldPrice !== null && (
                                                                <span className="text-xs text-muted-foreground line-through">
                                                                    ${oldPrice.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center text-xs">
                                                        {listing.stock}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <Badge variant={listing.is_active ? 'default' : 'secondary'}>
                                                            {listing.is_active ? 'Active' : 'Hidden'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="View on Storefront"
                                                            >
                                                                <a
                                                                    href={`/shops/${shop.slug}/products/${listing.product?.slug}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                            <Button
                                                                onClick={() => openEditDialog(listing)}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Edit Price & Details"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => confirmDelete(listing)}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                title="Unlist from Shop"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="p-4 border-t">
                            <Pagination data={shopProducts} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 1. Create New Product Dialog (Adds to Catalog & Shop) */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                        <DialogDescription>
                            This product will be added to <strong>{shop.name}</strong> and will also become available in the <strong>shared catalog</strong> for other shop owners to list.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="create_category">Category *</Label>
                                <Select
                                    value={createForm.data.category_id}
                                    onValueChange={(val) => {
                                        createForm.setData({
                                            ...createForm.data,
                                            category_id: val,
                                            subcategory_id: '',
                                        });
                                    }}
                                >
                                    <SelectTrigger id="create_category" className="mt-1">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.category_id} />
                            </div>

                            <div>
                                <Label htmlFor="create_subcategory">Subcategory *</Label>
                                <Select
                                    value={createForm.data.subcategory_id}
                                    onValueChange={(val) => createForm.setData('subcategory_id', val)}
                                    disabled={!selectedCategory || !selectedCategory.subcategories?.length}
                                >
                                    <SelectTrigger id="create_subcategory" className="mt-1">
                                        <SelectValue placeholder="Select Subcategory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedCategory?.subcategories?.map((sub) => (
                                            <SelectItem key={sub.id} value={String(sub.id)}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.subcategory_id} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="create_name">Product Name *</Label>
                            <Input
                                id="create_name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="e.g. Wireless Noise-Cancelling Earbuds"
                                className="mt-1"
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div>
                            <Label htmlFor="create_description">Catalog Base Description *</Label>
                            <textarea
                                id="create_description"
                                rows={2}
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                placeholder="General specifications and description in the shared catalog..."
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                required
                            />
                            <InputError message={createForm.errors.description} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="create_price">Your Selling Price ($) *</Label>
                                <Input
                                    id="create_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={createForm.data.price}
                                    onChange={(e) => createForm.setData('price', e.target.value)}
                                    placeholder="49.99"
                                    className="mt-1"
                                    required
                                />
                                <InputError message={createForm.errors.price} />
                            </div>

                            <div>
                                <Label htmlFor="create_old_price">Original Price ($) (Optional)</Label>
                                <Input
                                    id="create_old_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={createForm.data.old_price}
                                    onChange={(e) => createForm.setData('old_price', e.target.value)}
                                    placeholder="69.99"
                                    className="mt-1"
                                />
                                <InputError message={createForm.errors.old_price} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="create_details">Shop Custom Notes / Warranty (Optional)</Label>
                            <textarea
                                id="create_details"
                                rows={2}
                                value={createForm.data.details}
                                onChange={(e) => createForm.setData('details', e.target.value)}
                                placeholder="Optional custom note specific to your shop listings..."
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <InputError message={createForm.errors.details} />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <Label>Product Image *</Label>
                            <div className="mt-1 flex items-center gap-4">
                                {createImagePreview && (
                                    <img
                                        src={createImagePreview}
                                        alt="Preview"
                                        className="h-14 w-14 rounded-lg border object-cover"
                                    />
                                )}
                                <input
                                    ref={createImageRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCreateImageChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => createImageRef.current?.click()}
                                    className="gap-2"
                                >
                                    <UploadCloud className="h-4 w-4" />
                                    {createImagePreview ? 'Change Image' : 'Select Image'}
                                </Button>
                            </div>
                            <InputError message={createForm.errors.image} />
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing && <Spinner className="mr-2" />}
                                Publish to Catalog & Shop
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. Edit Shop Listing Dialog (Modify price, details, thumbnail, stock) */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Shop Listing</DialogTitle>
                        <DialogDescription>
                            Set or modify product prices, details, and thumbnails for <strong>{shop.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {editingListing && (
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            {/* Product Info */}
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                                <img
                                    src={editThumbnailPreview || editingListing.thumbnail_url}
                                    alt={editingListing.product?.name}
                                    className="h-12 w-12 rounded-lg border object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-sm truncate">
                                        {editingListing.product?.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Catalog Base Price: ${Number(editingListing.product?.new_price ?? 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="edit_price">Your Selling Price ($) *</Label>
                                    <Input
                                        id="edit_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', e.target.value)}
                                        className="mt-1 font-semibold"
                                        required
                                    />
                                    <InputError message={editForm.errors.price} />
                                </div>

                                <div>
                                    <Label htmlFor="edit_old_price">Original Price ($) (Optional)</Label>
                                    <Input
                                        id="edit_old_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editForm.data.old_price}
                                        onChange={(e) => editForm.setData('old_price', e.target.value)}
                                        className="mt-1"
                                    />
                                    <InputError message={editForm.errors.old_price} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit_details">Shop Product Details / Description</Label>
                                <textarea
                                    id="edit_details"
                                    rows={3}
                                    value={editForm.data.details}
                                    onChange={(e) => editForm.setData('details', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <InputError message={editForm.errors.details} />
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <Label>Shop-Specific Thumbnail (Optional)</Label>
                                <div className="mt-1 flex items-center gap-4">
                                    {editThumbnailPreview && (
                                        <img
                                            src={editThumbnailPreview}
                                            alt="Preview"
                                            className="h-14 w-14 rounded-lg border object-cover"
                                        />
                                    )}
                                    <input
                                        ref={editThumbnailRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditThumbnailChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => editThumbnailRef.current?.click()}
                                        className="gap-2 text-xs"
                                    >
                                        <UploadCloud className="h-4 w-4" />
                                        Upload Custom Thumbnail
                                    </Button>
                                    {editingListing.thumbnail && (
                                        <Badge variant="outline" className="text-xs">
                                            Custom Image Active
                                        </Badge>
                                    )}
                                </div>
                                <InputError message={editForm.errors.thumbnail} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <Label htmlFor="edit_stock">Stock Available</Label>
                                    <Input
                                        id="edit_stock"
                                        type="number"
                                        min="0"
                                        value={editForm.data.stock}
                                        onChange={(e) => editForm.setData('stock', e.target.value)}
                                        className="mt-1"
                                    />
                                    <InputError message={editForm.errors.stock} />
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        id="edit_active"
                                        type="checkbox"
                                        checked={editForm.data.is_active}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="edit_active" className="cursor-pointer text-xs">
                                        Active in My Shop
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter className="pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing && <Spinner className="mr-2" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* 3. Confirm Delete / Unlist Dialog */}
            <ConfirmDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Unlist Product from Shop"
                description={`Remove "${listingToDelete?.product?.name}" from ${shop.name}? The product will remain safely in the shared catalog.`}
                onConfirm={handleDelete}
                processing={isDeleting}
            />
        </>
    );
}

OwnerProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Shop Management',
            href: '/owner/products',
        },
        {
            title: 'My Products',
            href: '/owner/products',
        },
    ],
};
