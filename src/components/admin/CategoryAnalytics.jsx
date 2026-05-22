// src/components/admin/CategoryAnalytics.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function CategoryAnalytics({
  analytics,
}) {

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Category Performance
          </h2>

          <p className="text-zinc-400 mt-1">
            Sales by product category
          </p>

        </div>

        <div className="space-y-5">

          {analytics.categoryAnalytics.map(
            (category) => (

              <div
                key={category.name}
              >

                <div className="flex justify-between mb-2">

                  <span className="text-zinc-300">
                    {category.name}
                  </span>

                  <span className="text-white font-semibold">
                    ₹
                    {category.sales.toLocaleString()}
                  </span>

                </div>

                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">

                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{
                      width: `${
                        category.sales /
                        5000
                      }%`,
                    }}
                  />

                </div>

              </div>
            )
          )}
        </div>

      </CardContent>

    </Card>
  );
}