import { Head, useForm, router } from '@inertiajs/react';
import { Edit2, FolderTree, Plus, Trash2 } from 'lucide-react';
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
import type { Category, PaginatedData } from '@/types';

type CategoriesIndexProps = {
    categories: PaginatedData<Category>;
};

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm({
        name: '',
    });

    const openCreateDialog = () => {
        setEditingCategory(null);
        form.reset();
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        form.setData('name', category.name);
        form.clearErrors();
        setDialogOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            form.put(`/admin/categories/${editingCategory.slug}`, {
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/admin/categories', {
                onSuccess: () => {
                    setDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    const confirmDelete = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/categories/${categoryToDelete.slug}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteOpen(false);
                setCategoryToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Manage Categories" />

            <div className="flex flex-col gap-6">
                {/* Header Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Organize your e-commerce catalog into top-level
                            product categories.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Category</span>
                    </Button>
                </div>

                {/* Categories Table Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            All Categories ({categories.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {categories.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <FolderTree className="h-6 w-6" />
                                </div>
                                <h3 className="mt-3 text-sm font-semibold">
                                    No categories created yet
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Get started by adding your first product
                                    category.
                                </p>
                                <Button
                                    onClick={openCreateDialog}
                                    size="sm"
                                    className="mt-4 gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Category
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Category Name
                                            </th>
                                            <th className="px-4 py-3">Slug</th>
                                            <th className="px-4 py-3 text-center">
                                                Subcategories
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                                Products
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {categories.data.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    {category.name}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-xs"
                                                    >
                                                        {category.slug}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {category.subcategories_count ??
                                                            0}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {category.products_count ??
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
                                                                    category,
                                                                )
                                                            }
                                                            aria-label="Edit category"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    category,
                                                                )
                                                            }
                                                            aria-label="Delete category"
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
                    </CardContent>
                    <Pagination data={categories} />
                </Card>
            </div>

            {/* Create/Edit Category Modal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleFormSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory
                                    ? 'Edit Category'
                                    : 'Create New Category'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? 'Update the name of this product category.'
                                    : 'Add a new category to group your products.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-5 grid gap-2">
                            <Label htmlFor="category-name">Category Name</Label>
                            <Input
                                id="category-name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="e.g. Electronics, Home & Living"
                                autoFocus
                                required
                            />
                            <InputError message={form.errors.name} />
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
                                {editingCategory
                                    ? 'Save Changes'
                                    : 'Create Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Category"
                description={`Are you sure you want to delete "${categoryToDelete?.name}"? If it has linked subcategories or products, deletion will be blocked.`}
                onConfirm={handleDelete}
                processing={isDeleting}
            />
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Categories',
            href: '/admin/categories',
        },
    ],
};
