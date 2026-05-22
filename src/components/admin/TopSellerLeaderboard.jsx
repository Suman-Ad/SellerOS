// src/components/admin/TopSellerLeaderboard.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function TopSellerLeaderboard() {

  const sellers = [
    {
      name: "Tech Store",
      revenue: "₹4.2L",
      orders: 420,
    },

    {
      name: "Fashion Hub",
      revenue: "₹3.8L",
      orders: 368,
    },

    {
      name: "Mobile Planet",
      revenue: "₹2.9L",
      orders: 301,
    },
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Top Sellers
          </h2>

          <p className="text-zinc-400 mt-1">
            Revenue performance leaderboard
          </p>

        </div>

        <div className="space-y-4">

          {sellers.map(
            (seller, index) => (
              <div
                key={seller.name}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50"
              >

                <div>

                  <h3 className="font-semibold text-white">
                    #{index + 1}{" "}
                    {seller.name}
                  </h3>

                  <p className="text-zinc-500 text-sm">
                    {seller.orders} orders
                  </p>

                </div>

                <div className="text-right">

                  <p className="font-bold text-green-500">
                    {seller.revenue}
                  </p>

                </div>

              </div>
            )
          )}
        </div>

      </CardContent>

    </Card>
  );
}