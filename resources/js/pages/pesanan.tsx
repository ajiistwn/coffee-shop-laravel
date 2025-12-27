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
import { useEffect, useState } from 'react';

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

export default function Pesanan() {
    const { orders, cartCount } = usePage<PageProps>().props;
    console.log(orders);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<{
        title: string;
        message: string;
    }>({ title: '', message: '' });
    // Validasi data orders
    const safeOrders = orders.map((order) => ({
        ...order,
        order_items: order.order_items || [], // Fallback jika order_items undefined
    }));

    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    useEffect(() => {
        setFilteredOrders(safeOrders);
    }, [safeOrders]);

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
        <AppLayout breadcrumbs={breadcrumbs} cartCount={cartCount}>
            <Head title="Riwayat Pesanan" />
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                {/* Header */}
                <h1 className="mb-6 text-3xl font-bold">Riwayat Pesanan</h1>

                {/* List Orders */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            Tidak ada riwayat pesanan.
                        </p>
                    ) : (
                        filteredOrders.map((order) => (
                            <Card
                                key={order.id}
                                className="spaca-y-0 gap-0 shadow-sm"
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
