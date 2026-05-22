// src/components/admin/analyticsService.js

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export async function getAdminAnalytics() {
  try {
    const usersSnap = await getDocs(
      collection(db, "users")
    );

    const productsSnap = await getDocs(
      collection(db, "products")
    );

    const ordersSnap = await getDocs(
      collection(db, "orders")
    );

    // Sellers
    const sellersQuery = query(
      collection(db, "users"),
      where("role", "==", "seller")
    );

    const sellersSnap = await getDocs(
      sellersQuery
    );

    const pendingSellerQuery = query(
      collection(db, "users"),
      where("role", "==", "seller"),
      where("isApproved", "==", false)
    );

    const pendingSellerSnap =
      await getDocs(
        pendingSellerQuery
      );

    // Approved Sellers
    const approvedQuery = query(
      collection(db, "users"),
      where("isApproved", "==", true)
    );

    const approvedSnap = await getDocs(
      approvedQuery
    );

    const now = new Date();

    let revenue = 0;

    let monthlyRevenue = 0;
    let weeklyRevenue = 0;

    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let pendingOrders = 0;

    ordersSnap.forEach((doc) => {

      const order = doc.data();

      revenue += order.totalAmount || 0;

      const orderDate =
        order.createdAt?.toDate?.() ||
        new Date();

      const diffDays =
        (now - orderDate) /
        (1000 * 60 * 60 * 24);

      if (diffDays <= 30) {
        monthlyRevenue +=
          order.totalAmount || 0;
      }

      if (diffDays <= 7) {
        weeklyRevenue +=
          order.totalAmount || 0;
      }

      switch (order.status) {

        case "delivered":
          deliveredOrders++;
          break;

        case "cancelled":
          cancelledOrders++;
          break;

        default:
          pendingOrders++;
      }
    });

    const totalOrders = ordersSnap.size;

    const avgOrderValue =
      totalOrders > 0
        ? revenue / totalOrders
        : 0;

    const deliverySuccessRate =
      totalOrders > 0
        ? (
          (deliveredOrders /
            totalOrders) *
          100
        ).toFixed(1)
        : 0;

    const platformCommission =
      revenue * 0.1;

    // monthlyRevenue =
    //   monthlyRevenue || 0;

    // weeklyRevenue =
    //   weeklyRevenue || 0;

    // avgOrderValue =
    //   avgOrderValue || 0;

    const revenueTrend = [
      { name: "Mon", revenue: 4200 },
      { name: "Tue", revenue: 6100 },
      { name: "Wed", revenue: 5200 },
      { name: "Thu", revenue: 8700 },
      { name: "Fri", revenue: 9600 },
      { name: "Sat", revenue: 12200 },
      { name: "Sun", revenue: 15400 },
    ];

    const orderStatusData = [
      {
        name: "Delivered",
        value: deliveredOrders,
      },

      {
        name: "Pending",
        value: pendingOrders,
      },

      {
        name: "Cancelled",
        value: cancelledOrders,
      },
    ];

    const categoryAnalytics = [
      {
        name: "Electronics",
        sales: 420000,
      },

      {
        name: "Fashion",
        sales: 315000,
      },

      {
        name: "Groceries",
        sales: 180000,
      },

      {
        name: "Beauty",
        sales: 95000,
      },
    ];

    return {
      totalUsers: usersSnap.size,
      totalSellers: sellersSnap.size,
      approvedSellers: approvedSnap.size,
      totalProducts: productsSnap.size,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      pendingOrders,
      revenue,
      avgOrderValue,
      deliverySuccessRate,
      platformCommission,
      pendingSellers:
        pendingSellerSnap.size,
      monthlyRevenue,
      weeklyRevenue,
      revenueTrend,
      orderStatusData,
      categoryAnalytics,
    };
  } catch (error) {
    console.error(error);

    return null;
  }
}