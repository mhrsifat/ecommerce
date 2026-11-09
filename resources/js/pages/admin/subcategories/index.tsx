import { Head, useForm, router } from '@inertiajs/react';
import { Edit2, Layers, Plus, Trash2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import type { Category, PaginatedData, Subcategory } from '@/types';

type SubcategoriesIndexProps = {
    subcategories: PaginatedData<Subcategory>;
    categories: Category[];
};

export default function SubcategoriesIndex({
    subcategories,
    categories,
}: SubcategoriesIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSubcategory, setEditingSubcategory] =
        useState<Subcategory | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [subcategoryToDelete, setSubcategoryToDelete] =
        useState<Subcategory | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm({
        category_id: '',
        name: '',
    });

    const openCreateDialog = () => {
        setEditingSubcategory(null);
        form.setData({
            category_id: categories.length > 0 ? String(categories[0].id) : '',
            name: '',
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEditDialog = (subcategory: Subcategory) => {
        setEditingSubcategory(subcategory);
        form.setData({
            category_id: String(subcategory.category_id),
            name: subcategory.name,
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSubcategory) {
            form.put(`/admin/subcategories/${editingSubcategory.slug}`, {
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/admin/subcategories', {
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    const confirmDelete = (subcategory: Subcategory) => {
        setSubcategoryToDelete(subcategory);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!subcategoryToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/subcategories/${subcategoryToDelete.slug}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteOpen(false);
                setSubcategoryToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Manage Subcategories" />

            <div className="flex flex-col gap-6">
                {/* Header Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Subcategories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Define secondary groupings within your categories to
                            organize products cleanly.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Subcategory</span>
                    </Button>
                </div>

                {/* Subcategories Table Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            All Subcategories ({subcategories.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {subcategories.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <Layers className="h-6 w-6" />
                                </div>
                                <h3 className="mt-3 text-sm font-semibold">
                                    No subcategories created yet
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Create subcategories to organize products
                                    under your categories.
                                </p>
                                <Button
                                    onClick={openCreateDialog}
                                    size="sm"
                                    className="mt-4 gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Subcategory
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Subcategory Name
                                            </th>
                                            <th className="px-4 py-3">
                                                Parent Category
                                            </th>
                                            <th className="px-4 py-3">Slug</th>
                                            <th className="px-4 py-3 text-center">
                                                Products
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {subcategories.data.map(
                                            (subcategory) => (
                                                <tr
                                                    key={subcategory.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3 font-medium text-foreground">
                                                        {subcategory.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {subcategory
                                                                .category
                                                                ?.name ?? '—'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                        <Badge
                                                            variant="secondary"
                                                            className="font-mono text-xs"
                                                        >
                                                            {subcategory.slug}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {subcategory.products_count ??
                                                                0}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        subcategory,
                                                                    )
                                                                }
                                                                aria-label="Edit subcategory"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                onClick={() =>
                                                                    confirmDelete(
                                                                        subcategory,
                                                                    )
                                                                }
                                                                aria-label="Delete subcategory"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                    <Pagination data={subcategories} />
                </Card>
            </div>

            {/* Create/Edit Subcategory Modal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleFormSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingSubcategory
                                    ? 'Edit Subcategory'
                                    : 'Create New Subcategory'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingSubcategory
                                    ? 'Modify subcategory details and its parent category.'
                                    : 'Assign a subcategory to a parent category.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-5 grid gap-4">
                            {/* Parent Category Select */}
                            <div className="grid gap-2">
                                <Label htmlFor="parent-category">
                                    Parent Category
                                </Label>
                                <Select
                                    value={form.data.category_id}
                                    onValueChange={(val) =>
                                        form.setData('category_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="parent-category"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select parent category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.category_id} />
                            </div>

                            {/* Subcategory Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="subcategory-name">
                                    Subcategory Name
                                </Label>
                                <Input
                                    id="subcategory-name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Smartphones, Audio Devices"
                                    required
                                />
                                <InputError message={form.errors.name} />
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
                                {editingSubcategory
                                    ? 'Save Changes'
                                    : 'Create Subcategory'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Subcategory"
                description={`Are you sure you want to delete "${subcategoryToDelete?.name}"? If it has linked products, deletion will be blocked.`}
                onConfirm={handleDelete}
                processing={isDeleting}
            />
        </>
    );
}

SubcategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Subcategories',
            href: '/admin/subcategories',
        },
    ],
};
