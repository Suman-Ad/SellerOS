// src/components/admin/OrderStatusChart.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OrderStatusChart({
  analytics,
}) {

  const COLORS = [
    "#22c55e",
    "#eab308",
    "#ef4444",
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Order Status Analytics
          </h2>

          <p className="text-zinc-400 mt-1">
            Marketplace order distribution
          </p>

        </div>

        <div className="h-[320px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={
                  analytics.orderStatusData
                }
                dataKey="value"
                outerRadius={110}
              >

                {analytics.orderStatusData.map(
                  (
                    entry,
                    index
                  ) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </CardContent>

    </Card>
  );
}