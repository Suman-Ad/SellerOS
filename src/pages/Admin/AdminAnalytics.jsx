import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  useEffect,
  useState,
} from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Users,
  Store,
  Package,
  ShoppingCart,
  IndianRupee,
  BadgeCheck,
} from "lucide-react";

export default function AdminAnalytics() {

  const [stats, setStats] =
    useState({
      totalUsers: 0,
      totalSellers: 0,
      approvedSellers: 0,
      totalProducts: 0,
      totalOrders: 0,
      revenue: 0,
    });

  const fetchAnalytics =
    async () => {

      try {

        // Users
        const usersSnap =
          await getDocs(
            collection(db, "users")
          );

        // Sellers
        const sellersQuery = query(
          collection(db, "users"),
          where("role", "==", "seller")
        );

        const sellersSnap =
          await getDocs(
            sellersQuery
          );

        // Approved sellers
        const approvedQuery = query(
          collection(db, "users"),
          where(
            "isApproved",
            "==",
            true
          )
        );

        const approvedSnap =
          await getDocs(
            approvedQuery
          );

        // Products
        const productsSnap =
          await getDocs(
            collection(
              db,
              "products"
            )
          );

        // Orders
        const ordersSnap =
          await getDocs(
            collection(db, "orders")
          );

        // Revenue
        let revenue = 0;

        ordersSnap.forEach((doc) => {

          const order =
            doc.data();

          revenue +=
            order.totalAmount || 0;
        });

        setStats({
          totalUsers:
            usersSnap.size,

          totalSellers:
            sellersSnap.size,

          approvedSellers:
            approvedSnap.size,

          totalProducts:
            productsSnap.size,

          totalOrders:
            ordersSnap.size,

          revenue,
        });

      } catch (error) {

        console.error(error);
      }
    };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const cards = [
    {
      title: "Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Sellers",
      value: stats.totalSellers,
      icon: Store,
    },
    {
      title: "Approved Sellers",
      value:
        stats.approvedSellers,
      icon: BadgeCheck,
    },
    {
      title: "Products",
      value:
        stats.totalProducts,
      icon: Package,
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div>

      <div className="mb-6">

        <h1 className="text-3xl font-bold">
          Analytics
        </h1>

        <p className="text-zinc-400 mt-2">
          SellerOS business overview
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {cards.map((card) => {

          const Icon =
            card.icon;

          return (
            <Card
              key={card.title}
              className="bg-zinc-900 border-zinc-800"
            >

              <CardContent className="p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-zinc-400 text-sm">
                      {card.title}
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                      {card.value}
                    </h2>

                  </div>

                  <div className="bg-violet-500/10 p-3 rounded-xl">

                    <Icon className="text-violet-500" />

                  </div>

                </div>

              </CardContent>

            </Card>
          );
        })}

      </div>

    </div>
  );
}