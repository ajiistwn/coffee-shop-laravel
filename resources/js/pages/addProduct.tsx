import { AppSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Link, usePage } from '@inertiajs/react';
import axios, { isAxiosError } from 'axios';
import { useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type Variant = {
    id: number;
    name: string;
    status: string;
    price: number;
};

// Tipe untuk error variant
type VariantErrors = {
    name?: string;
    status?: string;
    price?: string;
};

export default function ProductCreate() {
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        status: 'available',
        description: '',
        image: null as File | null,
    });

    const [variants, setVariants] = useState<Variant[]>([]);
    // Ubah tipe state errors
    const [errors, setErrors] = useState<Record<string, string>>({}); // Error untuk field utama
    const [variantErrors, setVariantErrors] = useState<
        Record<number, VariantErrors>
    >({}); // Error untuk field variant
    const [isLoading, setIsLoading] = useState(false);

    const { categories } = usePage<{ categories: Category[] }>().props;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const handleVariantChange = (
        index: number,
        field: keyof Variant,
        value: string | number,
    ) => {
        const updatedVariants = [...variants];
        updatedVariants[index][field] = value as never;
        setVariants(updatedVariants);

        // Bersihkan error untuk field yang sedang diedit
        setVariantErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors[index]) {
                delete newErrors[index][field as keyof VariantErrors];
                // Jika objek error untuk index ini kosong, hapus juga objeknya
                if (Object.keys(newErrors[index]).length === 0) {
                    delete newErrors[index];
                }
            }
            return newErrors;
        });
    };

    const addVariant = () => {
        setVariants([
            ...variants,
            { id: Date.now(), name: '', status: 'available', price: 0 },
        ]);
    };

    const removeVariant = (id: number) => {
        setVariants(variants.filter((v) => v.id !== id));
        // Hapus juga error untuk variant yang dihapus
        setVariantErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Reset semua error
        setErrors({});
        setVariantErrors({});

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category_id', formData.category_id);
        data.append('status', formData.status);
        data.append('description', formData.description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        // Append variants
        variants.forEach((variant, index) => {
            data.append(`variants[${index}][name]`, variant.name);
            data.append(`variants[${index}][status]`, variant.status);
            data.append(`variants[${index}][price]`, variant.price.toString());
        });

        try {
            await axios.post('/tools/products', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Redirect to product list
            window.location.href = '/product';
        } catch (error: unknown) {
            console.error('Failed to create product:', error);
            if (isAxiosError(error)) {
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.errors
                ) {
                    const apiErrors = error.response.data.errors;
                    const newErrors: Record<string, string> = {};
                    const newVariantErrors: Record<number, VariantErrors> = {};

                    Object.entries(apiErrors).forEach(([key, messages]) => {
                        // Contoh key: "name", "variants.0.name"
                        const messageString = Array.isArray(messages)
                            ? messages[0]
                            : messages;

                        if (key.startsWith('variants.')) {
                            // Pisahkan key menjadi bagian-bagian: ["variants", "0", "name"]
                            const parts = key.split('.');
                            const index = parseInt(parts[1], 10);
                            const field = parts[2];

                            if (!isNaN(index) && field) {
                                // Inisialisasi objek error untuk index ini jika belum ada
                                if (!newVariantErrors[index]) {
                                    newVariantErrors[index] = {};
                                }
                                // Simpan pesan error ke field yang sesuai
                                (newVariantErrors[index] as VariantErrors)[
                                    field as keyof VariantErrors
                                ] = messageString;
                            }
                        } else {
                            // Error untuk field utama
                            newErrors[key] = messageString;
                        }
                    });

                    setErrors(newErrors);
                    setVariantErrors(newVariantErrors);
                }
            }
        } finally {
            setIsLoading(false);
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
                            <BreadcrumbPage className="hidden md:block">
                                <BreadcrumbLink href={`/product/add`}>
                                    Add Product
                                </BreadcrumbLink>
                            </BreadcrumbPage>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold">Create Product</h2>
                    </div>

                    {formData.image && (
                        <div className="my-0 flex justify-start">
                            <Avatar className="h-32 w-32 rounded-none border">
                                <AvatarImage
                                    src={URL.createObjectURL(formData.image)}
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
                                        value={formData.name}
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
                                        value={formData.category_id}
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
                                        value={formData.status}
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
                                    value={formData.description}
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
                                    {variants.map((variant, index) => (
                                        <TableRow key={variant.id}>
                                            <TableCell>
                                                <Input
                                                    value={variant.name}
                                                    onChange={(e) =>
                                                        handleVariantChange(
                                                            index,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Variant Name"
                                                />
                                                {/* Tampilkan error untuk name variant */}
                                                {variantErrors[variant.id]
                                                    ?.name && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            variantErrors[
                                                                variant.id
                                                            ].name
                                                        }
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={variant.status}
                                                    onValueChange={(value) =>
                                                        handleVariantChange(
                                                            index,
                                                            'status',
                                                            value,
                                                        )
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
                                                {/* Tampilkan error untuk status variant */}
                                                {variantErrors[variant.id]
                                                    ?.status && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            variantErrors[
                                                                variant.id
                                                            ].status
                                                        }
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) =>
                                                        handleVariantChange(
                                                            index,
                                                            'price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Price"
                                                />
                                                {/* Tampilkan error untuk price variant */}
                                                {variantErrors[variant.id]
                                                    ?.price && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            variantErrors[
                                                                variant.id
                                                            ].price
                                                        }
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeVariant(
                                                            variant.id,
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={addVariant}
                            >
                                Add Variant
                            </Button>
                        </div>

                        <div className="flex justify-start gap-4 pt-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/product">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
