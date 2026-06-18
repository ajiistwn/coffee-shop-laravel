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
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import axios from 'axios';
import {
    MoreHorizontal,
    PauseCircle,
    PlayCircle,
    RefreshCw,
} from 'lucide-react';
import {
    type FormEvent,
    type MouseEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';

type OrderType = {
    id: number | null;
    name: string;
    status: string;
    payment_status?: string;
    total?: number;
    order_items?: Array<OrderItemType>;
    payments?: Array<PaymentType>;
    created_at?: string | null;
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
    product?: {
        name: string;
    } | null;
    variant?: {
        name?: string | null;
    } | null;
};
type PaymentType = {
    id: number | null;
    order_id: number;
    reference_id: string;
    amount: number;
    status: string;
};

type OrderFilters = {
    search?: string;
    status?: string;
    trashed?: string;
    page?: number;
    perPage?: number;
};

const POLLING_INTERVAL_MS = 3000;

function formatDateTime(value?: string | null) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatCurrency(value?: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function getPaymentStatusBadge(status?: string) {
    if (status === 'paid') {
        return <Badge className="bg-green-500 px-2">Lunas</Badge>;
    }

    if (status === 'pending') {
        return <Badge className="bg-yellow-500 px-2">Menunggu</Badge>;
    }

    if (status === 'failed') {
        return <Badge className="bg-red-500 px-2">Gagal</Badge>;
    }

    return <Badge className="bg-gray-500 px-2">Tidak diketahui</Badge>;
}

function getOrderStatusBadge(status?: string) {
    if (status === 'completed') {
        return <Badge className="bg-green-500 px-2">Selesai</Badge>;
    }

    if (status === 'pending') {
        return <Badge className="bg-yellow-500 px-2">Menunggu</Badge>;
    }

    if (status === 'preparing') {
        return <Badge className="bg-blue-500 px-2">Diproses</Badge>;
    }

    if (status === 'cancelled') {
        return <Badge className="bg-red-500 px-2">Dibatalkan</Badge>;
    }

    return <Badge className="bg-gray-500 px-2">Tidak diketahui</Badge>;
}

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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

    const fetchOrders = useCallback(
        async (filters: OrderFilters = {}) => {
            setIsRefreshing(true);
            setFetchError('');

            try {
                const response = await axios.get('/tools/orders', {
                    params: {
                        search: filters.search ?? searchTerm,
                        status: filters.status ?? statusFilter,
                        trashed: filters.trashed ?? trashedFilter,
                        page: filters.page ?? currentPage,
                        per_page: filters.perPage ?? perPage,
                    },
                });
                setOrders(response.data.data); // Data dari Laravel paginated
                setPaginationMeta({
                    currentPage: response.data.current_page,
                    lastPage: response.data.last_page,
                    total: response.data.total,
                });
                setLastUpdatedAt(new Date());
            } catch (error) {
                console.error('Error fetching orders:', error);
                setFetchError(
                    'Gagal memuat data pesanan. Data akan dicoba lagi otomatis.',
                );
            } finally {
                setIsRefreshing(false);
            }
        },
        [currentPage, perPage, searchTerm, statusFilter, trashedFilter],
    );

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset ke halaman pertama
        fetchOrders({
            search: searchTerm,
            status: statusFilter,
            trashed: trashedFilter,
            page: 1,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1); // Reset ke halaman pertama
        fetchOrders({
            search: searchTerm,
            status: value,
            trashed: trashedFilter,
            page: 1,
        });
    };

    const handleTrashedChange = (value: string) => {
        setTrashedFilter(value);
        setCurrentPage(1); // Reset ke halaman pertama
        fetchOrders({
            search: searchTerm,
            status: statusFilter,
            trashed: value,
            page: 1,
        });
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if (!isRealtimeEnabled) {
            return;
        }

        const intervalId = window.setInterval(() => {
            fetchOrders();
        }, POLLING_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [fetchOrders, isRealtimeEnabled]);

    useEffect(() => {
        if (!selectedOrder?.id) {
            return;
        }

        const updatedSelectedOrder = orders.find(
            (order) => order.id === selectedOrder.id,
        );

        if (updatedSelectedOrder) {
            setSelectedOrder(updatedSelectedOrder);
        }
    }, [orders, selectedOrder?.id]);

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
                                        Pesanan
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
                                placeholder="Cari nama pelanggan..."
                                className="w-full md:w-1/3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {/* Submit search */}
                            <Button type="submit" className="w-full md:w-auto">
                                Cari
                            </Button>

                            <Select
                                value={statusFilter}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-full md:w-1/4">
                                    <SelectValue placeholder="Filter pembayaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">
                                        Semua Pembayaran
                                    </SelectItem>
                                    <SelectItem value="paid">Lunas</SelectItem>
                                    <SelectItem value="pending">
                                        Menunggu
                                    </SelectItem>
                                    <SelectItem value="failed">
                                        Gagal
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Trashed filter */}
                            <Select
                                value={trashedFilter}
                                onValueChange={handleTrashedChange}
                            >
                                <SelectTrigger className="w-full md:w-1/4">
                                    <SelectValue placeholder="Filter data dihapus" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">
                                        Hanya Aktif
                                    </SelectItem>
                                    <SelectItem value="only">
                                        Hanya Terhapus
                                    </SelectItem>
                                    <SelectItem value="with">
                                        Termasuk Terhapus
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
                                    setCurrentPage(1);
                                    fetchOrders({
                                        search: '',
                                        status: '',
                                        trashed: '',
                                        page: 1,
                                    });
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
                                        <SelectValue placeholder="Jumlah data" />
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
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Sebelumnya
                                </Button>
                                <span className="flex items-center text-sm text-muted-foreground">
                                    Halaman {currentPage} dari{' '}
                                    {paginationMeta.lastPage}
                                </span>
                                <Button
                                    type="button"
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
                                    Berikutnya
                                </Button>
                            </div>
                        </div>
                    </form>

                    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Daftar Pesanan
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan data terbaru lebih dulu dan
                                    realtime dapat dijeda saat berpindah
                                    halaman.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 md:items-end">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <RefreshCw
                                        className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                    />
                                    <span>
                                        {lastUpdatedAt
                                            ? `Terakhir diperbarui ${lastUpdatedAt.toLocaleTimeString('id-ID')}`
                                            : 'Memuat data...'}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant={
                                        isRealtimeEnabled
                                            ? 'secondary'
                                            : 'default'
                                    }
                                    className="w-full gap-2 md:w-auto"
                                    onClick={() => {
                                        if (!isRealtimeEnabled) {
                                            fetchOrders();
                                        }

                                        setIsRealtimeEnabled(
                                            (isEnabled) => !isEnabled,
                                        );
                                    }}
                                >
                                    {isRealtimeEnabled ? (
                                        <PauseCircle className="h-4 w-4" />
                                    ) : (
                                        <PlayCircle className="h-4 w-4" />
                                    )}
                                    {isRealtimeEnabled
                                        ? 'Jeda Realtime'
                                        : 'Aktifkan Realtime'}
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    {isRealtimeEnabled
                                        ? 'Realtime aktif setiap 3 detik.'
                                        : 'Realtime sedang dijeda.'}
                                </span>
                            </div>
                        </div>

                        {fetchError && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {fetchError}
                            </div>
                        )}
                    </div>

                    <Table className="rounded-lg border">
                        <TableCaption>
                            {orders.length} dari {paginationMeta.total} pesanan
                            ditampilkan.
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Diperbarui</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Status Pembayaran</TableHead>
                                <TableHead>Status Pesanan</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Belum ada pesanan yang cocok dengan
                                        filter.
                                    </TableCell>
                                </TableRow>
                            )}

                            {orders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setIsModalOpen(true); // Membuka modal
                                    }}
                                    className="cursor-pointer hover:bg-accent/40"
                                >
                                    <TableCell className="text-muted-foreground">
                                        {formatDateTime(order.updated_at)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>{order.name}</span>
                                            {order.deleted_at && (
                                                <Badge className="bg-gray-200 px-1 py-0.5 text-xs text-gray-700">
                                                    Terhapus
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Dibuat:{' '}
                                            {formatDateTime(order.created_at)}
                                        </div>
                                    </TableCell>

                                    {/* STATUS BADGE */}
                                    <TableCell>
                                        {getPaymentStatusBadge(
                                            order.payment_status,
                                        )}
                                    </TableCell>

                                    {/* STATUS BADGE */}
                                    <TableCell>
                                        {getOrderStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell>
                                        {order.order_items
                                            ? order.order_items.length
                                            : 0}{' '}
                                        item
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(order.total)}
                                    </TableCell>

                                    {/* ACTIONS */}
                                    <TableCell
                                        className="text-center"
                                        onClick={(event: MouseEvent) =>
                                            event.stopPropagation()
                                        }
                                    >
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
                                                                        'Pesanan berhasil dihapus sementara',
                                                                    );
                                                                } catch {
                                                                    alert(
                                                                        'Gagal menghapus pesanan sementara',
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        Hapus Sementara
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
                                                                        'Pesanan berhasil dipulihkan',
                                                                    );
                                                                } catch {
                                                                    alert(
                                                                        'Gagal memulihkan pesanan',
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        Pulihkan
                                                    </DropdownMenuItem>
                                                )}

                                                {order.deleted_at && (
                                                    <DropdownMenuItem
                                                        className="font-bold text-red-600"
                                                        onClick={async () => {
                                                            if (
                                                                order.id !==
                                                                null
                                                            ) {
                                                                try {
                                                                    await axios.delete(
                                                                        `/tools/orders/${order.id}/force-delete`,
                                                                    );
                                                                    setOrders(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    ord,
                                                                                ) =>
                                                                                    ord.id !==
                                                                                    order.id,
                                                                            ),
                                                                    );
                                                                    alert(
                                                                        'Pesanan berhasil dihapus permanen',
                                                                    );
                                                                } catch {
                                                                    alert(
                                                                        'Gagal menghapus pesanan permanen',
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        Hapus Permanen
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className="max-h-[80vh] w-full overflow-y-auto sm:w-3/4 lg:w-1/2">
                            <DialogHeader>
                                <DialogTitle>Detail Pesanan</DialogTitle>
                                <DialogDescription>
                                    Lihat detail pesanan dan ubah status proses.
                                </DialogDescription>
                            </DialogHeader>

                            {selectedOrder && (
                                <>
                                    {/* General Information */}
                                    <div className="grid gap-4 py-4">
                                        <div>
                                            <strong>Nama:</strong>{' '}
                                            {selectedOrder.name}
                                        </div>
                                        <div>
                                            <strong>Status Pembayaran:</strong>{' '}
                                            {getPaymentStatusBadge(
                                                selectedOrder.payment_status,
                                            )}
                                        </div>
                                        <div>
                                            <strong>Status Pesanan:</strong>{' '}
                                            {getOrderStatusBadge(
                                                selectedOrder.status,
                                            )}
                                        </div>
                                        <div>
                                            <strong>Total:</strong>{' '}
                                            {formatCurrency(
                                                selectedOrder.total,
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mt-4">
                                        <h3 className="mb-2 text-lg font-semibold">
                                            Item Pesanan
                                        </h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Produk
                                                    </TableHead>
                                                    <TableHead>
                                                        Jumlah
                                                    </TableHead>
                                                    <TableHead>Harga</TableHead>
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
                                                                {item.product
                                                                    ?.name ??
                                                                    `Produk #${item.product_id}`}
                                                                {item.variant
                                                                    ?.name && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        Varian:{' '}
                                                                        {
                                                                            item
                                                                                .variant
                                                                                .name
                                                                        }
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.qty}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatCurrency(
                                                                    item.price,
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatCurrency(
                                                                    item.subtotal,
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
                                            Pembayaran
                                        </h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Referensi
                                                    </TableHead>
                                                    <TableHead>
                                                        Jumlah
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
                                                                {formatCurrency(
                                                                    payment.amount,
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {getPaymentStatusBadge(
                                                                    payment.status,
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
                                            Ubah Status Pesanan
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
                                                            'Status pesanan berhasil diperbarui',
                                                        );
                                                        setIsModalOpen(false);
                                                    } catch (error) {
                                                        console.error(
                                                            'Error updating order status:',
                                                            error,
                                                        );
                                                        alert(
                                                            'Gagal memperbarui status pesanan',
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
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">
                                                            Menunggu
                                                        </SelectItem>
                                                        <SelectItem value="preparing">
                                                            Diproses
                                                        </SelectItem>
                                                        <SelectItem value="completed">
                                                            Selesai
                                                        </SelectItem>
                                                        <SelectItem value="cancelled">
                                                            Dibatalkan
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                type="submit"
                                                className="mt-4"
                                            >
                                                Simpan Status
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
