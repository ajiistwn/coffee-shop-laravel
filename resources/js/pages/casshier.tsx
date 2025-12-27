import { AppSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type Variant = {
    id: number;
    name: string;
    status: string;
    price: number;
};

type Product = {
    id: number;
    name: string;
    image: string;
    category_id: number;
    status: string;
    variants: Variant[];
};

export default function Cashier() {
    const { products, categories } = usePage<{
        products: Product[];
        categories: Category[];
    }>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );

    // Filter dan search products
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

    // Group products by category
    const groupedProducts = useMemo(() => {
        const grouped: Record<number, Product[]> = {};

        filteredProducts.forEach((product) => {
            if (!grouped[product.category_id]) {
                grouped[product.category_id] = [];
            }
            grouped[product.category_id].push(product);
        });

        return grouped;
    }, [filteredProducts]);

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Get category name by id
    const getCategoryName = (categoryId: number) => {
        return (
            categories.find((cat) => cat.id === categoryId)?.name || 'Unknown'
        );
    };

    // Get product initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
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
                                <BreadcrumbPage className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Cashier
                                    </BreadcrumbLink>
                                </BreadcrumbPage>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Search and Filter Section */}
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category Filter */}
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
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={
                                        selectedCategory === category.id
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setSelectedCategory(category.id)
                                    }
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Products List Grouped by Category */}
                    <div className="flex flex-col gap-6">
                        {Object.entries(groupedProducts).map(
                            ([categoryId, categoryProducts]) => (
                                <div
                                    key={categoryId}
                                    className="flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-semibold">
                                            {getCategoryName(
                                                Number(categoryId),
                                            )}
                                        </h2>
                                        <Badge variant="secondary">
                                            {categoryProducts.length} produk
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {categoryProducts.map((product) => (
                                            <Card
                                                key={product.id}
                                                className="-space-y-2 py-4 transition-shadow hover:shadow-lg"
                                            >
                                                <CardHeader className="flex flex-col items-start px-4">
                                                    {/* Gambar Persegi */}
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
                                                {/* Nama Produk */}
                                                <CardTitle className="mx-4 w-full text-left font-bold">
                                                    <h2>{product.name}</h2>

                                                    <Badge
                                                        className={`mt-2 capitalize ${
                                                            product.status ===
                                                            'available'
                                                                ? 'bg-green-500 text-white'
                                                                : product.status ===
                                                                    'sold'
                                                                  ? 'bg-red-500 text-white'
                                                                  : 'bg-black text-white'
                                                        } `}
                                                    >
                                                        {product.status}
                                                    </Badge>
                                                </CardTitle>

                                                {/* Variant List */}
                                                <CardContent className="-pt-2 mx-0 px-2">
                                                    <div className="flex flex-col gap-2 px-0">
                                                        {product.variants &&
                                                        product.variants
                                                            .length > 0 ? (
                                                            product.variants.map(
                                                                (variant) => (
                                                                    <div
                                                                        key={
                                                                            variant.id
                                                                        }
                                                                        className="flex items-center justify-between rounded-md bg-muted/50 p-2 transition-colors hover:bg-muted"
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-medium">
                                                                                {
                                                                                    variant.name
                                                                                }
                                                                                <Badge
                                                                                    className={`ms-2 mt-1 px-1 py-0 text-[10px] capitalize ${
                                                                                        variant.status ===
                                                                                        'available'
                                                                                            ? 'bg-green-500 text-white'
                                                                                            : variant.status ===
                                                                                                'sold'
                                                                                              ? 'bg-red-500 text-white'
                                                                                              : 'bg-black text-white'
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        variant.status
                                                                                    }
                                                                                </Badge>
                                                                            </span>
                                                                            <span className="text-sm font-bold text-primary">
                                                                                {formatPrice(
                                                                                    variant.price,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-8 w-8"
                                                                        >
                                                                            <Plus className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
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

                        {/* Empty State */}
                        {Object.keys(groupedProducts).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-muted-foreground">
                                    Tidak ada produk yang ditemukan
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>

            {/* Cart Sidebar - Kosong dulu */}
            <aside className="w-80 flex-col border-l">
                <div className="border-b p-4">
                    <h3 className="text-lg font-semibold">Keranjang</h3>
                </div>
                <div className="flex-1 p-4">
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        Keranjang masih kosong
                    </p>
                </div>
            </aside>
        </SidebarProvider>
    );
}
