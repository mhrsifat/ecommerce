import { Head, router, useForm } from '@inertiajs/react';
import {
    Edit2,
    ExternalLink,
    Plus,
    Search,
    Store,
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
import type { PaginatedData, Shop, User } from '@/types';

type ShopsIndexProps = {
    shops: PaginatedData<Shop>;
    shopOwners: Pick<User, 'id' | 'name' | 'email'>[];
    filters: { search?: string | null };
};

export default function ShopsIndex({
    shops,
    shopOwners = [],
    filters,
}: ShopsIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');

    const form = useForm<{
        name: string;
        user_id: string;
        description: string;
        email: string;
        phone: string;
        address: string;
        is_active: boolean;
        logo: File | null;
    }>({
        name: '',
        user_id: shopOwners[0]?.id ? String(shopOwners[0].id) : '',
        description: '',
        email: '',
        phone: '',
        address: '',
        is_active: true,
        logo: null,
    });

    const openCreateDialog = () => {
        setEditingShop(null);
        setLogoPreview(null);
        form.reset();
        form.clearErrors();
        form.setData({
            name: '',
            user_id: shopOwners[0]?.id ? String(shopOwners[0].id) : '',
            description: '',
            email: '',
            phone: '',
            address: '',
            is_active: true,
            logo: null,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (shop: Shop) => {
        setEditingShop(shop);
        setLogoPreview(shop.logo_url ?? null);
        form.clearErrors();
        form.setData({
            name: shop.name,
            user_id: String(shop.user_id),
            description: shop.description ?? '',
            email: shop.email ?? '',
            phone: shop.phone ?? '',
            address: shop.address ?? '',
            is_active: shop.is_active,
            logo: null,
        });
        setDialogOpen(true);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingShop) {
            form.post(`/admin/shops/${editingShop.slug}`, {
                headers: {
                    'X-HTTP-Method-Override': 'PUT',
                },
                forceFormData: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/admin/shops', {
                forceFormData: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    const confirmDelete = (shop: Shop) => {
        setShopToDelete(shop);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!shopToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/shops/${shopToDelete.slug}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteOpen(false);
                setShopToDelete(null);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/shops',
            searchQuery.trim() ? { search: searchQuery.trim() } : {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Shop Management - Admin" />

            <div className="flex flex-col gap-6">
                {/* Header & Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Shop Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create, update, and manage merchant shops and assign their shop owners.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="shrink-0 gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Shop
                    </Button>
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
                                    placeholder="Search by shop name, owner name, or email..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                </Card>

                {/* Shops Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Registered Shops ({shops.total})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {shops.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <Store className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                <p className="font-medium">No shops found.</p>
                                <p className="text-xs">Create your first shop using the button above.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Shop</th>
                                            <th className="px-4 py-3">Shop Owner</th>
                                            <th className="px-4 py-3">Contact</th>
                                            <th className="px-4 py-3 text-center">Listings</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {shops.data.map((shop) => (
                                            <tr key={shop.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={shop.logo_url}
                                                            alt={shop.name}
                                                            className="h-10 w-10 rounded-lg border object-cover shrink-0"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-foreground">
                                                                {shop.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                                                {shop.description || 'No description provided'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {shop.owner ? (
                                                        <div>
                                                            <div className="font-medium">{shop.owner.name}</div>
                                                            <div className="text-xs text-muted-foreground">{shop.owner.email}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">None</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                                    <div>{shop.email || '—'}</div>
                                                    <div>{shop.phone || '—'}</div>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <Badge variant="outline">
                                                        {shop.products_count ?? 0} products
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <Badge variant={shop.is_active ? 'default' : 'secondary'}>
                                                        {shop.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            title="View Storefront"
                                                        >
                                                            <a href={`/shops/${shop.slug}`} target="_blank" rel="noreferrer">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            onClick={() => openEditDialog(shop)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            title="Edit Shop"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => confirmDelete(shop)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            title="Delete Shop"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="p-4 border-t">
                            <Pagination data={shops} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create / Edit Shop Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingShop ? 'Edit Shop' : 'Create New Shop'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingShop
                                ? 'Update shop information and assigned owner.'
                                : 'Add a new merchant shop to the platform.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="shop_name">Shop Name *</Label>
                            <Input
                                id="shop_name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="e.g. Dhaka Electronics"
                                className="mt-1"
                                required
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div>
                            <Label htmlFor="shop_owner">Shop Owner *</Label>
                            <Select
                                value={form.data.user_id}
                                onValueChange={(val) => form.setData('user_id', val)}
                            >
                                <SelectTrigger id="shop_owner" className="mt-1">
                                    <SelectValue placeholder="Select a shop owner..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {shopOwners.map((owner) => (
                                        <SelectItem key={owner.id} value={String(owner.id)}>
                                            {owner.name} ({owner.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.user_id} />
                        </div>

                        <div>
                            <Label htmlFor="shop_description">Description</Label>
                            <textarea
                                id="shop_description"
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Brief summary of this shop..."
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <InputError message={form.errors.description} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="shop_email">Contact Email</Label>
                                <Input
                                    id="shop_email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    placeholder="shop@example.com"
                                    className="mt-1"
                                />
                                <InputError message={form.errors.email} />
                            </div>
                            <div>
                                <Label htmlFor="shop_phone">Contact Phone</Label>
                                <Input
                                    id="shop_phone"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    placeholder="+8801..."
                                    className="mt-1"
                                />
                                <InputError message={form.errors.phone} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="shop_address">Store Address</Label>
                            <Input
                                id="shop_address"
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                placeholder="e.g. Level 4, Bashundhara City, Dhaka"
                                className="mt-1"
                            />
                            <InputError message={form.errors.address} />
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <Label>Shop Logo</Label>
                            <div className="mt-1 flex items-center gap-4">
                                {logoPreview && (
                                    <img
                                        src={logoPreview}
                                        alt="Preview"
                                        className="h-14 w-14 rounded-lg border object-cover"
                                    />
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="gap-2"
                                >
                                    <UploadCloud className="h-4 w-4" />
                                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                </Button>
                            </div>
                            <InputError message={form.errors.logo} />
                        </div>

                        {/* Active Switch */}
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                id="shop_active"
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="shop_active" className="cursor-pointer">
                                Active (visible on public storefront)
                            </Label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing && <Spinner className="mr-2" />}
                                {editingShop ? 'Save Changes' : 'Create Shop'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Shop"
                description={`Are you sure you want to delete "${shopToDelete?.name}"? All shop-specific listings will be removed.`}
                onConfirm={handleDelete}
                processing={isDeleting}
            />
        </>
    );
}

ShopsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Shops',
            href: '/admin/shops',
        },
    ],
};
