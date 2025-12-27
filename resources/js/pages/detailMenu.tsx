import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app/app-header-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

type ProductType = {
    id: number | null;
    name: string;
    status: string;
    image?: string;
    deleted_at?: string | null;
    description?: string;
    category?: {
        name: string;
    };
    variants: Variant[];
};
type Variant = {
    id: number;
    name: string;
    price: number;
    status: string;
};

export default function Detail() {
    const { product } = usePage<{ product: ProductType }>().props;

    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [cartCount, setCartCount] = useState(0);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);

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
        (async () => {
            await fetchCartCount();
        })();
    }, []);

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            alert('Silakan pilih varian');
            return;
        }

        let token = localStorage.getItem('cart_token');

        if (!token) {
            token = crypto.randomUUID();
            localStorage.setItem('cart_token', token);
        }

        await axios.post('/cart/add', {
            session_token: token,
            product_id: product.id,
            variant_id: selectedVariant,
            notes,
            price: product.variants.find((v) => v.id === selectedVariant)
                ?.price,
        });

        router.visit(`/cart?cart_token=${token}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Menu`,
            href: `/menu`,
        },
        {
            title: product.name,
            href: `/menu/${product.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} cartCount={cartCount}>
            <Head title={`Detail ${product.name}`} />
            <div className="space-y-6 p-6">
                {/* Gambar Produk */}
                <button
                    onClick={() => history.back()}
                    className="absolute top-2 left-2 z-10 rounded-full bg-white p-2 shadow hover:bg-gray-100"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar className="h-64 w-full rounded-md border">
                    <AvatarImage
                        src={product.image}
                        alt={product.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="rounded-md text-3xl">
                        IMG
                    </AvatarFallback>
                </Avatar>

                {/* Nama + Status */}
                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <Badge
                        className={`mt-2 capitalize ${
                            product.status === 'available'
                                ? 'bg-green-500'
                                : product.status === 'sold'
                                  ? 'bg-red-500'
                                  : 'bg-black'
                        } text-white`}
                    >
                        {product.status}
                    </Badge>
                </div>

                {/* Deskripsi */}
                {product.description && (
                    <p className="text-muted-foreground">
                        {product.description}
                    </p>
                )}

                {/* Variants */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Pilih Varian</h2>

                    {product.variants.length > 0 ? (
                        product.variants.map((variant: Variant) => (
                            <div
                                key={variant.id}
                                className={`flex cursor-pointer items-center justify-between rounded-md border p-3 ${
                                    selectedVariant === variant.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-muted'
                                }`}
                                onClick={() => setSelectedVariant(variant.id)}
                            >
                                <div>
                                    <p className="font-semibold">
                                        {variant.name}
                                    </p>
                                    <p className="font-bold text-primary">
                                        {formatPrice(variant.price)}
                                    </p>
                                </div>

                                <Badge
                                    className={`capitalize ${
                                        variant.status === 'available'
                                            ? 'bg-green-500'
                                            : variant.status === 'sold'
                                              ? 'bg-red-500'
                                              : 'bg-black'
                                    }`}
                                >
                                    {variant.status}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Tidak ada varian
                        </p>
                    )}
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

                {/* Add to Cart Button */}
                <Button
                    className="w-full py-6 text-lg font-bold"
                    onClick={handleAddToCart}
                >
                    Tambahkan ke Keranjang
                </Button>
            </div>
        </AppLayout>
    );
}
