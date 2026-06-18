import { AppSidebar } from '@/components/app-sidebar';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from '@/components/ui/breadcrumb';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Head } from '@inertiajs/react';
import {
    ClipboardList,
    CreditCard,
    PackageCheck,
    ReceiptText,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from 'recharts';

type Summary = {
    totalRevenue: number;
    todayRevenue: number;
    todayOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
    revenueTrend: number;
    ordersTrend: number;
};

type ChartData = {
    date: string;
    revenue: number;
    orders: number;
};

type StatusBreakdown = {
    status: string;
    total: number;
};

type TopProduct = {
    name: string;
    quantity: number;
    revenue: number;
};

type RecentOrder = {
    id: number;
    name: string;
    total: number;
    payment_status: string;
    status: string;
    created_at: string;
};

type DashboardProps = {
    summary: Summary;
    chartData: ChartData[];
    statusBreakdown: StatusBreakdown[];
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
};

const revenueChartConfig = {
    revenue: {
        label: 'Omzet',
        color: 'var(--chart-1)',
    },
    orders: {
        label: 'Pesanan',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

const productChartConfig = {
    quantity: {
        label: 'Terjual',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    preparing: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const paymentStatusLabels: Record<string, string> = {
    paid: 'Lunas',
    pending: 'Menunggu',
    failed: 'Gagal',
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat('id-ID').format(value);
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
    });
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getTrendBadge(trend: number) {
    const isPositive = trend >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
        <Badge variant="outline" className="gap-1">
            <Icon className="h-3.5 w-3.5" />
            {isPositive ? '+' : ''}
            {trend}%
        </Badge>
    );
}

function getOrderStatusBadge(status: string) {
    if (status === 'completed') {
        return <Badge className="bg-green-600 text-white">Selesai</Badge>;
    }

    if (status === 'preparing') {
        return <Badge className="bg-blue-600 text-white">Diproses</Badge>;
    }

    if (status === 'cancelled') {
        return <Badge className="bg-red-600 text-white">Dibatalkan</Badge>;
    }

    return <Badge className="bg-yellow-600 text-white">Menunggu</Badge>;
}

function getPaymentStatusBadge(status: string) {
    if (status === 'paid') {
        return (
            <Badge className="bg-green-600 text-white">
                {paymentStatusLabels[status]}
            </Badge>
        );
    }

    if (status === 'failed') {
        return (
            <Badge className="bg-red-600 text-white">
                {paymentStatusLabels[status]}
            </Badge>
        );
    }

    return (
        <Badge className="bg-yellow-600 text-white">
            {paymentStatusLabels[status] ?? status}
        </Badge>
    );
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string;
    description: string;
    icon: typeof Wallet;
    trend?: number;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums">
                        {value}
                    </CardTitle>
                </div>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>{description}</span>
                {trend !== undefined && getTrendBadge(trend)}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    summary,
    chartData,
    statusBreakdown,
    topProducts,
    recentOrders,
}: DashboardProps) {
    const [timeRange, setTimeRange] = useState('30d');

    const filteredChartData = useMemo(() => {
        const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;

        return chartData.slice(-days);
    }, [chartData, timeRange]);

    return (
        <SidebarProvider>
            <Head title="Dashboard Laporan" />
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
                                    <BreadcrumbLink href="/dashboard">
                                        Dashboard Laporan
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-5 p-4 pt-0">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Ringkasan Penjualan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Laporan dihitung dari data pesanan dan pembayaran
                            yang tersimpan.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            title="Total Omzet"
                            value={formatCurrency(summary.totalRevenue)}
                            description="Semua pesanan yang sudah lunas"
                            icon={Wallet}
                        />
                        <SummaryCard
                            title="Omzet Hari Ini"
                            value={formatCurrency(summary.todayRevenue)}
                            description="Dibandingkan kemarin"
                            icon={ReceiptText}
                            trend={summary.revenueTrend}
                        />
                        <SummaryCard
                            title="Pesanan Hari Ini"
                            value={formatNumber(summary.todayOrders)}
                            description="Jumlah pesanan masuk hari ini"
                            icon={ClipboardList}
                            trend={summary.ordersTrend}
                        />
                        <SummaryCard
                            title="Rata-rata Transaksi"
                            value={formatCurrency(summary.averageOrderValue)}
                            description={`${formatNumber(summary.pendingOrders)} pesanan masih menunggu`}
                            icon={CreditCard}
                        />
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
                        <Card className="xl:col-span-2">
                            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <CardTitle>
                                        Grafik Omzet dan Pesanan
                                    </CardTitle>
                                    <CardDescription>
                                        Pergerakan omzet lunas dan jumlah
                                        pesanan berdasarkan tanggal.
                                    </CardDescription>
                                </div>
                                <div>
                                    <ToggleGroup
                                        type="single"
                                        value={timeRange}
                                        onValueChange={(value) => {
                                            if (value) {
                                                setTimeRange(value);
                                            }
                                        }}
                                        variant="outline"
                                        className="hidden md:flex"
                                    >
                                        <ToggleGroupItem value="30d">
                                            30 Hari
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="14d">
                                            14 Hari
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="7d">
                                            7 Hari
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                    <Select
                                        value={timeRange}
                                        onValueChange={setTimeRange}
                                    >
                                        <SelectTrigger className="w-36 md:hidden">
                                            <SelectValue placeholder="Rentang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30d">
                                                30 Hari
                                            </SelectItem>
                                            <SelectItem value="14d">
                                                14 Hari
                                            </SelectItem>
                                            <SelectItem value="7d">
                                                7 Hari
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={revenueChartConfig}
                                    className="h-[320px] w-full"
                                >
                                    <AreaChart data={filteredChartData}>
                                        <defs>
                                            <linearGradient
                                                id="fillRevenue"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-revenue)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-revenue)"
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={formatDate}
                                        />
                                        <YAxis
                                            yAxisId="revenue"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) =>
                                                `${Number(value) / 1000}rb`
                                            }
                                        />
                                        <YAxis
                                            yAxisId="orders"
                                            orientation="right"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    indicator="dot"
                                                    labelFormatter={(value) =>
                                                        formatDate(
                                                            String(value),
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <Area
                                            yAxisId="revenue"
                                            dataKey="revenue"
                                            type="natural"
                                            fill="url(#fillRevenue)"
                                            stroke="var(--color-revenue)"
                                        />
                                        <Area
                                            yAxisId="orders"
                                            dataKey="orders"
                                            type="natural"
                                            fill="transparent"
                                            stroke="var(--color-orders)"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status Pesanan</CardTitle>
                                <CardDescription>
                                    Jumlah pesanan berdasarkan proses saat ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {statusBreakdown.map((item) => (
                                    <div
                                        key={item.status}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {statusLabels[item.status] ??
                                                    item.status}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Total pesanan
                                            </p>
                                        </div>
                                        <Badge variant="secondary">
                                            {formatNumber(item.total)}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Produk Terlaris</CardTitle>
                                <CardDescription>
                                    Berdasarkan jumlah item dari pesanan lunas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topProducts.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-muted-foreground">
                                        Belum ada data produk terjual.
                                    </p>
                                ) : (
                                    <ChartContainer
                                        config={productChartConfig}
                                        className="h-[280px] w-full"
                                    >
                                        <BarChart data={topProducts}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                interval={0}
                                                tickFormatter={(value) =>
                                                    String(value).length > 12
                                                        ? `${String(value).slice(0, 12)}...`
                                                        : String(value)
                                                }
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent indicator="dot" />
                                                }
                                            />
                                            <Bar
                                                dataKey="quantity"
                                                fill="var(--color-quantity)"
                                                radius={[6, 6, 0, 0]}
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pesanan Terbaru</CardTitle>
                                <CardDescription>
                                    Aktivitas pesanan terakhir yang masuk.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recentOrders.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-muted-foreground">
                                        Belum ada pesanan.
                                    </p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <PackageCheck className="h-4 w-4 text-muted-foreground" />
                                                    <p className="font-medium">
                                                        #{order.id} -{' '}
                                                        {order.name}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        order.created_at,
                                                    )}{' '}
                                                    ·{' '}
                                                    {formatCurrency(
                                                        order.total,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {getOrderStatusBadge(
                                                    order.status,
                                                )}
                                                {getPaymentStatusBadge(
                                                    order.payment_status,
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
