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
import { useEffect, useState } from 'react';

type AdminType = {
    id: number | null;
    name: string;
    email: string;
    role: string;
    deleted_at?: string | null;
};

export default function Admin() {
    const [admins, setAdmins] = useState<AdminType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [trashedFilter, setTrashedFilter] = useState('');

    const [formData, setFormData] = useState<AdminType>({
        id: null,
        name: '',
        email: '',
        role: 'admin',
    });

    async function fetchAdmins(filters = {}) {
        try {
            const response = await axios.get('tools/admins', {
                params: filters,
            });
            setAdmins(response.data);
            console.log('Fetched admins:', response.data);
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAdmins({
            search: searchTerm,
            status: statusFilter,
            trashed: trashedFilter,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        fetchAdmins({
            search: searchTerm,
            status: value,
            trashed: trashedFilter,
        });
    };

    const handleTrashedChange = (value: string) => {
        setTrashedFilter(value);
        fetchAdmins({
            search: searchTerm,
            status: statusFilter,
            trashed: value,
        });
    };

    // Fetch admins on component mount
    useEffect(() => {
        const fetchData = async () => {
            await fetchAdmins();
        };
        fetchData();
    }, []);

    const handleEditAdmin = (admin: AdminType) => {
        setIsEditMode(true);
        setFormData(admin);
        setIsModalOpen(true);
    };

    const handleAddAdmin = () => {
        setIsEditMode(false);
        setFormData({
            id: null,
            name: '',
            email: '',
            role: 'admin',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                // Update existing admin
                await axios.put(`tools/admins/${formData.id}`, formData);
                setAdmins((prev) =>
                    prev.map((adm) =>
                        adm.id === formData.id ? formData : adm,
                    ),
                );
            } else {
                // Add new admin
                const response = await axios.post('tools/admins', formData);
                setAdmins((prev) => [...prev, response.data]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving admin:', error);
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
                                        Admins
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mt-4 flex justify-start">
                        <Button onClick={handleAddAdmin}>Add Admin</Button>
                    </div>
                    <form
                        onSubmit={handleSearchSubmit}
                        className="mt-2 flex flex-col gap-3 md:flex-row"
                    >
                        {/* Search */}
                        <Input
                            placeholder="Search admin…"
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
                                fetchAdmins({});
                            }}
                        >
                            Reset
                        </Button>
                    </form>

                    <Table>
                        <TableCaption>A list of admins.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="flex items-center gap-2 font-medium">
                                        {admin.name}
                                        {admin.deleted_at && (
                                            <Badge className="bg-gray-200 px-1 py-0.5 text-xs text-gray-700">
                                                Deleted
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell>{admin.email}</TableCell>

                                    {/* STATUS BADGE */}
                                    <TableCell>
                                        {admin.role === 'admin' ? (
                                            <Badge className="bg-green-500 px-2">
                                                Admin
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
                                                {!admin.deleted_at && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleEditAdmin(
                                                                admin,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Soft Delete */}
                                                {!admin.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="font-medium text-orange-600"
                                                        onClick={async () => {
                                                            if (
                                                                admin.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.delete(
                                                                        `/admins/${admin.id}`,
                                                                    );
                                                                    setAdmins(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    adm,
                                                                                ) =>
                                                                                    adm.id !==
                                                                                    admin.id,
                                                                            ),
                                                                    );
                                                                    alert(
                                                                        'Admin soft deleted',
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

                                                {/* Restore */}
                                                {admin.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="text-blue-600"
                                                        onClick={async () => {
                                                            if (
                                                                admin.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.post(
                                                                        `/admins/${admin.id}/restore`,
                                                                    );
                                                                    fetchAdmins();
                                                                    alert(
                                                                        'Admin restored',
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

                                                {/* Hard Delete */}
                                                <DropdownMenuItem
                                                    className="font-bold text-red-600"
                                                    onClick={async () => {
                                                        if (admin.id !== null) {
                                                            try {
                                                                await axios.delete(
                                                                    `/admins/${admin.id}/force-delete`,
                                                                );
                                                                setAdmins(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                adm,
                                                                            ) =>
                                                                                adm.id !==
                                                                                admin.id,
                                                                        ),
                                                                );
                                                                alert(
                                                                    'Admin permanently deleted',
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

                    {/* Modal for Add/Edit Admin */}
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {isEditMode ? 'Edit' : 'Add'} Admin
                                </DialogTitle>
                                <DialogDescription>
                                    Fill in the details below to save the admin.
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
                                            htmlFor="email"
                                            className="text-right"
                                        >
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label
                                            htmlFor="role"
                                            className="text-right"
                                        >
                                            Role
                                        </label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    role: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">
                                                    Admin
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
