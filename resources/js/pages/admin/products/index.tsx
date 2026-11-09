import { Head, router, useForm } from '@inertiajs/react';
import {
    Edit2,
    ExternalLink,
    Package,
    Plus,
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
import type { Category, PaginatedData, Product } from '@/types';

type ProductsIndexProps = {
    products: PaginatedData<Product>;
    categories: Category[];
};

export default function ProductsIndex({
    products,
    categories,
}: ProductsIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<{
        category_id: string;
        subcategory_id: string;
        name: string;
        description: string;
        old_price: string;
        new_price: string;
        image: File | null;
    }>({
        category_id: '',
        subcategory_id: '',
        name: '',
        description: '',
        old_price: '',
        new_price: '',
        image: null,
    });

    const selectedCategory = categories.find(
        (c) => String(c.id) === String(form.data.category_id),
    );
    const availableSubcategories = selectedCategory?.subcategories ?? [];

    const handleCategoryChange = (val: string) => {
        const targetCategory = categories.find((c) => String(c.id) === val);
        const subcategoryStillValid = targetCategory?.subcategories?.some(
            (s) => String(s.id) === String(form.data.subcategory_id),
        );

        form.setData((prev) => ({
            ...prev,
            category_id: val,
            subcategory_id: subcategoryStillValid ? prev.subcategory_id : '',
        }));
    };

    const handleFileSelect = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            form.setError(
                'image',
                'Only image files (JPEG, PNG, JPG, WebP, SVG) are allowed.',
            );
            return;
        }
        form.setData('image', file);
        setImagePreview(URL.createObjectURL(file));
        form.clearErrors('image');
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const openCreateDialog = () => {
        setEditingProduct(null);
        setImagePreview(null);
        form.setData({
            category_id: '',
            subcategory_id: '',
            name: '',
            description: '',
            old_price: '',
            new_price: '',
            image: null,
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setEditingProduct(product);
        setImagePreview(product.image_url);
        form.setData({
            category_id: String(product.category_id),
            subcategory_id: String(product.subcategory_id),
            name: product.name,
            description: product.description,
            old_price:
                product.old_price !== null ? String(product.old_price) : '',
            new_price: String(product.new_price),
            image: null,
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            router.post(
                `/admin/products/${editingProduct.slug}`,
                {
                    _method: 'put',
                    category_id: form.data.category_id,
                    subcategory_id: form.data.subcategory_id,
                    name: form.data.name,
                    description: form.data.description,
                    old_price: form.data.old_price,
                    new_price: form.data.new_price,
                    ...(form.data.image ? { image: form.data.image } : {}),
                },
                {
                    forceFormData: true,
                    onError: (errors) => {
                        form.setError(errors);
                    },
                    onSuccess: () => {
                        setDialogOpen(false);
                        form.reset();
                        setImagePreview(null);
                    },
                },
            );
        } else {
            form.post('/admin/products', {
                forceFormData: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                    setImagePreview(null);
                },
            });
        }
    };

    const confirmDelete = (product: Product) => {
        setProductToDelete(product);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!productToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/products/${productToDelete.slug}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteOpen(false);
                setProductToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Manage Products" />

            <div className="flex flex-col gap-6">
                {/* Header Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Shared Product Catalog
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage products in the shared catalog. Products created here are available for all shop owners to select and list.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Product</span>
                    </Button>
                </div>

                {/* Products Table Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            All Products ({products.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {products.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <Package className="h-6 w-6" />
                                </div>
                                <h3 className="mt-3 text-sm font-semibold">
                                    No products in catalog
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Click "Add Product" to create your first
                                    e-commerce product.
                                </p>
                                <Button
                                    onClick={openCreateDialog}
                                    size="sm"
                                    className="mt-4 gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Product
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Product
                                            </th>
                                            <th className="px-4 py-3">
                                                Category
                                            </th>
                                            <th className="px-4 py-3">
                                                Created By
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                                Shops
                                            </th>
                                            <th className="px-4 py-3">Base Price</th>
                                            <th className="px-4 py-3 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {products.data.map((product) => {
                                            const oldPrice =
                                                product.old_price !== null
                                                    ? Number(product.old_price)
                                                    : null;
                                            const newPrice = Number(
                                                product.new_price,
                                            );
                                            const hasDiscount =
                                                oldPrice !== null &&
                                                oldPrice > newPrice;

                                            return (
                                                <tr
                                                    key={product.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={
                                                                    product.image_url
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-11 w-11 shrink-0 rounded-lg border object-cover"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-foreground">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </span>
                                                                <span className="font-mono text-xs text-muted-foreground">
                                                                    {product.path ??
                                                                        `/${product.slug}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {product.category
                                                                ?.name ?? '—'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {product.creator?.name ?? 'Admin'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {product.shop_products_count ?? 0} shops
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="font-bold text-foreground">
                                                                $
                                                                {newPrice.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                            {hasDiscount &&
                                                                oldPrice !==
                                                                    null && (
                                                                    <span className="text-xs text-muted-foreground line-through">
                                                                        $
                                                                        {oldPrice.toFixed(
                                                                            2,
                                                                        )}
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="View on Storefront"
                                                            >
                                                                <a
                                                                    href={
                                                                        product.path ??
                                                                        `/products/${product.slug}`
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        product,
                                                                    )
                                                                }
                                                                aria-label="Edit product"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                onClick={() =>
                                                                    confirmDelete(
                                                                        product,
                                                                    )
                                                                }
                                                                aria-label="Delete product"
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
                    </CardContent>
                    <Pagination data={products} />
                </Card>
            </div>

            {/* Create/Edit Product Dialog Modal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                    <form onSubmit={handleFormSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingProduct
                                    ? 'Edit Product'
                                    : 'Add New Product'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingProduct
                                    ? 'Update product details, pricing, and image.'
                                    : 'Add a new product to your e-commerce inventory.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-5 grid gap-4">
                            {/* Dependent Category & Subcategory Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="product-category">
                                        Category *
                                    </Label>
                                    <Select
                                        value={form.data.category_id}
                                        onValueChange={handleCategoryChange}
                                    >
                                        <SelectTrigger
                                            id="product-category"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={String(cat.id)}
                                                >
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={form.errors.category_id}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="product-subcategory">
                                        Subcategory *
                                    </Label>
                                    <Select
                                        value={form.data.subcategory_id}
                                        onValueChange={(val) =>
                                            form.setData('subcategory_id', val)
                                        }
                                        disabled={
                                            !form.data.category_id ||
                                            availableSubcategories.length === 0
                                        }
                                    >
                                        <SelectTrigger
                                            id="product-subcategory"
                                            className="w-full"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    !form.data.category_id
                                                        ? 'Select Category first'
                                                        : availableSubcategories.length ===
                                                            0
                                                          ? 'No subcategories available'
                                                          : 'Select Subcategory'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSubcategories.map(
                                                (subcat) => (
                                                    <SelectItem
                                                        key={subcat.id}
                                                        value={String(
                                                            subcat.id,
                                                        )}
                                                    >
                                                        {subcat.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={form.errors.subcategory_id}
                                    />
                                </div>
                            </div>

                            {/* Product Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="product-name">
                                    Product Name *
                                </Label>
                                <Input
                                    id="product-name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                                    required
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            {/* Prices Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="product-new-price">
                                        Selling Price ($) *
                                    </Label>
                                    <Input
                                        id="product-new-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.new_price}
                                        onChange={(e) =>
                                            form.setData(
                                                'new_price',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="99.99"
                                        required
                                    />
                                    <InputError
                                        message={form.errors.new_price}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="product-old-price">
                                        Old Price ($){' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (Optional Strikethrough)
                                        </span>
                                    </Label>
                                    <Input
                                        id="product-old-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.old_price}
                                        onChange={(e) =>
                                            form.setData(
                                                'old_price',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="129.99"
                                    />
                                    <InputError
                                        message={form.errors.old_price}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="product-description">
                                    Description *
                                </Label>
                                <textarea
                                    id="product-description"
                                    rows={3}
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                    placeholder="Comprehensive product specifications, features, and warranty details..."
                                    required
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            {/* Drag and Drop Product Image Upload */}
                            <div className="grid gap-2">
                                <Label htmlFor="product-image">
                                    Product Image{' '}
                                    {editingProduct
                                        ? '(Leave empty to keep existing)'
                                        : '*'}
                                </Label>

                                <div
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                                        isDragging
                                            ? 'scale-[1.01] border-primary bg-primary/10'
                                            : 'border-muted-foreground/25 bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        id="product-image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                            handleFileSelect(
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />

                                    {imagePreview ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="relative h-28 w-28 overflow-hidden rounded-lg border bg-background shadow-xs">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col items-center text-xs text-muted-foreground">
                                                <span className="font-semibold text-foreground">
                                                    {form.data.image
                                                        ? form.data.image.name
                                                        : 'Current Image Selected'}
                                                </span>
                                                <span className="mt-0.5 font-medium text-primary">
                                                    Drag and drop a new image or
                                                    click to replace
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <UploadCloud className="h-6 w-6" />
                                            </div>
                                            <div className="flex flex-col text-xs text-muted-foreground">
                                                <span className="text-sm font-semibold text-foreground">
                                                    Drag and drop product image
                                                    here
                                                </span>
                                                <span>
                                                    or click to browse files
                                                    from your computer
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground/70">
                                                JPEG, PNG, JPG, WebP, SVG (Max:
                                                2MB)
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <InputError message={form.errors.image} />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="gap-2"
                            >
                                {form.processing && <Spinner />}
                                {editingProduct
                                    ? 'Update Product'
                                    : 'Create Product'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Product"
                description={`Are you sure you want to delete "${productToDelete?.name}"? Its image and database record will be permanently removed.`}
                onConfirm={handleDelete}
                processing={isDeleting}
            />
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Products',
            href: '/admin/products',
        },
    ],
};
