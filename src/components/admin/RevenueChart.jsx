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
} from "recharts";

export default function RevenueChart() {

  const data = [
    { name: "Mon", revenue: 4000 },
    { name: "Tue", revenue: 6200 },
    { name: "Wed", revenue: 5200 },
    { name: "Thu", revenue: 9000 },
    { name: "Fri", revenue: 7600 },
    { name: "Sat", revenue: 11000 },
    { name: "Sun", revenue: 15000 },
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Revenue Intelligence
          </h2>

          <p className="text-zinc-400 mt-1">
            Weekly marketplace revenue trend
          </p>

        </div>

        <div className="h-[320px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart data={data}>

              <XAxis dataKey="name" />

              <Tooltip />

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