import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app/app-header-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

type OrderType = {
    id: number;
    qty: number;
    price: number;
    subtotal: number;
    notes?: string;
    product: {
        name: string;
        image: string;
    };
    variant?: {
        id: number;
        name: string;
        price: number;
    };
};

export default function EditOrder({ order }: { order: OrderType }) {
    const [qty, setQty] = useState(order.qty);
    const [notes, setNotes] = useState(order.notes || '');
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const token = localStorage.getItem('cart_token');

    // if (!token) return setCartCount(0);

    // const formatPrice = (price: number) =>
    //     new Intl.NumberFormat('id-ID', {
    //         style: 'currency',
    //         currency: 'IDR',
    //         minimumFractionDigits: 0,
    //     }).format(price);

    const fetchCartCount = async () => {
        const token = localStorage.getItem('cart_token');

        if (!token) return setCartCount(0);

        try {
            const res = await axios.get(`/cart/count?cart_token=${token}`);
            setCartCount(res.data.count || 0);
        } catch (err) {
            console.error('Gagal mengambil cart count:', err);
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, []);

    const handleSave = async () => {
        setLoading(true);

        try {
            await axios.post('/cart/update', {
                id: order.id,
                qty,
                notes,
            });

            router.visit('/cart?cart_token=' + token);
        } catch (error) {
            console.error('Gagal menyimpan perubahan:', error);
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Menu`,
            href: `/menu`,
        },
        {
            title: `Keranjang`,
            href: `/cart?cart_token=${token}`,
        },
        {
            title: `Edit Pesanan`,
            href: `/edit-order/${order.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} cartCount={cartCount}>
            <Head title={`Edit Pesanan - ${order.product.name}`} />
            <div className="space-y-6 p-6">
                {/* Back Button */}
                <button
                    onClick={() => history.back()}
                    className="absolute top-2 left-2 z-10 rounded-full bg-white p-2 shadow hover:bg-gray-100"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Product Image */}
                <Avatar className="h-64 w-full rounded-md border">
                    <AvatarImage
                        src={order.product.image}
                        alt={order.product.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="rounded-md text-3xl">
                        IMG
                    </AvatarFallback>
                </Avatar>

                {/* Product Name */}
                <h1 className="text-3xl font-bold">{order.product.name}</h1>

                {/* Variant */}
                {order.variant && (
                    <div>
                        <p className="font-semibold">Varian:</p>
                        <Badge className="mt-2 bg-primary text-white capitalize">
                            {order.variant.name}
                        </Badge>
                    </div>
                )}

                {/* Quantity */}
                <div>
                    <h2 className="text-lg font-semibold">Jumlah</h2>
                    <div className="mt-2 flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                                setQty((prev) => Math.max(prev - 1, 1))
                            }
                            className="h-8 w-8"
                        >
                            -
                        </Button>
                        <span className="w-6 text-center">{qty}</span>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setQty((prev) => prev + 1)}
                            className="h-8 w-8"
                        >
                            +
                        </Button>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <h2 className="text-lg font-semibold">Catatan Opsional</h2>
                    <Textarea
                        placeholder="Contoh: Kurangi gula, es sedikit..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-2"
                    />
                </div>

                {/* Save Button */}
                <Button
                    className="w-full py-6 text-lg font-bold"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </div>
        </AppLayout>
    );
}
