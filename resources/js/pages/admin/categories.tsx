import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';;

interface Category {
    id: number;
    name: string;
    posts_count: number;
}

interface PaginatedData {
    data: Category[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface CategoryPageProps {
    categories: PaginatedData;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/admin/categories',
    },
];

export default function CategoriesPage({ categories }: CategoryPageProps) {
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '' });

    const handleAdd = () => {
        setEditCategory(null);
        setFormData({ name: '' });
        setShowModal(true);
    };

    const handleEdit = (category: Category) => {
        setEditCategory(category);
        setFormData({ name: category.name });
        setShowModal(true);
    };

const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
        router.delete(route('admin.categories.destroy', id), {
            onSuccess: () => toast.success('Category deleted successfully.'),
            onError: (errors) => toast.error(errors.error || 'Failed to delete category.'),
        });
    }
};

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editCategory) {
        router.put(route('admin.categories.update', editCategory.id), formData, {
            onSuccess: () => {
                setShowModal(false);
                toast.success('Category updated successfully.');
            },
            onError: (errors) => toast.error(errors.name || 'Failed to update category.'),
        });
    } else {
        router.post(route('admin.categories.store'), formData, {
            onSuccess: () => {
                setShowModal(false);
                toast.success('Category created successfully.');
            },
            onError: (errors) => toast.error(errors.name || 'Failed to create category.'),
        });
    }
};

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('admin.categories.index'),
            { page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <Toaster richColors closeButton position="top-right" />

            <div className="flex flex-col gap-4 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <Button onClick={handleAdd}>Add Category</Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Posts Count</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.posts_count}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex justify-start">
                    <nav className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(categories.current_page - 1)}
                            disabled={categories.current_page === 1}
                            className="h-8 px-2"
                        >
                            Previous
                        </Button>

                        <div className="flex items-center space-x-1">
                            {categories.links.map((link, i) => {
                                if (link.label === '...') {
                                    return (
                                        <span key={i} className="px-2">
                                            ...
                                        </span>
                                    );
                                }

                                if (link.url === null) return null;

                                const page = parseInt(link.label, 10);

                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handlePageChange(page)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(categories.current_page + 1)}
                            disabled={categories.current_page === categories.last_page}
                            className="h-8 px-2"
                        >
                            Next
                        </Button>
                    </nav>
                </div>
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                            <DialogDescription>{editCategory ? 'Edit the category details.' : 'Create a new category.'}</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">{editCategory ? 'Update Category' : 'Create Category'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
