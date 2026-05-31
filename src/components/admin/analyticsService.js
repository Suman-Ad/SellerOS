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

    const paymentSnap =
      await getDocs(
        collection(
          db,
          "paymentHistory"
        )
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

    let saasRevenue = 0;

    let monthlySaasRevenue = 0;

    let paidTransactions = 0;

    let activeSubscriptions = 0;

    let recentPayments = [];

    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let pendingOrders = 0;

    usersSnap.forEach((doc) => {

      const user =
        doc.data();

      if (
        user.subscription
          ?.isActive === true
      ) {

        activeSubscriptions++;
      }
    });

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

    paymentSnap.forEach((doc) => {

      const payment =
        doc.data();

      if (
        payment.status ===
        "paid" &&
        payment.verified ===
        true
      ) {

        const amount =
          Number(
            payment.total || 0
          );

        saasRevenue += amount;

        paidTransactions++;

        const paymentDate =
          payment.createdAt
            ?.toDate?.();

        if (
          paymentDate &&
          paymentDate.getMonth() ===
          now.getMonth() &&
          paymentDate.getFullYear() ===
          now.getFullYear()
        ) {

          monthlySaasRevenue +=
            amount;
        }
      }

      recentPayments.push({

        id: doc.id,

        ...payment,
      });
    });

    recentPayments.sort(
      (a, b) => {

        const aTime =
          a.createdAt
            ?.seconds || 0;

        const bTime =
          b.createdAt
            ?.seconds || 0;

        return bTime - aTime;
      }
    );

    recentPayments =
      recentPayments.slice(
        0,
        10
      );

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

    const revenueTrend = [];

    for (
      let i = 6;
      i >= 0;
      i--
    ) {

      const date =
        new Date();

      date.setDate(
        date.getDate() - i
      );

      const label =
        date.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
          }
        );

      let dayRevenue = 0;

      paymentSnap.forEach(
        (doc) => {

          const payment =
            doc.data();

          const created =
            payment.createdAt
              ?.toDate?.();

          if (
            payment.status ===
            "paid" &&
            payment.verified &&
            created &&
            created.toDateString() ===
            date.toDateString()
          ) {

            dayRevenue +=
              Number(
                payment.total || 0
              );
          }
        }
      );

      revenueTrend.push({
        name: label,
        revenue: dayRevenue,
      });
    }

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
      saasRevenue,
      monthlySaasRevenue,

      activeSubscriptions,

      paidTransactions,

      recentPayments,
    };
  } catch (error) {
    console.error(error);

    return null;
  }
}