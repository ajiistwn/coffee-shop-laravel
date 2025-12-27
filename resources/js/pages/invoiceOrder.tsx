import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app/app-header-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

type CartItem = {
    id: number;
    qty: number;
    price: number;
    subtotal: number;
    product: {
        name: string;
        image: string;
    };
    variant?: {
        name: string;
    };
    notes?: string;
};

type CartProps = {
    cart: {
        id: number;
        session_token: string;
        items: CartItem[];
        total: number;
    };
};

export default function InvoiceOrder({ cart }: CartProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    // const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    useEffect(() => {
        setCartCount(cart.items.map((i) => i.qty).reduce((a, b) => a + b, 0));
    }, [cart.items.length]);

    const handleCheckout = async () => {
        if (!name.trim()) {
            alert('Nama harus diisi');
            return;
        }

        setLoading(true);

        try {
            // Trigger Xendit API untuk membuat invoice QRIS
            const response = await axios.post('/checkout', {
                cart_id: cart.id,
                name,
                // payment_method: 'qris',
                payment_method: 'invoice',
            });
            console.log('Checkout response:', response.data);
            const { invoice_url } = response.data;
            window.location.href = invoice_url;
        } catch (error) {
            console.error('Gagal melakukan checkout:', error);
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
            href: `/cart?cart_token=${cart.session_token}`,
        },
        {
            title: `Invoice`,
            href: `/invoice`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} cartCount={cartCount}>
            <Head title="Invoice Pesanan" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <h1 className="text-3xl font-bold">Invoice Pesanan</h1>

                {/* Nama Pemesan */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">
                        Nama Pemesan
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        required
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama Anda"
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>

                {/* Detail Pesanan */}
                <div>
                    <h2 className="text-lg font-semibold">Detail Pesanan</h2>
                    <div className="mt-4 space-y-4">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                                <div>
                                    <p className="font-semibold">
                                        {item.product.name}
                                    </p>
                                    {item.variant && (
                                        <p className="text-sm text-muted-foreground">
                                            Varian: {item.variant.name}
                                        </p>
                                    )}
                                    {item.notes && (
                                        <p className="text-xs text-muted-foreground">
                                            Catatan: {item.notes}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold">
                                        Rp {item.subtotal.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        x{item.qty}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between border-t pt-4">
                    <p className="text-lg font-semibold">Total</p>
                    <p className="text-lg font-bold">
                        Rp {cart.total.toLocaleString()}
                    </p>
                </div>

                {/* Metode Pembayaran */}
                {/* <div>
                    <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            type="radio"
                            id="qris"
                            name="payment_method"
                            value="qris"
                            checked
                            readOnly
                        />
                        <label htmlFor="qris">QRIS</label>
                    </div>
                </div> */}

                {/* Tombol Checkout */}
                <Button
                    className="w-full py-5 text-lg font-bold"
                    onClick={handleCheckout}
                    disabled={loading}
                >
                    {loading ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>

                {/* QR Code */}
                {/* {qrCodeUrl && (
                    <div className="text-center">
                        <p className="mb-2 font-semibold">
                            Scan QR Code di bawah ini:
                        </p>
                        <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="mx-auto h-48 w-48"
                        />
                    </div>
                )} */}
            </div>
        </AppLayout>
    );
}
