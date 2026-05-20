import {
    useEffect,
    useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

import loadSellerDashboardAnalytics
    from "@/utils/salseDashboard/loadSellerDashboardAnalytics";

import RevenueAnalyticsChart
    from "@/components/salseDashboard/RevenueAnalyticsChart";

import RecentSellingProducts
    from "@/components/salseDashboard/RecentSellingProducts";

import BusinessInsights
    from "@/components/salseDashboard/BusinessInsights";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
    IndianRupee,
    Package,
    ShoppingCart,
    Boxes,
    TrendingUp,
    AlertTriangle,
    Truck,
    RotateCcw,
    Clock3,
    ArrowUpRight,
    Activity,
    BarChart3,
    Users,
    Store,
    ShieldAlert,
    TrendingDown,
    Wallet,
    Percent,
} from "lucide-react";

// ======================================
// FORMAT CURRENCY
// ======================================

const formatCurrency = (
    value = 0
) => {

    return new Intl.NumberFormat(
        "en-IN",
        {

            style: "currency",

            currency: "INR",

            maximumFractionDigits: 0,
        }
    ).format(value);
};

// ======================================
// PAGE
// ======================================

export default function SellerAnalytics() {

    const { user } =
        useAuth();

    const [loading,
        setLoading] =
        useState(true);

    const [dashboard,
        setDashboard] =
        useState(null);

    // ======================================
    // LOAD
    // ======================================

    useEffect(() => {

        if (!user) return;

        loadAnalytics();

    }, [user]);

    const loadAnalytics =
        async () => {

            try {

                setLoading(true);

                const analytics =
                    await loadSellerDashboardAnalytics({

                        user,
                    });

                setDashboard(
                    analytics
                );

                setLoading(false);

            } catch (err) {

                console.error(err);

                setLoading(false);
            }
        };

    // ======================================
    // LOADING
    // ======================================

    if (loading) {

        return (

            <div className="p-6 text-white">

                Loading Analytics...

            </div>
        );
    }

    // ======================================
    // CALCULATIONS
    // ======================================

    const avgOrderValue =
        dashboard.totalOrders > 0

            ? dashboard.totalRevenue /
            dashboard.totalOrders

            : 0;

    const profitMargin =
        dashboard.totalRevenue > 0

            ? (
                dashboard.totalProfit /
                dashboard.totalRevenue
            ) * 100

            : 0;

    const returnRate =
        dashboard.totalOrders > 0

            ? (
                dashboard.orderStatusCounts.RTO /
                dashboard.totalOrders
            ) * 100

            : 0;

    const deliverySuccessRate =
        dashboard.totalOrders > 0

            ? (
                (
                    dashboard.orderStatusCounts.Delivered /
                    dashboard.totalOrders
                ) * 100
            )

            : 0;

    const inventoryTurnover =
        dashboard.remainingInventory > 0

            ? (
                dashboard.totalSoldQty /
                dashboard.remainingInventory
            )

            : 0;

    // ======================================
    // KPI
    // ======================================

    const kpis = [

        {
            title:
                "Total Revenue",

            value:
                formatCurrency(
                    dashboard.totalRevenue
                ),

            icon:
                IndianRupee,

            color:
                "text-green-400",
        },

        {
            title:
                "Total Profit",

            value:
                formatCurrency(
                    dashboard.totalProfit
                ),

            icon:
                TrendingUp,

            color:
                "text-violet-400",
        },

        {
            title:
                "Average Order Value",

            value:
                formatCurrency(
                    avgOrderValue
                ),

            icon:
                Wallet,

            color:
                "text-cyan-400",
        },

        {
            title:
                "Profit Margin",

            value:
                `${profitMargin.toFixed(1)}%`,

            icon:
                Percent,

            color:
                "text-emerald-400",
        },

        {
            title:
                "Return Rate",

            value:
                `${returnRate.toFixed(1)}%`,

            icon:
                RotateCcw,

            color:
                "text-red-400",
        },

        {
            title:
                "Inventory Turnover",

            value:
                inventoryTurnover.toFixed(1),

            icon:
                Activity,

            color:
                "text-orange-400",
        },

        {
            title:
                "Delivery Success Rate",

            value:
                `${deliverySuccessRate.toFixed(1)}%`,

            icon:
                Truck,

            color:
                "text-green-400",
        },
    ];

    return (

        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6 space-y-8">

            {/* ======================================
            HEADER
            ====================================== */}

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                <div>

                    <h1 className="text-4xl font-black tracking-tight">

                        Business
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                            {" "}Intelligence
                        </span>

                    </h1>

                    <p className="text-zinc-400 mt-2 text-lg">

                        Advanced business analytics & growth insights

                    </p>

                </div>

                <div className="flex flex-wrap gap-3">

                    <button className="h-12 px-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-violet-500 transition">

                        Last 30 Days

                    </button>

                    <button className="h-12 px-5 rounded-2xl bg-violet-600 hover:bg-violet-700 transition font-semibold">

                        Export Analytics

                    </button>

                </div>

            </div>

            {/* ======================================
            KPI SECTION
            ====================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

                {kpis.map((item) => {

                    const Icon =
                        item.icon;

                    return (

                        <Card
                            key={item.title}
                            className="bg-zinc-900 border-zinc-800 rounded-3xl hover:border-violet-500/30 transition"
                        >

                            <CardContent className="p-6">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-zinc-400 text-sm">
                                            {item.title}
                                        </p>

                                        <h2 className="text-3xl font-black mt-3">
                                            {item.value}
                                        </h2>

                                    </div>

                                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">

                                        <Icon
                                            size={26}
                                            className={item.color}
                                        />

                                    </div>

                                </div>

                                <div className="mt-6 flex items-center gap-2 text-emerald-400">

                                    <ArrowUpRight size={16} />


                                    <span className="text-sm font-medium">
                                        Improved from last month
                                    </span>

                                </div>

                            </CardContent>


                        </Card>
                    );
                })}

            </div>

            {/* ======================================
            REVENUE + ORDER ANALYTICS
            ====================================== */}

            <div className="grid xl:grid-cols-3 gap-6">

                {/* Revenue Chart */}
                <div className="xl:col-span-2">

                    <RevenueAnalyticsChart
                        data={
                            dashboard.revenueAnalytics
                        }
                    />

                </div>

                {/* Order Status */}
                <Card className="bg-zinc-900 border-zinc-800 rounded-3xl">

                    <CardContent className="p-6">

                        <div className="flex items-center justify-between mb-8">

                            <div>

                                <h2 className="text-2xl font-bold">
                                    Order Intelligence
                                </h2>

                                <p className="text-zinc-400 mt-1">
                                    Fulfillment performance
                                </p>

                            </div>

                            <BarChart3 className="text-violet-400" />

                        </div>

                        <div className="space-y-5">

                            <OrderMetric
                                title="Delivered"
                                value={
                                    dashboard
                                        .orderStatusCounts
                                        .Delivered
                                }
                                color="bg-green-500"
                                icon={Truck}
                            />

                            <OrderMetric
                                title="Pending"
                                value={
                                    dashboard
                                        .orderStatusCounts
                                        .Pending
                                }
                                color="bg-yellow-500"
                                icon={Clock3}
                            />

                            <OrderMetric
                                title="Cancelled"
                                value={
                                    dashboard
                                        .orderStatusCounts
                                        .Cancelled
                                }
                                color="bg-red-500"
                                icon={AlertTriangle}
                            />

                            <OrderMetric
                                title="RTO"
                                value={
                                    dashboard
                                        .orderStatusCounts
                                        .RTO
                                }
                                color="bg-orange-500"
                                icon={RotateCcw}
                            />

                            <OrderMetric
                                title="Shipped"
                                value={
                                    dashboard
                                        .orderStatusCounts
                                        .Shipped
                                }
                                color="bg-blue-500"
                                icon={Truck}
                            />

                        </div>

                    </CardContent>

                </Card>

            </div>

            {/* ======================================
            MARKETPLACE ANALYTICS
            ====================================== */}

            <div className="grid md:grid-cols-3 gap-6">

                {[
                    {
                        name: "Amazon",
                        sales: "₹2,45,000",
                        orders: 520,
                        growth: "+18%",
                    },

                    {
                        name: "Flipkart",
                        sales: "₹1,82,000",
                        orders: 340,
                        growth: "+11%",
                    },

                    {
                        name: "Shopify",
                        sales: "₹92,000",
                        orders: 180,
                        growth: "+24%",
                    },
                ].map((marketplace) => (

                    <Card
                        key={marketplace.name}
                        className="bg-zinc-900 border-zinc-800 rounded-3xl"
                    >

                        <CardContent className="p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-zinc-400">
                                        {marketplace.name}
                                    </p>

                                    <h2 className="text-3xl font-black mt-3">
                                        {marketplace.sales}
                                    </h2>

                                </div>

                                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">

                                    <Store className="text-violet-400" />

                                </div>

                            </div>

                            <div className="mt-6 flex items-center justify-between">

                                <p className="text-zinc-400 text-sm">
                                    {marketplace.orders} Orders
                                </p>

                                <p className="text-emerald-400 font-semibold">
                                    {marketplace.growth}
                                </p>

                            </div>

                        </CardContent>

                    </Card>
                ))}

            </div>

            {/* ======================================
            SKU INTELLIGENCE
            ====================================== */}

            <Card className="bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden">

                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">

                    <div>

                        <h2 className="text-2xl font-bold">

                            SKU Intelligence Center

                        </h2>

                        <p className="text-zinc-400 mt-1">

                            Deep performance analytics by SKU

                        </p>

                    </div>

                    <Package className="text-violet-400" />

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1400px]">

                        <thead className="bg-zinc-950 border-b border-zinc-800">

                            <tr>

                                {[
                                    "SKU",
                                    "Delivered",
                                    "Pending",
                                    "Cancelled",
                                    "RTO",
                                    "Delivery Success %",
                                    "Revenue",
                                    "Profit",
                                    "ROI %",
                                    "Trend",
                                ].map((head) => (

                                    <th
                                        key={head}
                                        className="px-5 py-4 text-left text-sm font-semibold text-zinc-300"
                                    >

                                        {head}

                                    </th>
                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            {dashboard.topProducts.map(

                                (
                                    product,
                                    index
                                ) => {

                                    const roi =
                                        product.revenue > 0

                                            ? (
                                                (
                                                    product.profit /
                                                    product.revenue
                                                ) * 100
                                            ).toFixed(1)

                                            : 0;
                                    const deliverySuccessRate =
                                        product.totalSold > 0

                                            ? (
                                                (
                                                    product.delivered /
                                                    product.totalSold
                                                ) * 100
                                            ).toFixed(1)

                                            : 0;
                                    return (

                                        <tr
                                            key={index}
                                            className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
                                        >

                                            <td className="px-5 py-5 font-semibold">
                                                {product.sku}
                                            </td>

                                            <td className="px-5 py-5">
                                                {product.delivered}
                                            </td>

                                            <td className="px-5 py-5">
                                                {product.pending}
                                            </td>

                                            <td className="px-5 py-5">
                                                {product.cancelled}
                                            </td>

                                            <td className="px-5 py-5">
                                                {product.rto}
                                            </td>

                                            <td className="px-5 py-5">

                                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-semibold">

                                                    {deliverySuccessRate}%

                                                </div>

                                            </td>

                                            <td className="px-5 py-5 text-green-400 font-semibold">
                                                {formatCurrency(
                                                    product.revenue
                                                )}
                                            </td>

                                            <td className="px-5 py-5 text-violet-400 font-semibold">
                                                {formatCurrency(
                                                    product.profit
                                                )}
                                            </td>

                                            <td className="px-5 py-5 text-cyan-400 font-semibold">
                                                {roi}%
                                            </td>

                                            <td className="px-5 py-5">

                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">

                                                    <TrendingUp size={14} />

                                                    Growing

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>

            </Card>

            {/* ======================================
            INVENTORY + CUSTOMER INSIGHTS
            ====================================== */}

            <div className="grid xl:grid-cols-2 gap-6">

                {/* Inventory */}
                <Card className="bg-zinc-900 border-zinc-800 rounded-3xl">

                    <CardContent className="p-6">

                        <div className="flex items-center justify-between mb-8">

                            <div>

                                <h2 className="text-2xl font-bold">
                                    Inventory Intelligence
                                </h2>

                                <p className="text-zinc-400 mt-1">
                                    Stock movement insights
                                </p>

                            </div>

                            <Boxes className="text-violet-400" />

                        </div>

                        <div className="space-y-5">

                            <InsightCard
                                title="Remaining Inventory"
                                value={
                                    dashboard.remainingInventory
                                }
                                icon={Boxes}
                            />

                            <InsightCard
                                title="Inventory Value"
                                value={formatCurrency(
                                    dashboard.remainingInventoryValue
                                )}
                                icon={IndianRupee}
                            />

                            <InsightCard
                                title="Low Stock Alerts"
                                value="12"
                                icon={ShieldAlert}
                            />

                        </div>

                    </CardContent>

                </Card>

                {/* Customer */}
                <Card className="bg-zinc-900 border-zinc-800 rounded-3xl">

                    <CardContent className="p-6">

                        <div className="flex items-center justify-between mb-8">

                            <div>

                                <h2 className="text-2xl font-bold">
                                    Customer Intelligence
                                </h2>

                                <p className="text-zinc-400 mt-1">
                                    Customer engagement analytics
                                </p>

                            </div>

                            <Users className="text-fuchsia-400" />

                        </div>

                        <div className="space-y-5">

                            <InsightCard
                                title="Repeat Customers"
                                value="38%"
                                icon={Users}
                            />

                            <InsightCard
                                title="Avg Customer Spend"
                                value="₹2,420"
                                icon={IndianRupee}
                            />

                            <InsightCard
                                title="Customer Retention"
                                value="74%"
                                icon={TrendingUp}
                            />

                        </div>

                    </CardContent>

                </Card>

            </div>

            {/* ======================================
            RECENT SALES
            ====================================== */}

            <RecentSellingProducts
                sales={
                    dashboard.recentSales
                }
            />

            {/* ======================================
            AI BUSINESS INSIGHTS
            ====================================== */}

            <BusinessInsights
                insights={
                    dashboard.insights
                }
            />

        </div>
    );
}

// ======================================
// ORDER METRIC
// ======================================

const OrderMetric = ({
    title,
    value,
    color,
    icon: Icon,
}) => {

    return (

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">

            <div className="flex items-center justify-between mb-4">

                <div>

                    <p className="text-zinc-400 text-sm">
                        {title}
                    </p>

                    <h3 className="text-3xl font-black mt-2">
                        {value}
                    </h3>

                </div>

                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">

                    <Icon size={20} />

                </div>

            </div>

            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">

                <div
                    className={`h-full ${color}`}
                    style={{
                        width: `${Math.min(
                            value,
                            100
                        )}%`,
                    }}
                />

            </div>

        </div>
    );
};

// ======================================
// INSIGHT CARD
// ======================================

const InsightCard = ({
    title,
    value,
    icon: Icon,
}) => {

    return (

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">

            <div>

                <p className="text-zinc-400 text-sm">
                    {title}
                </p>

                <h3 className="text-3xl font-black mt-2">
                    {value}
                </h3>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">

                <Icon
                    size={24}
                    className="text-violet-400"
                />

            </div>

        </div>
    );
};