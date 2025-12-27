import { AppSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import axios from 'axios';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

type ProductType = {
    id: number | null;
    name: string;
    status: string;
    image?: string;
    deleted_at?: string | null;
    category?: {
        name: string;
    };
    variants: { price: number }[];
};

export default function Product() {
    const [products, setProducts] = useState<ProductType[]>([]);
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [trashedFilter, setTrashedFilter] = useState('');

    // const [formData, setFormData] = useState<ProductType>({
    //     id: null,
    //     name: '',
    //     status: 'Available',
    //     variants: [],
    // });

    async function fetchProducts(filters = {}) {
        try {
            const response = await axios.get('/tools/products', {
                params: filters,
            });
            setProducts(response.data);
            console.log('Fetched products:', response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts({
            search: searchTerm,
            status: statusFilter,
            trashed: trashedFilter,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        fetchProducts({
            search: searchTerm,
            status: value,
            trashed: trashedFilter,
        });
    };

    const handleTrashedChange = (value: string) => {
        setTrashedFilter(value);
        fetchProducts({
            search: searchTerm,
            status: statusFilter,
            trashed: value,
        });
    };

    // Fetch products on component mount
    useState(() => {
        fetchProducts();
    });

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
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbPage className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Products
                                    </BreadcrumbLink>
                                </BreadcrumbPage>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mt-4 flex justify-start">
                        <a href="/product/add">
                            <Button>Add Product</Button>
                        </a>
                    </div>
                    <form
                        onSubmit={handleSearchSubmit}
                        className="mt-2 flex flex-col gap-3 md:flex-row"
                    >
                        {/* Search */}
                        <Input
                            placeholder="Search product…"
                            className="w-full md:w-1/3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Submit search */}
                        <Button type="submit" className="w-full md:w-auto">
                            Search
                        </Button>

                        {/* Status filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="w-full md:w-1/4">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">All Status</SelectItem>
                                <SelectItem value="available">
                                    Available
                                </SelectItem>
                                <SelectItem value="unavailable">
                                    Unavailable
                                </SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
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
                                fetchProducts({});
                            }}
                        >
                            Reset
                        </Button>
                    </form>

                    <Table>
                        <TableCaption>A list of categories.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        {product.name}
                                        {'   '}
                                        {product.deleted_at && (
                                            <Badge className="bg-gray-200 px-1 py-0.5 text-xs text-gray-700">
                                                Deleted
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        <Avatar className="h-12 w-12 rounded-none">
                                            {' '}
                                            {/* Tambahkan rounded-none di sini */}
                                            <AvatarImage
                                                src={product.image}
                                                alt={product.name}
                                                className="h-full w-full rounded-none object-cover" // Tambahkan rounded-none di sini juga sebagai tindakan pencegahan
                                            />
                                            <AvatarFallback className="rounded-none">
                                                {' '}
                                                {/* Tambahkan rounded-none di sini juga */}
                                                {product.name
                                                    ?.substring(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        {product.category?.name}
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        {product.variants.length > 0
                                            ? (() => {
                                                  const prices =
                                                      product.variants.map(
                                                          (v) => v.price,
                                                      );
                                                  const min = Math.min(
                                                      ...prices,
                                                  );
                                                  const max = Math.max(
                                                      ...prices,
                                                  );

                                                  return min === max
                                                      ? min.toLocaleString() // harga tunggal
                                                      : `${min.toLocaleString()} - ${max.toLocaleString()}`; // rentang harga
                                              })()
                                            : '-'}
                                    </TableCell>

                                    {/* STATUS BADGE */}
                                    <TableCell>
                                        {product.status === 'available' && (
                                            <Badge className="bg-green-500 px-2">
                                                Available
                                            </Badge>
                                        )}

                                        {product.status === 'unavailable' && (
                                            <Badge className="bg-red-500 px-2">
                                                Unavailable
                                            </Badge>
                                        )}

                                        {product.status === 'sold' && (
                                            <Badge className="bg-yellow-500 px-2">
                                                Sold
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* ACTIONS */}
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
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
                                                {!product.deleted_at && (
                                                    <a
                                                        href={`/product/edit/${product.id}`}
                                                    >
                                                        <DropdownMenuItem
                                                        // onClick={() =>
                                                        //     handleEditProduct(
                                                        //         product,
                                                        //     )
                                                        // }
                                                        >
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </a>
                                                )}

                                                {/* Jika BELUM soft delete → tampilkan Soft Delete */}
                                                {!product.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="font-medium text-orange-600"
                                                        onClick={async () => {
                                                            if (
                                                                product.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.delete(
                                                                        `/tools/products/${product.id}`,
                                                                    );
                                                                    setProducts(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    cat,
                                                                                ) =>
                                                                                    cat.id !==
                                                                                    product.id,
                                                                            ),
                                                                    );
                                                                    alert(
                                                                        'product soft deleted',
                                                                    );
                                                                } catch {
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
                                                {product.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="text-blue-600"
                                                        onClick={async () => {
                                                            if (
                                                                product.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.post(
                                                                        `/tools/products/${product.id}/restore`,
                                                                    );
                                                                    fetchProducts();
                                                                    alert(
                                                                        'product restored',
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
                                                            product.id !== null
                                                        ) {
                                                            try {
                                                                await axios.delete(
                                                                    `/tools/products/${product.id}/force-delete`,
                                                                );
                                                                setProducts(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                prod,
                                                                            ) =>
                                                                                prod.id !==
                                                                                product.id,
                                                                        ),
                                                                );
                                                                alert(
                                                                    'product permanently deleted',
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
                            ))}
                        </TableBody>
                        <TableFooter></TableFooter>
                    </Table>

                    {/* Modal for Add/Edit Category */}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
