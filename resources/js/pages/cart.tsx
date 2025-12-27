import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app/app-header-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

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
        items: CartItem[];
    };
};

export default function Cart({ cart }: CartProps) {
    const [items, setItems] = useState(cart?.items || []);
    const [cartCount, setCartCount] = useState(
        items.map((i) => i.qty).reduce((a, b) => a + b, 0),
    );

    console.log(cart);

    const updateQty = async (id: number, qty: number) => {
        if (qty < 1) return;

        await axios.post('/cart/update', { id, qty });

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, qty, subtotal: qty * item.price }
                    : item,
            ),
        );
        setCartCount(
            (prev) =>
                prev +
                (qty > (items.find((i) => i.id === id)?.qty ?? 0) ? 1 : -1),
        );
    };

    const deleteItem = async (id: number) => {
        await axios.post('/cart/delete', { id });
        setItems((prev) => prev.filter((item) => item.id !== id));
        setCartCount((prev) => prev - 1);
    };

    const handleCheckout = () => {
        const token = localStorage.getItem('cart_token');
        if (!token) {
            alert(
                'Keranjang tidak ditemukan. Silakan tambahkan item terlebih dahulu.',
            );
            return;
        }

        router.visit(`/invoice?cart_token=${token}`);
    };

    const total = items.reduce((sum, i) => sum + i.subtotal, 0);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Menu`,
            href: `/menu`,
        },
        {
            title: `Keranjang`,
            href: `/cart`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} cartCount={cartCount}>
            <Head title={`Keranjang`} />
            <div className="flex min-h-screen flex-col">
                {/* LIST ITEMS */}
                <div className="flex-1 space-y-4 p-6">
                    {items.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            Keranjang masih kosong.
                        </p>
                    ) : (
                        items.map((item) => (
                            <Card key={item.id} className="shadow-sm">
                                <CardContent className="flex items-start gap-4 p-4">
                                    {/* FOTO PRODUK */}
                                    <Avatar className="h-16 w-16 rounded-md border">
                                        <AvatarImage
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="rounded-md">
                                            IMG
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* INFO PRODUK */}
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {item.product.name}
                                        </p>

                                        {item.variant && (
                                            <p className="text-sm text-muted-foreground">
                                                Varian: {item.variant.name}
                                            </p>
                                        )}

                                        {item.notes && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Catatan: {item.notes}
                                            </p>
                                        )}

                                        <p className="mt-2 font-bold">
                                            Rp {item.subtotal.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* ACTION */}
                                    <div className="flex flex-col items-center justify-between gap-2">
                                        {/* Qty */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.qty - 1,
                                                    )
                                                }
                                                className="h-8 w-8"
                                            >
                                                -
                                            </Button>

                                            <span className="w-6 text-center">
                                                {item.qty}
                                            </span>

                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.qty + 1,
                                                    )
                                                }
                                                className="h-8 w-8"
                                            >
                                                +
                                            </Button>
                                        </div>
                                        {/* Edit */}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() =>
                                                router.visit(
                                                    `/edit-order/${item.id}`,
                                                )
                                            }
                                        >
                                            Edit
                                        </Button>

                                        {/* Delete */}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteItem(item.id)}
                                        >
                                            Hapus
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* FOOTER TOTAL + BUTTON */}
                {items.length > 0 && (
                    <div className="sticky bottom-0 w-full border-t bg-background p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-lg font-semibold">Total</p>
                            <p className="text-xl font-bold">
                                Rp {total.toLocaleString()}
                            </p>
                        </div>

                        <Button
                            className="w-full py-5 text-lg font-bold"
                            onClick={handleCheckout}
                        >
                            Checkout
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
