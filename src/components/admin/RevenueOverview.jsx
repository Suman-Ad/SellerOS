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
      title: "Monthly Revenue",
      value: `₹${(analytics.monthlyRevenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: "bg-green-500",
    },

    {
      title: "Weekly Revenue",
      value: `₹${(analytics.weeklyRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-blue-500",
    },

    {
      title: "Average Order Value",
      value: `₹${(analytics.avgOrderValue || 0).toLocaleString()}`,
      icon: Wallet,
      color: "bg-violet-500",
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