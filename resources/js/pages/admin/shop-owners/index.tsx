import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Search, Store, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import type { PaginatedData, Shop, User } from '@/types';

type ShopOwnerWithShops = User & {
    shops: Shop[];
    shops_count: number;
    created_at: string;
};

type ShopOwnersIndexProps = {
    shopOwners: PaginatedData<ShopOwnerWithShops>;
    filters: { search?: string | null };
};

export default function ShopOwnersIndex({
    shopOwners,
    filters,
}: ShopOwnersIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOwner, setEditingOwner] = useState<ShopOwnerWithShops | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [ownerToDelete, setOwnerToDelete] = useState<ShopOwnerWithShops | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        shop_name: '',
    });

    const openCreateDialog = () => {
        setEditingOwner(null);
        form.reset();
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEditDialog = (owner: ShopOwnerWithShops) => {
        setEditingOwner(owner);
        form.clearErrors();
        form.setData({
            name: owner.name,
            email: owner.email,
            password: '',
            password_confirmation: '',
            shop_name: '',
        });
        setDialogOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingOwner) {
            form.put(`/admin/shop-owners/${editingOwner.id}`, {
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/admin/shop-owners', {
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    const confirmDelete = (owner: ShopOwnerWithShops) => {
        setOwnerToDelete(owner);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!ownerToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/shop-owners/${ownerToDelete.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteOpen(false);
                setOwnerToDelete(null);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/shop-owners',
            searchQuery.trim() ? { search: searchQuery.trim() } : {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Shop Owner Accounts - Admin" />

            <div className="flex flex-col gap-6">
                {/* Header & Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Shop Owner Accounts
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage shop owner user accounts who can manage product listings.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="shrink-0 gap-2">
                        <Plus className="h-4 w-4" />
                        Create Shop Owner
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
                                    placeholder="Search by owner name or email..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                </Card>

                {/* Shop Owners Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Shop Owners ({shopOwners.total})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {shopOwners.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <Users className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                <p className="font-medium">No shop owners found.</p>
                                <p className="text-xs">Create a shop owner account to grant merchant access.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Owner</th>
                                            <th className="px-4 py-3">Assigned Shops</th>
                                            <th className="px-4 py-3">Joined Date</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {shopOwners.data.map((owner) => (
                                            <tr key={owner.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {owner.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {owner.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {owner.shops && owner.shops.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {owner.shops.map((shop) => (
                                                                <Badge key={shop.id} variant="secondary" className="gap-1">
                                                                    <Store className="h-3 w-3" />
                                                                    {shop.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            No shop assigned yet
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                                    {owner.created_at ? new Date(owner.created_at).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            onClick={() => openEditDialog(owner)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            title="Edit Account"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => confirmDelete(owner)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            title="Delete Account"
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
                            <Pagination data={shopOwners} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingOwner ? 'Edit Shop Owner' : 'Create Shop Owner Account'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingOwner
                                ? 'Update shop owner name, email, or reset their password.'
                                : 'Create credentials for a shop owner to manage their storefront and products.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="owner_name">Full Name *</Label>
                            <Input
                                id="owner_name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="e.g. Rahim Ahmed"
                                className="mt-1"
                                required
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div>
                            <Label htmlFor="owner_email">Email Address *</Label>
                            <Input
                                id="owner_email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                placeholder="owner@shop.com"
                                className="mt-1"
                                required
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        {!editingOwner && (
                            <div>
                                <Label htmlFor="owner_shop_name">Shop Name (Optional)</Label>
                                <Input
                                    id="owner_shop_name"
                                    value={form.data.shop_name}
                                    onChange={(e) => form.setData('shop_name', e.target.value)}
                                    placeholder="e.g. Dhaka Tech Mart (auto-creates shop)"
                                    className="mt-1"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    If filled, a shop with this name will be automatically created and assigned.
                                </p>
                                <InputError message={form.errors.shop_name} />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="owner_password">
                                {editingOwner ? 'New Password (Leave blank to keep existing)' : 'Password *'}
                            </Label>
                            <Input
                                id="owner_password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="mt-1"
                                required={!editingOwner}
                            />
                            <InputError message={form.errors.password} />
                        </div>

                        <div>
                            <Label htmlFor="owner_password_confirmation">Confirm Password</Label>
                            <Input
                                id="owner_password_confirmation"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                placeholder="••••••••"
                                className="mt-1"
                                required={Boolean(form.data.password)}
                            />
                            <InputError message={form.errors.password_confirmation} />
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
                                {editingOwner ? 'Save Changes' : 'Create Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Shop Owner"
                description={`Are you sure you want to delete the account for "${ownerToDelete?.name}"?`}
                onConfirm={handleDelete}
                processing={isDeleting}
            />
        </>
    );
}

ShopOwnersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Shop Owners',
            href: '/admin/shop-owners',
        },
    ],
};
