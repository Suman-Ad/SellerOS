// src/components/admin/SellerApprovalQueue.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  BadgeCheck,
  Clock3,
  ShieldAlert,
} from "lucide-react";

export default function SellerApprovalQueue({
  analytics,
}) {

  const items = [
    {
      title: "Approved Sellers",
      value:
        analytics.approvedSellers,
      icon: BadgeCheck,
      color: "text-green-500",
    },

    {
      title: "Pending Approval",
      value:
        analytics.pendingSellers,
      icon: Clock3,
      color: "text-yellow-500",
    },

    {
      title: "Seller Risks",
      value: 0,
      icon: ShieldAlert,
      color: "text-red-500",
    },
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Seller Command Center
          </h2>

          <p className="text-zinc-400 mt-1">
            Marketplace seller operations
          </p>

        </div>

        <div className="space-y-4">

          {items.map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50"
              >

                <div className="flex items-center gap-4">

                  <div className="p-3 rounded-xl bg-zinc-900">

                    <Icon
                      className={item.color}
                    />

                  </div>

                  <div>

                    <p className="text-zinc-300">
                      {item.title}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Live seller metrics
                    </p>

                  </div>

                </div>

                <h3 className="text-2xl font-bold text-white">
                  {item.value}
                </h3>

              </div>
            );
          })}
        </div>

      </CardContent>

    </Card>
  );
}