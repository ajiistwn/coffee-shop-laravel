import { AppSidebar } from '@/components/app-sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from '@/components/ui/breadcrumb';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
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
import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

// Simple hook to detect mobile screen size
function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    );

    React.useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
}

export default function Page() {
    const chartData = [
        { date: '2024-04-01', desktop: 222, mobile: 150 },
        { date: '2024-04-02', desktop: 97, mobile: 180 },
        { date: '2024-04-03', desktop: 167, mobile: 120 },
        { date: '2024-04-04', desktop: 242, mobile: 260 },
        { date: '2024-04-05', desktop: 373, mobile: 290 },
        { date: '2024-04-06', desktop: 301, mobile: 340 },
        { date: '2024-04-07', desktop: 245, mobile: 180 },
        { date: '2024-04-08', desktop: 409, mobile: 320 },
        { date: '2024-04-09', desktop: 59, mobile: 110 },
        { date: '2024-04-10', desktop: 261, mobile: 190 },
        { date: '2024-04-11', desktop: 327, mobile: 350 },
        { date: '2024-04-12', desktop: 292, mobile: 210 },
        { date: '2024-04-13', desktop: 342, mobile: 380 },
        { date: '2024-04-14', desktop: 137, mobile: 220 },
        { date: '2024-04-15', desktop: 120, mobile: 170 },
        { date: '2024-04-16', desktop: 138, mobile: 190 },
        { date: '2024-04-17', desktop: 446, mobile: 360 },
        { date: '2024-04-18', desktop: 364, mobile: 410 },
        { date: '2024-04-19', desktop: 243, mobile: 180 },
        { date: '2024-04-20', desktop: 89, mobile: 150 },
        { date: '2024-04-21', desktop: 137, mobile: 200 },
        { date: '2024-04-22', desktop: 224, mobile: 170 },
        { date: '2024-04-23', desktop: 138, mobile: 230 },
        { date: '2024-04-24', desktop: 387, mobile: 290 },
        { date: '2024-04-25', desktop: 215, mobile: 250 },
        { date: '2024-04-26', desktop: 75, mobile: 130 },
        { date: '2024-04-27', desktop: 383, mobile: 420 },
        { date: '2024-04-28', desktop: 122, mobile: 180 },
        { date: '2024-04-29', desktop: 315, mobile: 240 },
        { date: '2024-04-30', desktop: 454, mobile: 380 },
        { date: '2024-05-01', desktop: 165, mobile: 220 },
        { date: '2024-05-02', desktop: 293, mobile: 310 },
        { date: '2024-05-03', desktop: 247, mobile: 190 },
        { date: '2024-05-04', desktop: 385, mobile: 420 },
        { date: '2024-05-05', desktop: 481, mobile: 390 },
        { date: '2024-05-06', desktop: 498, mobile: 520 },
        { date: '2024-05-07', desktop: 388, mobile: 300 },
        { date: '2024-05-08', desktop: 149, mobile: 210 },
        { date: '2024-05-09', desktop: 227, mobile: 180 },
        { date: '2024-05-10', desktop: 293, mobile: 330 },
        { date: '2024-05-11', desktop: 335, mobile: 270 },
        { date: '2024-05-12', desktop: 197, mobile: 240 },
        { date: '2024-05-13', desktop: 197, mobile: 160 },
        { date: '2024-05-14', desktop: 448, mobile: 490 },
        { date: '2024-05-15', desktop: 473, mobile: 380 },
        { date: '2024-05-16', desktop: 338, mobile: 400 },
        { date: '2024-05-17', desktop: 499, mobile: 420 },
        { date: '2024-05-18', desktop: 315, mobile: 350 },
        { date: '2024-05-19', desktop: 235, mobile: 180 },
        { date: '2024-05-20', desktop: 177, mobile: 230 },
        { date: '2024-05-21', desktop: 82, mobile: 140 },
        { date: '2024-05-22', desktop: 81, mobile: 120 },
        { date: '2024-05-23', desktop: 252, mobile: 290 },
        { date: '2024-05-24', desktop: 294, mobile: 220 },
        { date: '2024-05-25', desktop: 201, mobile: 250 },
        { date: '2024-05-26', desktop: 213, mobile: 170 },
        { date: '2024-05-27', desktop: 420, mobile: 460 },
        { date: '2024-05-28', desktop: 233, mobile: 190 },
        { date: '2024-05-29', desktop: 78, mobile: 130 },
        { date: '2024-05-30', desktop: 340, mobile: 280 },
        { date: '2024-05-31', desktop: 178, mobile: 230 },
        { date: '2024-06-01', desktop: 178, mobile: 200 },
        { date: '2024-06-02', desktop: 470, mobile: 410 },
        { date: '2024-06-03', desktop: 103, mobile: 160 },
        { date: '2024-06-04', desktop: 439, mobile: 380 },
        { date: '2024-06-05', desktop: 88, mobile: 140 },
        { date: '2024-06-06', desktop: 294, mobile: 250 },
        { date: '2024-06-07', desktop: 323, mobile: 370 },
        { date: '2024-06-08', desktop: 385, mobile: 320 },
        { date: '2024-06-09', desktop: 438, mobile: 480 },
        { date: '2024-06-10', desktop: 155, mobile: 200 },
        { date: '2024-06-11', desktop: 92, mobile: 150 },
        { date: '2024-06-12', desktop: 492, mobile: 420 },
        { date: '2024-06-13', desktop: 81, mobile: 130 },
        { date: '2024-06-14', desktop: 426, mobile: 380 },
        { date: '2024-06-15', desktop: 307, mobile: 350 },
        { date: '2024-06-16', desktop: 371, mobile: 310 },
        { date: '2024-06-17', desktop: 475, mobile: 520 },
        { date: '2024-06-18', desktop: 107, mobile: 170 },
        { date: '2024-06-19', desktop: 341, mobile: 290 },
        { date: '2024-06-20', desktop: 408, mobile: 450 },
        { date: '2024-06-21', desktop: 169, mobile: 210 },
        { date: '2024-06-22', desktop: 317, mobile: 270 },
        { date: '2024-06-23', desktop: 480, mobile: 530 },
        { date: '2024-06-24', desktop: 132, mobile: 180 },
        { date: '2024-06-25', desktop: 141, mobile: 190 },
        { date: '2024-06-26', desktop: 434, mobile: 380 },
        { date: '2024-06-27', desktop: 448, mobile: 490 },
        { date: '2024-06-28', desktop: 149, mobile: 200 },
        { date: '2024-06-29', desktop: 103, mobile: 160 },
        { date: '2024-06-30', desktop: 446, mobile: 400 },
    ];

    const chartConfig = {
        visitors: {
            label: 'Visitors',
        },
        desktop: {
            label: 'Desktop',
            color: 'var(--primary)',
        },
        mobile: {
            label: 'Mobile',
            color: 'var(--primary)',
        },
    } satisfies ChartConfig;

    const isMobile = useIsMobile();
    const [timeRange, setTimeRange] = React.useState('1h');
    React.useEffect(() => {
        if (isMobile) {
            setTimeRange('7d');
        }
    }, [isMobile]);
    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date);
        const referenceDate = new Date('2024-06-30');
        let daysToSubtract = 90;
        if (timeRange === '30d') {
            daysToSubtract = 30;
        } else if (timeRange === '7d') {
            daysToSubtract = 7;
        }
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return date >= startDate;
    });
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
                                    <BreadcrumbLink href="#">
                                        Building Your Application
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {/* <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem> */}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col pt-0">
                    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/1 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 dark:*:data-[slot=card]:bg-card">
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Total Revenue</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    1.250.000
                                </CardTitle>
                                {/* <CardAction>
                                    <Badge variant="outline">
                                        <TrendingUp />
                                        +12.5%
                                    </Badge>
                                </CardAction> */}
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Daily turnover{' '}
                                    <TrendingUp className="size-4" />
                                </div>
                                <div className="text-muted-foreground">
                                    Today's turnover since opening
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>
                                    Total Customers
                                </CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    234
                                </CardTitle>
                                <CardAction>
                                    {/* <Badge variant="outline">
                                        <TrendingDown />
                                        -20%
                                    </Badge> */}
                                </CardAction>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Number of daily customers{' '}
                                    <TrendingDown className="size-4" />
                                </div>
                                <div className="text-muted-foreground">
                                    Number of daily customers since opening
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="px-4 pt-5 lg:px-4">
                        <Card className="@container/card">
                            <CardHeader>
                                <CardTitle>Total Visitors</CardTitle>
                                <CardDescription>
                                    <span className="hidden @[540px]/card:block">
                                        Total for the last 3 months
                                    </span>
                                    <span className="@[540px]/card:hidden">
                                        Last 3 months
                                    </span>
                                </CardDescription>
                                <CardAction>
                                    <ToggleGroup
                                        type="single"
                                        value={timeRange}
                                        onValueChange={setTimeRange}
                                        variant="outline"
                                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                                    >
                                        <ToggleGroupItem value="90d">
                                            Last 3 months
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="30d">
                                            Last 30 days
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="7d">
                                            Last 7 days
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                    <Select
                                        value={timeRange}
                                        onValueChange={setTimeRange}
                                    >
                                        <SelectTrigger
                                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                                            // size="sm"
                                            aria-label="Select a value"
                                        >
                                            <SelectValue placeholder="Last 3 months" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem
                                                value="90d"
                                                className="rounded-lg"
                                            >
                                                Last 3 months
                                            </SelectItem>
                                            <SelectItem
                                                value="30d"
                                                className="rounded-lg"
                                            >
                                                Last 30 days
                                            </SelectItem>
                                            <SelectItem
                                                value="7d"
                                                className="rounded-lg"
                                            >
                                                Last 7 days
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardAction>
                            </CardHeader>
                            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto h-[250px] w-full"
                                >
                                    <AreaChart data={filteredData}>
                                        <defs>
                                            <linearGradient
                                                id="fillDesktop"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-desktop)"
                                                    stopOpacity={1.0}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-desktop)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="fillMobile"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-mobile)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-mobile)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return date.toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                );
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(value) => {
                                                        return new Date(
                                                            value,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            },
                                                        );
                                                    }}
                                                    indicator="dot"
                                                />
                                            }
                                        />
                                        <Area
                                            dataKey="mobile"
                                            type="natural"
                                            fill="url(#fillMobile)"
                                            stroke="var(--color-mobile)"
                                            stackId="a"
                                        />
                                        <Area
                                            dataKey="desktop"
                                            type="natural"
                                            fill="url(#fillDesktop)"
                                            stroke="var(--color-desktop)"
                                            stackId="a"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
