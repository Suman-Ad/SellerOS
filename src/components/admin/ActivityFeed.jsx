// src/components/admin/ActivityFeed.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  ShoppingCart,
  Store,
  Package,
  IndianRupee,
} from "lucide-react";

export default function ActivityFeed() {

  const activities = [
    {
      icon: ShoppingCart,
      title: "New order placed",
      description:
        "Order #SO-1024 received",
      time: "2 min ago",
      color: "text-orange-500",
    },

    {
      icon: Store,
      title: "Seller approved",
      description:
        "Tech Store verified",
      time: "12 min ago",
      color: "text-green-500",
    },

    {
      icon: Package,
      title: "Inventory alert",
      description:
        "12 products low stock",
      time: "26 min ago",
      color: "text-yellow-500",
    },

    {
      icon: IndianRupee,
      title: "Large transaction",
      description:
        "₹54,000 revenue generated",
      time: "1 hour ago",
      color: "text-violet-500",
    },
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Live Activity Feed
          </h2>

          <p className="text-zinc-400 mt-1">
            Real-time marketplace operations
          </p>

        </div>

        <div className="space-y-5">

          {activities.map(
            (activity, index) => {

              const Icon =
                activity.icon;

              return (
                <div
                  key={index}
                  className="flex items-start gap-4"
                >

                  <div className="p-3 rounded-xl bg-zinc-800">

                    <Icon
                      className={
                        activity.color
                      }
                    />

                  </div>

                  <div className="flex-1">

                    <div className="flex items-center justify-between">

                      <h3 className="font-semibold text-white">
                        {activity.title}
                      </h3>

                      <span className="text-xs text-zinc-500">
                        {activity.time}
                      </span>

                    </div>

                    <p className="text-zinc-400 text-sm mt-1">
                      {
                        activity.description
                      }
                    </p>

                  </div>

                </div>
              );
            }
          )}
        </div>

      </CardContent>

    </Card>
  );
}