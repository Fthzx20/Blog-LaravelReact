import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area"

// Types for props
interface User {
    id: number;
    name: string;
}

interface Comment {
    id: number;
    content: string;
    user: User;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    category_id: number;
    category: Category;
    published_at: string | null;
    comments: Comment[];
    comments_count: number;
    image?: string | null;
    image_url?: string | null;
}

interface PaginatedData {
    data: Post[];
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

interface PostsPageProps {
    posts: PaginatedData;
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Posts',
        href: '/admin/posts',
    },
];

export default function PostsPage({ posts, categories }: PostsPageProps) {
    const [showModal, setShowModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [editPost, setEditPost] = useState<Post | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        image: null as File | null,
        content: '',
        category_id: '',
        published_at: '',
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setPreviewImage(null);
        }
    };

    const handleAdd = () => {
        setEditPost(null);
        setPreviewImage(null);
        setFormData({
            title: '',
            image: null,
            content: '',
            category_id: '',
            published_at: '',
        });
        setShowModal(true);
    };

    const handleEdit = (post: Post) => {
        setEditPost(post);
        setPreviewImage(post.image_url ?? null);
        setFormData({
            title: post.title,
            image: null,
            content: post.content,
            category_id: post.category_id.toString(),
            published_at: post.published_at || '',
        });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(`/admin/posts/${id}`, {
                onSuccess: () => {
                    toast.success('Post deleted successfully', {
                        duration: 3000,
                        position: 'top-right',
                    });
                },
                onError: () => {
                    toast.error('Failed to delete post', {
                        duration: 3000,
                        position: 'top-right',
                    });
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append('title', formData.title);
        if (formData.image) payload.append('image', formData.image);
        payload.append('content', formData.content);
        payload.append('category_id', formData.category_id);
        payload.append('published_at', formData.published_at);

        if (editPost) {
            payload.append('_method', 'PUT'); // Laravel baca ini sebagai update
            router.post(`/admin/posts/${editPost.id}`, payload, {
                forceFormData: true,
                onSuccess: () => {
                    setShowModal(false);
                    toast.success('Post updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update post');
                },
            });
        } else {
            router.post('/admin/posts', payload, {
                forceFormData: true,
                onSuccess: () => {
                    setShowModal(false);
                    toast.success('Post created successfully');
                },
                onError: () => {
                    toast.error('Failed to create post');
                },
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('admin.posts.index'),
            { page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleShowComments = (post: Post) => {
        setSelectedPost(post);
        setShowCommentsModal(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <Toaster richColors closeButton />
            <div className="flex flex-col gap-4 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Posts</h1> <Button onClick={handleAdd}>Add Blog </Button>{' '}
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead> <TableHead>Category</TableHead> <TableHead>Published At</TableHead>{' '}
                                <TableHead>Comments</TableHead> <TableHead>Actions</TableHead>{' '}
                            </TableRow>{' '}
                        </TableHeader>{' '}
                        <TableBody>
                            {posts.data.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>{post.title}</TableCell> <TableCell>{post.category?.name}</TableCell>{' '}
                                    <TableCell>{post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}</TableCell>{' '}
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleShowComments(post)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            {post.comments_count} Comments{' '}
                                        </Button>{' '}
                                    </TableCell>{' '}
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                                                Edit{' '}
                                            </Button>{' '}
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                                                Delete{' '}
                                            </Button>{' '}
                                        </div>{' '}
                                    </TableCell>{' '}
                                </TableRow>
                            ))}
                        </TableBody>{' '}
                    </Table>{' '}
                </div>
                {/* Pagination */}
                <div className="mt-4 flex justify-start">
                    <nav className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(posts.current_page - 1)}
                            disabled={posts.current_page === 1}
                            className="h-8 px-2"
                        >
                            Previous{' '}
                        </Button>
                        <div className="flex items-center space-x-1">
                            {posts.links.map((link, i) => {
                                if (link.label === '...') {
                                    return (
                                        <span key={i} className="px-2">
                                            ...
                                        </span>
                                    );
                                }

                                if (link.url === null) {
                                    return null;
                                }

                                const page = parseInt(link.label);
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
                            onClick={() => handlePageChange(posts.current_page + 1)}
                            disabled={posts.current_page === posts.last_page}
                            className="h-8 px-2"
                        >
                            Next{' '}
                        </Button>{' '}
                    </nav>{' '}
                </div>
                {/* Comments Modal */}
                <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Comments for {selectedPost?.title}</DialogTitle>{' '}
                            <DialogDescription>View all comments on this Post </DialogDescription>{' '}
                        </DialogHeader>{' '}
                        <div className="max-h-[400px] overflow-y-auto">
                            {selectedPost?.comments.map((comment) => (
                                <div key={comment.id} className="border-b py-3 last:border-b-0">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="font-medium">{comment.user.name}</div>{' '}
                                        <div className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</div>
                                    </div>{' '}
                                    <p className="text-gray-700">{comment.content}</p>{' '}
                                </div>
                            ))}
                            {selectedPost?.comments.length === 0 && <div className="py-4 text-center text-gray-500">No comments yet </div>}
                        </div>
                    </DialogContent>{' '}
                </Dialog>
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editPost ? 'Edit Blog' : 'Add Blog'}</DialogTitle>{' '}
                            <DialogDescription>
                                {editPost ? 'Make changes to your blog post here.' : 'Create a new blog post here.'}
                            </DialogDescription>{' '}
                        </DialogHeader>{' '}
                        <div className="max-h-[80vh] overflow-y-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>{' '}
                                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Image</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setFormData((prev) => ({
                                                ...prev,
                                                image: file,
                                            }));

                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setPreviewImage(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            } else {
                                                setPreviewImage(null);
                                            }
                                        }}
                                    />

                                    {previewImage && <img src={previewImage} alt="Preview" className="mb-4 h-auto max-w-full rounded" />}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>{' '}
                                    <Textarea
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        required
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>{' '}
                                    <Select value={formData.category_id} onValueChange={(value) => handleSelectChange('category_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>{' '}
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>{' '}
                                    </Select>{' '}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="published_at">Published At</Label>{' '}
                                    <Input
                                        id="published_at"
                                        name="published_at"
                                        type="datetime-local"
                                        value={formData.published_at}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                        Cancel{' '}
                                    </Button>{' '}
                                    <Button type="submit">{editPost ? 'Update' : 'Create'}</Button>{' '}
                                </DialogFooter>{' '}
                            </form>{' '}
                        </div>
                    </DialogContent>{' '}
                </Dialog>{' '}
            </div>{' '}
        </AppLayout>
    );
}
