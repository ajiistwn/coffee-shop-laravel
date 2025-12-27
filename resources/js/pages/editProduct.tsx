import { AppSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { MoreHorizontal } from 'lucide-react';

import { Textarea } from '@/components/ui/textarea';
import { Link, usePage } from '@inertiajs/react';
import axios, { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type Variant = {
    id: number | null; // Null for new variants
    status: string;
    name: string;
    price: number;
    deleted_at?: string | null; // Optional, can be string or null
};

type Product = {
    id: number;
    name: string;
    category_id: number;
    status: string;
    description: string;
    image?: string | null;
    variants: Variant[];
};

export default function ProductEdit() {
    const { product, categories, variant } = usePage<{
        product: Product;
        categories: Category[];
        variant: Variant[];
    }>().props;

    console.log('Product:', product);

    const [formProduct, setFormProduct] = useState({
        name: product.name || '',
        category_id: product.category_id?.toString() || '',
        status: product.status || 'available',
        description: product.description || '',
        image: null as File | null,
    });

    const [formVariant, setFormVariant] = useState<Variant>({
        id: null,
        name: '',
        status: 'available',
        price: 0,
    });

    const [variants, setVariants] = useState<Variant[]>(variant || []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [trashedFilter, setTrashedFilter] = useState('');

    useEffect(() => {
        if (product.image) {
            setFormProduct((prev) => ({ ...prev, image: null }));
        }
    }, [product]);

    useEffect(() => {
        setVariants(variant);
        console.log('Variants:', variant);
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormProduct((prev) => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const addVariant = () => {
        setFormVariant({
            id: null,
            name: '',
            status: 'active',
            price: 0,
        });
        setIsEditMode(false);
        setIsModalOpen(true);
    };
    useEffect(() => {
        console.log('Current Variant:', variants);
    }, [variants]);

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        fetchVariants({
            search: searchTerm,
            status: value,
            trashed: trashedFilter,
        });
    };

    const handleTrashedChange = (value: string) => {
        setTrashedFilter(value);
        fetchVariants({
            search: searchTerm,
            status: statusFilter,
            trashed: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // --- 1. Handle Product Update ---
        const productData = new FormData();
        productData.append('_method', 'PUT');
        productData.append('name', formProduct.name.toString());
        productData.append('category_id', formProduct.category_id.toString());
        productData.append('status', formProduct.status);
        productData.append('description', formProduct.description);
        if (formProduct.image) {
            productData.append('image', formProduct.image);
        }

        try {
            // Kirim permintaan update untuk produk
            await axios.post(`/tools/products/${product.id}`, productData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Product updated successfully');

            // Di sini, kita TIDAK mengirimkan data variant lagi ke endpoint produk
            // Semua logika variant ditangani secara terpisah
        } catch (error: unknown) {
            console.error('Failed to update product:', error);
            if (isAxiosError(error) && error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('An error occurred while updating the product.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVariantSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Mencegah submit form utama saat submit modal

        try {
            if (isEditMode && currentVariant) {
                // Update variant lama (menggunakan ID yang sebenarnya)
                if (currentVariant.id !== null) {
                    await axios.put(`/tools/variants/${currentVariant.id}`, {
                        name: formVariant.name,
                        status: formVariant.status,
                        price: formVariant.price,
                        // product_id mungkin tidak perlu diupdate jika tidak bisa berubah
                    });
                    console.log(`Variant ${currentVariant.id} updated`);
                }
            } else if (!isEditMode) {
                // Tambah variant baru
                await axios.post('/tools/variants', {
                    name: formVariant.name,
                    status: formVariant.status,
                    price: formVariant.price,
                    product_id: product.id, // Kirim ID produk sebagai referensi
                });
                console.log('New variant created');
            }

            // Reset form dan modal setelah submit
            setIsModalOpen(false);
            setFormVariant({
                id: null,
                name: '',
                status: 'available',
                price: 0,
            });

            // Refresh daftar variant untuk mencerminkan perubahan
            fetchVariants();
        } catch (error: unknown) {
            console.error('Failed to save variant:', error);
            if (isAxiosError(error) && error.response?.data?.errors) {
                // Perlu menyesuaikan cara menampilkan error jika hanya dari variant
                // Misalnya, menampilkannya di dalam modal
                console.error(
                    'Variant validation errors:',
                    error.response.data.errors,
                );
                alert(
                    'Validation error occurred while saving the variant. Check console.',
                );
            } else {
                alert('An error occurred while saving the variant.');
            }
        }
    };

    const handleEditVariant = (variant: Variant) => {
        setCurrentVariant(variant);
        setFormVariant(variant);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const fetchVariants = async (filter = {}) => {
        try {
            const response = await axios.get(`/tools/variants`, {
                params: { ...filter, product_id: product.id },
            });
            console.log('Fetched variants:', response);
            setVariants(response.data);
        } catch (error) {
            console.error('Failed to fetch variants:', error);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                    </div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="md:block">
                                <BreadcrumbLink href="/product">
                                    Products
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="mx-2" />
                            <BreadcrumbPage className="md:block">
                                <BreadcrumbLink
                                    href={`/product/edit/${product.id}`}
                                >
                                    Edit Product {product.name}
                                </BreadcrumbLink>
                            </BreadcrumbPage>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold">Edit Product</h2>
                    </div>

                    {(formProduct.image || product.image) && (
                        <div className="my-0 flex justify-start">
                            <Avatar className="h-32 w-32 rounded-none border">
                                <AvatarImage
                                    src={
                                        formProduct.image
                                            ? URL.createObjectURL(
                                                  formProduct.image,
                                              )
                                            : product.image || ''
                                    }
                                    alt="Product Preview"
                                    className="h-full w-full object-contain"
                                />
                                <AvatarFallback className="rounded-none">
                                    IMG
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formProduct.name}
                                        onChange={handleChange}
                                        placeholder="Enter product name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="category_id">
                                        Category
                                    </Label>
                                    <Select
                                        value={formProduct.category_id}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                'category_id',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.category_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formProduct.status}
                                        onValueChange={(value) =>
                                            handleSelectChange('status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">
                                                Available
                                            </SelectItem>
                                            <SelectItem value="unavailable">
                                                Unavailable
                                            </SelectItem>
                                            <SelectItem value="sold">
                                                Sold
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="image">Product Image</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.image}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formProduct.description}
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    className="min-h-[200px]"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Variants Table */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">
                                Product Variants
                            </h3>
                            <div
                                // onSubmit={}
                                className="mt-2 flex flex-col gap-3 md:flex-row"
                            >
                                {/* Status filter */}
                                <Select
                                    value={statusFilter}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full md:w-1/4">
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="available">
                                            Available
                                        </SelectItem>
                                        <SelectItem value="unavailable">
                                            Unavailable
                                        </SelectItem>
                                        <SelectItem value="sold">
                                            Sold
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Trashed filter */}
                                <Select
                                    value={trashedFilter}
                                    onValueChange={handleTrashedChange}
                                >
                                    <SelectTrigger className="w-full md:w-1/4">
                                        <SelectValue placeholder="Filter deleted" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">
                                            Not Deleted Only
                                        </SelectItem>
                                        <SelectItem value="only">
                                            Soft Deleted Only
                                        </SelectItem>
                                        <SelectItem value="with">
                                            Include Deleted
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Reset */}
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('');
                                        setTrashedFilter('');
                                        fetchVariants({});
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {variants.map(
                                        (variant: Variant, index: number) => (
                                            <TableRow key={variant.id || index}>
                                                <TableCell>
                                                    {variant.name}
                                                    {variant.deleted_at && (
                                                        <Badge className="bg-gray-200 px-1 py-0.5 text-xs text-gray-700">
                                                            Deleted
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {variant.status ===
                                                        'available' && (
                                                        <Badge className="bg-green-500 px-2">
                                                            Available
                                                        </Badge>
                                                    )}

                                                    {variant.status ===
                                                        'unavailable' && (
                                                        <Badge className="bg-red-500 px-2">
                                                            Unavailable
                                                        </Badge>
                                                    )}

                                                    {variant.status ===
                                                        'sold' && (
                                                        <Badge className="bg-yellow-500 px-2">
                                                            Sold
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    Rp.
                                                    {variant.price.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-40"
                                                        >
                                                            {/* Edit */}
                                                            {!variant.deleted_at && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleEditVariant(
                                                                            variant,
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            )}

                                                            {/* Jika BELUM soft delete → tampilkan Soft Delete */}
                                                            {!variant.deleted_at && (
                                                                <DropdownMenuItem
                                                                    className="font-medium text-orange-600"
                                                                    onClick={async () => {
                                                                        if (
                                                                            variant.id !==
                                                                            null
                                                                        ) {
                                                                            try {
                                                                                await axios.delete(
                                                                                    `/tools/variants/${variant.id}`,
                                                                                );
                                                                                setVariants(
                                                                                    (
                                                                                        prev,
                                                                                    ) =>
                                                                                        prev.filter(
                                                                                            (
                                                                                                variant,
                                                                                            ) =>
                                                                                                variant.id !==
                                                                                                variant.id,
                                                                                        ),
                                                                                );
                                                                                alert(
                                                                                    'variant soft deleted',
                                                                                );
                                                                                fetchVariants();
                                                                            } catch (error) {
                                                                                console.error(
                                                                                    error,
                                                                                );
                                                                                alert(
                                                                                    'Soft delete failed',
                                                                                );
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    Soft Delete
                                                                </DropdownMenuItem>
                                                            )}

                                                            {/* Jika SUDAH soft delete → tampilkan Restore */}
                                                            {variant.deleted_at && (
                                                                <DropdownMenuItem
                                                                    className="text-blue-600"
                                                                    onClick={async () => {
                                                                        if (
                                                                            variant.id !==
                                                                            null
                                                                        ) {
                                                                            try {
                                                                                await axios.post(
                                                                                    `/tools/variants/${variant.id}/restore`,
                                                                                );
                                                                                fetchVariants();
                                                                                alert(
                                                                                    'variant restored',
                                                                                );
                                                                            } catch {
                                                                                alert(
                                                                                    'Restore failed',
                                                                                );
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    Restore
                                                                </DropdownMenuItem>
                                                            )}

                                                            {/* Hard Delete selalu ada (opsional) */}
                                                            <DropdownMenuItem
                                                                className="font-bold text-red-600"
                                                                onClick={async () => {
                                                                    if (
                                                                        variant.id !==
                                                                        null
                                                                    ) {
                                                                        try {
                                                                            await axios.delete(
                                                                                `/tools/variants/${variant.id}/force-delete`,
                                                                            );
                                                                            setVariants(
                                                                                (
                                                                                    prev,
                                                                                ) =>
                                                                                    prev.filter(
                                                                                        (
                                                                                            variant,
                                                                                        ) =>
                                                                                            variant.id !==
                                                                                            variant.id,
                                                                                    ),
                                                                            );
                                                                            fetchVariants();
                                                                            alert(
                                                                                'variant permanently deleted',
                                                                            );
                                                                        } catch {
                                                                            alert(
                                                                                'Hard delete failed',
                                                                            );
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                Hard Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={(e) => {
                                    e.preventDefault();
                                    addVariant();
                                }}
                            >
                                Add Variant
                            </Button>
                        </div>
                        {/* Modal for Add/Edit Category */}
                        <Dialog
                            open={isModalOpen}
                            onOpenChange={setIsModalOpen}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {isEditMode ? 'Edit' : 'Add'} Variant
                                    </DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to save the
                                        variant.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleVariantSubmit}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label
                                                htmlFor="name"
                                                className="text-right"
                                            >
                                                Name
                                            </label>
                                            <Input
                                                id="name"
                                                value={formVariant.name}
                                                onChange={(e) =>
                                                    setFormVariant({
                                                        ...formVariant,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="col-span-3"
                                            />
                                        </div>
                                        {/* Price Field */}
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label
                                                htmlFor="price"
                                                className="text-right"
                                            >
                                                Price
                                            </label>
                                            <Input
                                                id="price"
                                                type="number" // Restrict input to numeric values
                                                min="0" // Ensure price is non-negative
                                                value={formVariant.price || ''}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    const numericValue =
                                                        value === ''
                                                            ? 0
                                                            : Number(value);
                                                    if (
                                                        !isNaN(numericValue) &&
                                                        numericValue >= 0
                                                    ) {
                                                        setFormVariant({
                                                            ...formVariant,
                                                            price: numericValue,
                                                        });
                                                    }
                                                }}
                                                className="col-span-3"
                                            />
                                            {errors.price && (
                                                <p className="col-span-3 text-sm text-red-600">
                                                    {errors.price}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label
                                                htmlFor="status"
                                                className="text-right"
                                            >
                                                Status
                                            </label>
                                            <Select
                                                value={formVariant.status}
                                                onValueChange={(value) =>
                                                    setFormVariant({
                                                        ...formVariant,
                                                        status: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="available">
                                                        Available
                                                    </SelectItem>
                                                    <SelectItem value="unavailable">
                                                        Unavailable
                                                    </SelectItem>
                                                    <SelectItem value="sold">
                                                        sold
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">
                                            {isEditMode ? 'Update' : 'Save'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <div className="flex justify-start gap-4 pt-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/product">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
