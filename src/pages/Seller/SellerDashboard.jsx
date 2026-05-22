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
} from "lucide-react";

// ====================================
// FORMAT CURRENCY
// ====================================

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

// ====================================
// PAGE
// ====================================

export default function SellerDashboard() {

  const { user } =
    useAuth();

  const [loading,
    setLoading] =
    useState(true);

  const [dashboard,
    setDashboard] =
    useState(null);

  // ====================================
  // LOAD DASHBOARD
  // ====================================

  useEffect(() => {

    if (!user) return;

    loadDashboard();

  }, [user]);

  const loadDashboard =
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

  // ====================================
  // LOADING
  // ====================================

  if (loading) {

    return (

      <div className="p-6">

        <div className="text-lg font-semibold">

          Loading Dashboard...

        </div>

      </div>
    );
  }

  // ====================================
  // KPI CARDS
  // ====================================

  const cards = [

    {
      title:
        "Total Revenue",

      value:
        formatCurrency(
          dashboard.totalRevenue
        ),

      icon:
        IndianRupee,
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
    },

    {
      title:
        "Inventory Value",

      value:
        formatCurrency(
          dashboard.remainingInventoryValue
        ),

      icon:
        Boxes,
    },

    {
      title:
        "Expected Profit",

      value:
        formatCurrency(
          dashboard.expectedProfit
        ),

      icon:
        Package,
    },

    {
      title:
        "Total Orders",

      value:
        dashboard.totalOrders,

      icon:
        ShoppingCart,
    },

    {
      title:
        "Total Products",

      value:
        dashboard.totalProducts,

      icon:
        Package,
    },

    {
      title:
        "Remaining Qty",

      value:
        dashboard.remainingInventory,

      icon:
        Boxes,
    },

    {
      title:
        "Total Sold Qty",

      value:
        dashboard.totalSoldQty,

      icon:
        TrendingUp,
    },
  ];

  return (

    <div className="p-4 md:p-6 space-y-6 bg-zinc-950 min-h-screen text-white">

      {/* ====================================
            HEADER
            ==================================== */}

      <div>

        <h1 className="text-3xl font-bold">

          Seller Dashboard

        </h1>

        <p className="text-zinc-400 mt-1">

          Business analytics overview

        </p>

      </div>

      {/* ====================================
            KPI CARDS
            ==================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {cards.map((card) => {

          const Icon =
            card.icon;

          return (

            <Card
              key={card.title}
              className="bg-zinc-900 border-zinc-800 rounded-3xl"
            >

              <CardContent className="p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="text-sm text-zinc-400">

                      {card.title}

                    </div>

                    <div className="text-3xl font-bold mt-3">

                      {card.value}

                    </div>

                  </div>

                  <div className="bg-violet-500/10 p-4 rounded-2xl">

                    <Icon
                      className="text-violet-400"
                      size={24}
                    />

                  </div>

                </div>

              </CardContent>

            </Card>
          );
        })}

      </div>

      {/* ====================================
            ORDER STATUS
            ==================================== */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        <StatusCard
          title="Delivered"
          value={
            dashboard
              .orderStatusCounts
              .Delivered
          }
          icon={
            Truck
          }
          color="green"
        />

        <StatusCard
          title="Pending"
          value={
            dashboard
              .orderStatusCounts
              .Pending
          }
          icon={
            Clock3
          }
          color="yellow"
        />

        <StatusCard
          title="Cancelled"
          value={
            dashboard
              .orderStatusCounts
              .Cancelled
          }
          icon={
            AlertTriangle
          }
          color="red"
        />

        <StatusCard
          title="RTO"
          value={
            dashboard
              .orderStatusCounts
              .RTO
          }
          icon={
            RotateCcw
          }
          color="orange"
        />

        <StatusCard
          title="Shipped"
          value={
            dashboard
              .orderStatusCounts
              .Shipped
          }
          icon={
            Truck
          }
          color="blue"
        />

      </div>

      {/* ====================================
            TOP PRODUCTS
            ==================================== */}

      <Card className="bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden">

        <div className="p-5 border-b border-zinc-800">

          <h2 className="text-xl font-bold">

            Top Product SKU Analytics

          </h2>

          <p className="text-zinc-400 text-sm mt-1">

            Best performing product SKUs

          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead className="bg-zinc-950 border-b border-zinc-800">

              <tr>

                {[
                  "SKU",
                  "Delivered",
                  "Shipped",
                  "Pending",
                  "Cancelled",
                  "RTO",
                  "Total Sold",
                  "Revenue",
                  "Profit",
                ].map((head) => (

                  <th
                    key={head}
                    className="px-4 py-4 text-left text-sm font-semibold text-zinc-300"
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
                ) => (

                  <tr
                    key={index}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50"
                  >

                    <td className="px-4 py-4 font-semibold">

                      {product.sku}

                    </td>

                    <td className="px-4 py-4">

                      {product.delivered}

                    </td>

                    <td className="px-4 py-4">

                      {product.shipped}

                    </td>

                    <td className="px-4 py-4">

                      {product.pending}

                    </td>

                    <td className="px-4 py-4">

                      {product.cancelled}

                    </td>

                    <td className="px-4 py-4">

                      {product.rto}

                    </td>

                    <td className="px-4 py-4 font-semibold">

                      {product.totalSold}

                    </td>

                    <td className="px-4 py-4 text-green-400 font-semibold">

                      {formatCurrency(
                        product.revenue
                      )}

                    </td>

                    <td className="px-4 py-4 text-violet-400 font-semibold">

                      {formatCurrency(
                        product.profit
                      )}

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>



      </Card>
      {/* <RevenueAnalyticsChart
        data={
          dashboard.revenueAnalytics
        }
      />

      <RecentSellingProducts
        sales={
          dashboard.recentSales
        }
      />

      <BusinessInsights
        insights={
          dashboard.insights
        }
      /> */}
    </div>
  );
}

// ====================================
// STATUS CARD
// ====================================

const StatusCard = ({
  title,
  value,
  icon: Icon,
  color,
}) => {

  return (

    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">

      <CardContent className="p-5">

        <div className="flex items-center justify-between">

          <div>

            <div className="text-sm text-zinc-400">

              {title}

            </div>

            <div className="text-3xl font-bold mt-2">

              {value}

            </div>

          </div>

          <div className="p-3 rounded-2xl bg-zinc-800">

            <Icon size={22} />

          </div>

        </div>

      </CardContent>

    </Card>
  );
};