// src/components/admin/KPIGrid.jsx

import {
  Users,
  CreditCard,
  IndianRupee,
  BadgeCheck,
  Package,
  ShoppingCart,
  Crown,
  TrendingUp,
} from "lucide-react";

import KPICard from "./KPICard";

export default function KPIGrid({
  analytics,
}) {
  const cards = [

    {
      title: "Total Users",
      value:
        analytics.totalUsers || 0,

      subtitle:
        "Platform users",

      icon: Users,

      color:
        "bg-blue-500",
    },

    {
      title:
        "Approved Sellers",

      value:
        analytics.approvedSellers || 0,

      subtitle:
        `${analytics.pendingSellers || 0} pending`,

      icon:
        BadgeCheck,

      color:
        "bg-emerald-500",
    },

    {
      title:
        "Active Subscriptions",

      value:
        analytics.activeSubscriptions || 0,

      subtitle:
        "Paying customers",

      icon:
        Crown,

      color:
        "bg-violet-500",
    },

    {
      title:
        "Paid Transactions",

      value:
        analytics.paidTransactions || 0,

      subtitle:
        "Verified payments",

      icon:
        CreditCard,

      color:
        "bg-cyan-500",
    },

    {
      title:
        "SellerOS Revenue",

      value:
        `₹${(
          analytics.saasRevenue || 0
        ).toLocaleString()}`,

      subtitle:
        "Lifetime SaaS revenue",

      icon:
        IndianRupee,

      color:
        "bg-green-500",
    },

    {
      title:
        "Monthly Revenue",

      value:
        `₹${(
          analytics.monthlySaasRevenue || 0
        ).toLocaleString()}`,

      subtitle:
        "Current month",

      icon:
        TrendingUp,

      color:
        "bg-orange-500",
    },

    {
      title:
        "Products",

      value:
        analytics.totalProducts || 0,

      subtitle:
        "Marketplace listings",

      icon:
        Package,

      color:
        "bg-pink-500",
    },

    {
      title:
        "Orders",

      value:
        analytics.totalOrders || 0,

      subtitle:
        `${analytics.pendingOrders || 0} pending`,

      icon:
        ShoppingCart,

      color:
        "bg-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <KPICard
          key={card.title}
          {...card}
        />
      ))}
    </div>
  );
}