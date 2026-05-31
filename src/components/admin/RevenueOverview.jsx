// src/components/admin/RevenueOverview.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  IndianRupee,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function RevenueOverview({
  analytics,
}) {

  const cards = [

    {
      title: "Monthly SaaS Revenue",

      value:
        `₹${(
          analytics.monthlySaasRevenue || 0
        ).toLocaleString()}`,

      icon:
        IndianRupee,

      color:
        "bg-green-500",

      subtitle:
        "Current month subscription revenue",
    },

    {
      title: "Total SaaS Revenue",

      value:
        `₹${(
          analytics.saasRevenue || 0
        ).toLocaleString()}`,

      icon:
        TrendingUp,

      color:
        "bg-blue-500",

      subtitle:
        "Lifetime subscription revenue",
    },

    {
      title: "Paid Transactions",

      value:
        (
          analytics.paidTransactions || 0
        ).toLocaleString(),

      icon:
        Wallet,

      color:
        "bg-violet-500",

      subtitle:
        "Verified Razorpay payments",
    },

  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {cards.map((card) => {

        const Icon = card.icon;

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

                  <h2 className="text-3xl font-bold mt-3 text-white">
                    {card.value}
                  </h2>

                  <p className="text-xs text-zinc-500 mt-2">
                    {card.subtitle}
                  </p>

                </div>

                <div
                  className={`p-4 rounded-2xl ${card.color}`}
                >
                  <Icon className="text-white" />
                </div>

              </div>

            </CardContent>

          </Card>
        );
      })}
    </div>
  );
}