import { AppSidebar } from '@/components/app-sidebar';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
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

type CategoryType = {
    id: number | null;
    name: string;
    status: string;
    deleted_at?: string | null;
};

export default function Category() {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [trashedFilter, setTrashedFilter] = useState('');

    const [formData, setFormData] = useState<CategoryType>({
        id: null,
        name: '',
        status: 'Available',
    });

    async function fetchCategories(filters = {}) {
        try {
            const response = await axios.get('/tools/categories', {
                params: filters,
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCategories({
            search: searchTerm,
            status: statusFilter,
            trashed: trashedFilter,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        fetchCategories({
            search: searchTerm,
            status: value,
            trashed: trashedFilter,
        });
    };

    const handleTrashedChange = (value: string) => {
        setTrashedFilter(value);
        fetchCategories({
            search: searchTerm,
            status: statusFilter,
            trashed: value,
        });
    };

    // Fetch categories on component mount
    useState(() => {
        fetchCategories();
    });

    const handleEditCategory = (category: CategoryType) => {
        setIsEditMode(true);
        setFormData(category);
        setIsModalOpen(true);
    };

    const handleAddCategory = () => {
        setIsEditMode(false);
        setFormData({
            id: null,
            name: '',
            status: 'Available',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                // Update existing category
                await axios.put(`/tools/categories/${formData.id}`, formData);
                setCategories((prev) =>
                    prev.map((cat) =>
                        cat.id === formData.id ? formData : cat,
                    ),
                );
            } else {
                // Add new category
                const response = await axios.post(
                    '/tools/categories',
                    formData,
                );
                setCategories((prev) => [...prev, response.data]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving category:', error);
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
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Categories
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mt-4 flex justify-start">
                        <Button onClick={handleAddCategory}>
                            Add Category
                        </Button>
                    </div>
                    <form
                        onSubmit={handleSearchSubmit}
                        className="mt-2 flex flex-col gap-3 md:flex-row"
                    >
                        {/* Search */}
                        <Input
                            placeholder="Search category…"
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
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
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
                                fetchCategories({});
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
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="flex items-center gap-2 font-medium">
                                        {category.name}
                                        {category.deleted_at && (
                                            <Badge className="bg-gray-200 px-1 py-0.5 text-xs text-gray-700">
                                                Deleted
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* STATUS BADGE */}
                                    <TableCell>
                                        {category.status === 'active' ? (
                                            <Badge className="bg-green-500 px-2">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-500 px-2">
                                                Inactive
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
                                                {!category.deleted_at && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleEditCategory(
                                                                category,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Jika BELUM soft delete → tampilkan Soft Delete */}
                                                {!category.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="font-medium text-orange-600"
                                                        onClick={async () => {
                                                            if (
                                                                category.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.delete(
                                                                        `/tools/categories/${category.id}`,
                                                                    );
                                                                    setCategories(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    cat,
                                                                                ) =>
                                                                                    cat.id !==
                                                                                    category.id,
                                                                            ),
                                                                    );
                                                                    alert(
                                                                        'Category soft deleted',
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
                                                {category.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="text-blue-600"
                                                        onClick={async () => {
                                                            if (
                                                                category.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.post(
                                                                        `/tools/categories/${category.id}/restore`,
                                                                    );
                                                                    fetchCategories();
                                                                    alert(
                                                                        'Category restored',
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
                                                            category.id !== null
                                                        ) {
                                                            try {
                                                                await axios.delete(
                                                                    `/tools/categories/${category.id}/force-delete`,
                                                                );
                                                                setCategories(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                cat,
                                                                            ) =>
                                                                                cat.id !==
                                                                                category.id,
                                                                        ),
                                                                );
                                                                alert(
                                                                    'Category permanently deleted',
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
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {isEditMode ? 'Edit' : 'Add'} Category
                                </DialogTitle>
                                <DialogDescription>
                                    Fill in the details below to save the
                                    category.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
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
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label
                                            htmlFor="status"
                                            className="text-right"
                                        >
                                            Status
                                        </label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    status: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="inactive">
                                                    Inactive
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
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
