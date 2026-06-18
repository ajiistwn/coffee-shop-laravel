import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app/app-header-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Order = {
    id: number;
    name: string;
    total: number;
    status: string; // e.g., "Pending", "Paid", "Completed"
    created_at: string;
    order_items: {
        product: {
            name: string;
            image: string;
        };
        variant?: {
            name: string;
        };
        qty: number;
        subtotal: number;
        notes?: string;
    }[];
    payments: {
        payment_channel: string;
        status: string;
        payment_link?: string;
    }[];
};

type PageProps = {
    orders: Order[];
    cartCount: number;
};

const POLLING_INTERVAL_MS = 3000;

function getCartToken() {
    const queryToken = new URLSearchParams(window.location.search).get(
        'cart_token',
    );

    return queryToken ?? localStorage.getItem('cart_token') ?? '';
}

function normalizeOrders(orders: Order[]) {
    return orders.map((order) => ({
        ...order,
        order_items: order.order_items || [],
        payments: order.payments || [],
    }));
}

export default function Pesanan() {
    const { orders, cartCount } = usePage<PageProps>().props;
    const [customerOrders, setCustomerOrders] = useState<Order[]>(() =>
        normalizeOrders(orders),
    );
    const [customerCartCount, setCustomerCartCount] = useState(cartCount);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<{
        title: string;
        message: string;
    }>({ title: '', message: '' });

    useEffect(() => {
        setCustomerOrders(normalizeOrders(orders));
        setCustomerCartCount(cartCount);
    }, [orders, cartCount]);

    const fetchCustomerOrders = useCallback(async () => {
        const token = getCartToken();

        if (!token) {
            setFetchError('Token pesanan tidak ditemukan.');
            return;
        }

        setIsRefreshing(true);
        setFetchError('');

        try {
            const response = await axios.get('/pesanan/realtime', {
                params: {
                    cart_token: token,
                },
            });

            setCustomerOrders(normalizeOrders(response.data.orders ?? []));
            setCustomerCartCount(response.data.cartCount ?? 0);
            setLastUpdatedAt(new Date());
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            setFetchError(
                'Gagal memperbarui riwayat pesanan. Data akan dicoba lagi otomatis.',
            );
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomerOrders();

        const intervalId = window.setInterval(() => {
            fetchCustomerOrders();
        }, POLLING_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [fetchCustomerOrders]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-500 text-white';
            case 'paid':
                return 'bg-green-500 text-white';
            case 'completed':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleStatusAction = (order: Order) => {
        if (order.status.toLowerCase() === 'pending') {
            // Buka link pembayaran jika status Pending
            if (order.payments[0]?.payment_link) {
                window.open(order.payments[0].payment_link, '_blank');
            }
        } else if (order.status.toLowerCase() === 'preparing') {
            // Tampilkan modal untuk status Preparing
            setModalContent({
                title: 'Pesanan Sedang Diproses',
                message:
                    'Pesanan Anda sedang dipersiapkan. Mohon tunggu sebentar.',
            });
            setModalVisible(true);
        } else if (order.status.toLowerCase() === 'completed') {
            // Tampilkan modal untuk status Completed
            setModalContent({
                title: 'Pesanan Selesai',
                message:
                    'Pesanan Anda telah selesai. Terima kasih telah memesan!',
            });
            setModalVisible(true);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Menu`,
            href: `/menu`,
        },
        {
            title: `Pesanan`,
            href: `/pesanan`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} cartCount={customerCartCount}>
            <Head title="Riwayat Pesanan" />
            <div className="flex min-h-screen flex-col bg-background p-6 text-foreground">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Riwayat Pesanan</h1>
                        <p className="text-sm text-muted-foreground">
                            Status pesanan diperbarui otomatis setiap 3 detik.
                        </p>
                    </div>
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
                </div>

                {fetchError && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {fetchError}
                    </div>
                )}

                {/* List Orders */}
                <div className="space-y-4">
                    {customerOrders.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            Tidak ada riwayat pesanan.
                        </p>
                    ) : (
                        customerOrders.map((order) => (
                            <Card
                                key={order.id}
                                className="spaca-y-0 gap-0 shadow-sm transition hover:bg-accent/40"
                                onClick={() => handleStatusAction(order)}
                            >
                                <CardHeader>
                                    <div className="flex justify-between">
                                        <CardTitle>
                                            Pesanan #{order.id} -{' '}
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString()}
                                        </CardTitle>
                                        <Badge
                                            className={`capitalize ${getStatusBadgeColor(
                                                order.status,
                                            )}`}
                                        >
                                            {order.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Items */}
                                    <div className="space-y-2">
                                        {Array.isArray(order.order_items) &&
                                            order.order_items.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-4"
                                                    >
                                                        {/* Product Info */}
                                                        <div className="flex-1">
                                                            <p className="font-semibold">
                                                                {
                                                                    item.product
                                                                        .name
                                                                }
                                                            </p>
                                                            {item.variant && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    Varian:{' '}
                                                                    {
                                                                        item
                                                                            .variant
                                                                            .name
                                                                    }
                                                                </p>
                                                            )}
                                                            {item.notes && (
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Catatan:{' '}
                                                                    {item.notes}
                                                                </p>
                                                            )}
                                                            <p className="mt-2 font-bold">
                                                                {item.subtotal.toLocaleString()}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                x{item.qty}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                    </div>

                                    {/* Total */}
                                    <div className="mt-2 flex justify-start">
                                        <p className="text-lg font-bold">
                                            Total: {formatPrice(order.total)}
                                        </p>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-sm text-muted-foreground">
                                            Nama Pemesan: {order.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Pembayaran:{' '}
                                            {order.payments[0]?.payment_channel}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Status Pembayaran:{' '}
                                            {order.payments[0]?.status}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
            <Dialog open={modalVisible} onOpenChange={setModalVisible}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalContent.title}</DialogTitle>
                        <DialogDescription className="text-center">
                            {modalContent.message}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
