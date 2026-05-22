// src/components/admin/KPIGrid.jsx

import {
  Users,
  Store,
  Package,
  ShoppingCart,
  IndianRupee,
  BadgeCheck,
  Truck,
  AlertTriangle,
} from "lucide-react";

import KPICard from "./KPICard";

export default function KPIGrid({
  analytics,
}) {
  const cards = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      subtitle: "Platform users",
      icon: Users,
      color: "bg-blue-500",
    },

    {
      title: "Approved Sellers",
      value:
        analytics.approvedSellers,
      subtitle: "Verified sellers",
      icon: BadgeCheck,
      color: "bg-emerald-500",
    },

    {
      title: "Products",
      value:
        analytics.totalProducts,
      subtitle: "Marketplace listings",
      icon: Package,
      color: "bg-violet-500",
    },

    {
      title: "Orders",
      value:
        analytics.totalOrders,
      subtitle: `${analytics.pendingOrders} pending`,
      icon: ShoppingCart,
      color: "bg-orange-500",
    },

    {
      title: "Revenue",
      value: `₹${analytics.revenue.toLocaleString()}`,
      subtitle: "Gross marketplace revenue",
      icon: IndianRupee,
      color: "bg-green-500",
    },

    {
      title: "Delivery Success",
      value: `${analytics.deliverySuccessRate}%`,
      subtitle: `${analytics.deliveredOrders} delivered`,
      icon: Truck,
      color: "bg-cyan-500",
    },

    {
      title: "Cancelled Orders",
      value:
        analytics.cancelledOrders,
      subtitle: "Operational risk",
      icon: AlertTriangle,
      color: "bg-red-500",
    },

    {
      title: "Commission",
      value: `₹${analytics.platformCommission.toLocaleString()}`,
      subtitle: "Platform earnings",
      icon: Store,
      color: "bg-pink-500",
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