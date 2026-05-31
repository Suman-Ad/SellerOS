// src/components/admin/RevenueChart.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({
  analytics,
}) {

  const data =
    analytics?.revenueTrend ||
    [];

  if (!data.length) {

    return (

      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-10 text-center">

          <h2 className="text-xl font-bold text-white">
            Revenue Intelligence
          </h2>

          <p className="text-zinc-500 mt-4">
            No payment history available yet.
          </p>

        </CardContent>

      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            SellerOS Revenue Intelligence
          </h2>

          <p className="text-zinc-400 mt-1">
            Subscription revenue collected from Razorpay payments
          </p>

        </div>

        <div className="h-[320px]">



          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.15}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: "#a1a1aa",
                }}
              />

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.2}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </CardContent>

    </Card>
  );
}