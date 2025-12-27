import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/customer/app-layout';
// import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Search, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type Variant = {
    id: number | null;
    name: string;
    price: number;
    status: string;
};

type Product = {
    id: number;
    name: string;
    image: string;
    category_id: number;
    status: string;
    variants: Variant[];
};

interface PageProps {
    products: Product[];
    categories: Category[];
    [key: string]: unknown;
}

export default function Menu() {
    const { products, categories } = usePage<PageProps>().props;

    const [cartCount, setCartCount] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );

    // Fetch cart count
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

    // Filter produk berdasarkan search + kategori
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === null ||
                product.category_id === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    // Grouping produk by kategori
    const groupedProducts = useMemo(() => {
        const grouped: Record<number, Product[]> = {};
        filteredProducts.forEach((product) => {
            if (!grouped[product.category_id])
                grouped[product.category_id] = [];
            grouped[product.category_id].push(product);
        });
        return grouped;
    }, [filteredProducts]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Menu`,
            href: `/menu`,
        },
    ];

    console.log('cartCount in Menu:', cartCount);
    return (
        <AppLayout breadcrumbs={breadcrumbs} cartCount={cartCount}>
            <Head title={`Menu`} />
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] p-4 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex flex-1 flex-col gap-4 p-0 pt-0">
                    {/* Search & Filter */}
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={
                                    selectedCategory === null
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                            >
                                Semua
                            </Button>

                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={
                                        selectedCategory === cat.id
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* List Produk */}
                    <div className="flex flex-col gap-6">
                        {Object.entries(groupedProducts).map(
                            ([catId, catProducts]) => (
                                <div
                                    key={catId}
                                    className="flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-semibold">
                                            {categories.find(
                                                (c) => c.id === Number(catId),
                                            )?.name ?? 'Unknown'}
                                        </h2>
                                        <Badge variant="secondary">
                                            {catProducts.length} produk
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                                        {catProducts.map((product) => (
                                            <Card
                                                key={product.id}
                                                className="cursor-pointer gap-0 py-4 transition hover:shadow-lg"
                                                onClick={() =>
                                                    (window.location.href = `/menu/${product.id}`)
                                                }
                                            >
                                                <CardHeader className="px-4">
                                                    <Avatar className="h-full min-h-[7rem] w-full rounded-md border">
                                                        <AvatarImage
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback className="rounded-md">
                                                            {getInitials(
                                                                product.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </CardHeader>

                                                <CardTitle className="mx-4 text-left font-bold">
                                                    <h2>{product.name}</h2>

                                                    <Badge
                                                        className={`mt-2 capitalize ${
                                                            product.status ===
                                                            'available'
                                                                ? 'bg-green-600 text-white'
                                                                : product.status ===
                                                                    'sold'
                                                                  ? 'bg-red-600 text-white'
                                                                  : 'bg-gray-900 text-white'
                                                        }`}
                                                    >
                                                        {product.status}
                                                    </Badge>
                                                </CardTitle>

                                                <CardContent className="px-2">
                                                    <div className="mt-2 flex flex-col gap-1">
                                                        {product.variants
                                                            ?.length ? (
                                                            product.variants.map(
                                                                (v) => (
                                                                    <span className="mx-2 text-sm font-medium">
                                                                        {v.name}{' '}
                                                                        {formatPrice(
                                                                            v.price,
                                                                        )}
                                                                    </span>
                                                                ),
                                                            )
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                Tidak ada
                                                                variant
                                                            </p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>

                {/* Tombol Keranjang */}
                {(cartCount ?? 0) > 0 && (
                    <Button
                        onClick={() => {
                            const token = localStorage.getItem('cart_token');
                            window.location.href = `/cart?cart_token=${token}`;
                        }}
                        className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-full px-6 py-5 shadow-lg"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        Keranjang
                        <Badge className="bg-white font-bold text-primary">
                            {cartCount}
                        </Badge>
                    </Button>
                )}
            </div>
        </AppLayout>
    );
}
