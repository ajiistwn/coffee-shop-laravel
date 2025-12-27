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

type OrderType = {
    id: number | null;
    name: string;
    status: string;
    payment_status?: string;
    total?: number;
    order_items?: Array<OrderItemType>;
    payments?: Array<PaymentType>;
    deleted_at?: string | null;
    updated_at?: string | null;
};

type OrderItemType = {
    id: number | null;
    order_id: number;
    product_id: number;
    qty: number;
    price: number;
    subtotal: number;
};
type PaymentType = {
    id: number | null;
    order_id: number;
    reference_id: string;
    amount: number;
    status: string;
};

export default function Order() {
    const [paginationMeta, setPaginationMeta] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
    });
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [trashedFilter, setTrashedFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    async function fetchOrders(filters = {}) {
        try {
            const response = await axios.get('/tools/orders', {
                params: {
                    ...filters,
                    page: currentPage,
                    per_page: perPage,
                },
            });
            console.log('Fetched orders:', response.data);
            setOrders(response.data.data); // Data dari Laravel paginated
            setPaginationMeta({
                currentPage: response.data.current_page,
                lastPage: response.data.last_page,
                total: response.data.total,
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset ke halaman pertama
        fetchOrders({
            search: searchTerm,
            status: statusFilter,
            trashed: trashedFilter,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1); // Reset ke halaman pertama
        fetchOrders({
            search: searchTerm,
            status: value,
            trashed: trashedFilter,
        });
    };

    const handleTrashedChange = (value: string) => {
        setTrashedFilter(value);
        setCurrentPage(1); // Reset ke halaman pertama
        fetchOrders({
            search: searchTerm,
            status: statusFilter,
            trashed: value,
        });
    };

    // Fetch categories on component mount
    useState(() => {
        fetchOrders();
    });

    useEffect(() => {
        const fetchData = async () => {
            await fetchOrders({
                search: searchTerm,
                status: statusFilter,
                trashed: trashedFilter,
            });
        };
        fetchData();
    }, [perPage, currentPage]);

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
                                    <BreadcrumbLink href="/order">
                                        Orders
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="mt-2 flex flex-col gap-3"
                    >
                        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-3">
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
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="failed">
                                        Failed
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
                                    fetchOrders({});
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <Select
                                    value={String(perPage)}
                                    onValueChange={(value) => {
                                        setPerPage(Number(value));
                                        setCurrentPage(1); // Reset ke halaman pertama saat mengubah jumlah item
                                    }}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Items per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span>
                                    Page {currentPage} of{' '}
                                    {paginationMeta.lastPage}
                                </span>
                                <Button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(
                                                prev + 1,
                                                paginationMeta.lastPage,
                                            ),
                                        )
                                    }
                                    disabled={
                                        currentPage === paginationMeta.lastPage
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </form>

                    <Table>
                        <TableCaption>
                            {orders.length} list of orders.
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>update</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status Payment</TableHead>
                                <TableHead>Status Order</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setIsModalOpen(true); // Membuka modal
                                    }}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <TableCell>
                                        {new Date(
                                            order.updated_at || '',
                                        ).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2 font-medium">
                                        {order.name}
                                        {order.deleted_at && (
                                            <Badge className="bg-gray-200 px-1 py-0.5 text-xs text-gray-700">
                                                Deleted
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* STATUS BADGE */}
                                    <TableCell>
                                        {order.payment_status === 'paid' ? (
                                            <Badge className="bg-green-500 px-2">
                                                Paid
                                            </Badge>
                                        ) : order.payment_status ===
                                          'pending' ? (
                                            <Badge className="bg-yellow-500 px-2">
                                                Pending
                                            </Badge>
                                        ) : order.payment_status ===
                                          'failed' ? (
                                            <Badge className="bg-red-500 px-2">
                                                Failed
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-500 px-2">
                                                Unknown
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* STATUS BADGE */}
                                    <TableCell>
                                        {order.status === 'completed' ? (
                                            <Badge className="bg-green-500 px-2">
                                                Completed
                                            </Badge>
                                        ) : order.status === 'pending' ? (
                                            <Badge className="bg-yellow-500 px-2">
                                                Pending
                                            </Badge>
                                        ) : order.status === 'preparing' ? (
                                            <Badge className="bg-yellow-500 px-2">
                                                {/* Edit */}Preparing
                                            </Badge>
                                        ) : order.status === 'cancelled' ? (
                                            <Badge className="bg-red-500 px-2">
                                                Cancelled
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-500 px-2">
                                                Unknown
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {order.order_items
                                            ? order.order_items.length
                                            : 0}{' '}
                                        items
                                    </TableCell>
                                    <TableCell>
                                        {order.total
                                            ? 'Rp ' +
                                              order.total.toLocaleString(
                                                  'id-ID',
                                              )
                                            : 'Rp 0'}
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
                                                {/* Jika BELUM soft delete → tampilkan Soft Delete */}
                                                {!order.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="font-medium text-orange-600"
                                                        onClick={async () => {
                                                            if (
                                                                order.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.delete(
                                                                        `/tools/orders/${order.id}`,
                                                                    );
                                                                    setOrders(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    cat,
                                                                                ) =>
                                                                                    cat.id !==
                                                                                    order.id,
                                                                            ),
                                                                    );
                                                                    alert(
                                                                        'Order soft deleted',
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
                                                {order.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="text-blue-600"
                                                        onClick={async () => {
                                                            if (
                                                                order.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.post(
                                                                        `/tools/orders/${order.id}/restore`,
                                                                    );
                                                                    fetchOrders();
                                                                    alert(
                                                                        'Order restored',
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
                                                        if (order.id !== null) {
                                                            try {
                                                                await axios.delete(
                                                                    `/tools/orders/${order.id}/force-delete`,
                                                                );
                                                                setOrders(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                ord,
                                                                            ) =>
                                                                                ord.id !==
                                                                                order.id,
                                                                        ),
                                                                );
                                                                alert(
                                                                    'Order permanently deleted',
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

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className="max-h-[80vh] w-full overflow-y-auto sm:w-3/4 lg:w-1/2">
                            <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                                <DialogDescription>
                                    View and manage the details of this order.
                                </DialogDescription>
                            </DialogHeader>

                            {selectedOrder && (
                                <>
                                    {/* General Information */}
                                    <div className="grid gap-4 py-4">
                                        <div>
                                            <strong>Name:</strong>{' '}
                                            {selectedOrder.name}
                                        </div>
                                        <div>
                                            <strong>Status Payment:</strong>{' '}
                                            {selectedOrder.payment_status ===
                                            'paid' ? (
                                                <Badge className="bg-green-500 px-2">
                                                    Paid
                                                </Badge>
                                            ) : selectedOrder.payment_status ===
                                              'pending' ? (
                                                <Badge className="bg-yellow-500 px-2">
                                                    Pending
                                                </Badge>
                                            ) : selectedOrder.payment_status ===
                                              'failed' ? (
                                                <Badge className="bg-red-500 px-2">
                                                    Failed
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-500 px-2">
                                                    Unknown
                                                </Badge>
                                            )}
                                        </div>
                                        <div>
                                            <strong>Status Order:</strong>{' '}
                                            {selectedOrder.status ===
                                            'completed' ? (
                                                <Badge className="bg-green-500 px-2">
                                                    Completed
                                                </Badge>
                                            ) : selectedOrder.status ===
                                              'pending' ? (
                                                <Badge className="bg-yellow-500 px-2">
                                                    Pending
                                                </Badge>
                                            ) : selectedOrder.status ===
                                              'preparing' ? (
                                                <Badge className="bg-yellow-500 px-2">
                                                    Preparing
                                                </Badge>
                                            ) : selectedOrder.status ===
                                              'cancelled' ? (
                                                <Badge className="bg-red-500 px-2">
                                                    Cancelled
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-500 px-2">
                                                    Unknown
                                                </Badge>
                                            )}
                                        </div>
                                        <div>
                                            <strong>Total:</strong> Rp{' '}
                                            {selectedOrder.total?.toLocaleString(
                                                'id-ID',
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mt-4">
                                        <h3 className="mb-2 text-lg font-semibold">
                                            Order Items
                                        </h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Product
                                                    </TableHead>
                                                    <TableHead>
                                                        Quantity
                                                    </TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>
                                                        Subtotal
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedOrder.order_items?.map(
                                                    (item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>
                                                                Product ID:{' '}
                                                                {
                                                                    item.product_id
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.qty}
                                                            </TableCell>
                                                            <TableCell>
                                                                Rp{' '}
                                                                {item.price?.toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                Rp{' '}
                                                                {item.subtotal?.toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Payments */}
                                    <div className="mt-4">
                                        <h3 className="mb-2 text-lg font-semibold">
                                            Payments
                                        </h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Reference ID
                                                    </TableHead>
                                                    <TableHead>
                                                        Amount
                                                    </TableHead>
                                                    <TableHead>
                                                        Status
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedOrder.payments?.map(
                                                    (payment) => (
                                                        <TableRow
                                                            key={payment.id}
                                                        >
                                                            <TableCell>
                                                                {
                                                                    payment.reference_id
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                Rp{' '}
                                                                {payment.amount?.toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {payment.status ===
                                                                'paid' ? (
                                                                    <Badge className="bg-green-500 px-2">
                                                                        Paid
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-yellow-500 px-2">
                                                                        Pending
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Update Order Status */}
                                    <div className="mt-4">
                                        <h3 className="mb-2 text-lg font-semibold">
                                            Update Order Status
                                        </h3>
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                if (selectedOrder.id !== null) {
                                                    try {
                                                        await axios.put(
                                                            `/tools/orders/${selectedOrder.id}`,
                                                            {
                                                                // method: 'PUT',
                                                                status: selectedOrder.status,
                                                            },
                                                        );
                                                        fetchOrders(); // Refresh data
                                                        alert(
                                                            'Order status updated',
                                                        );
                                                        setIsModalOpen(false);
                                                    } catch (error) {
                                                        console.error(
                                                            'Error updating order status:',
                                                            error,
                                                        );
                                                        alert(
                                                            'Failed to update order status',
                                                        );
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label
                                                    htmlFor="status"
                                                    className="text-right"
                                                >
                                                    Status
                                                </label>
                                                <Select
                                                    value={selectedOrder.status}
                                                    onValueChange={(value) =>
                                                        setSelectedOrder({
                                                            ...selectedOrder,
                                                            status: value,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">
                                                            Pending
                                                        </SelectItem>
                                                        <SelectItem value="preparing">
                                                            Preparing
                                                        </SelectItem>
                                                        <SelectItem value="completed">
                                                            Completed
                                                        </SelectItem>
                                                        <SelectItem value="cancelled">
                                                            Cancelled
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                type="submit"
                                                className="mt-4"
                                            >
                                                Update Status
                                            </Button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
