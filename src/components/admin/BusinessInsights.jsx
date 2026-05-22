// src/components/admin/BusinessInsights.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function BusinessInsights() {

  const insights = [
    "Revenue increased 18% this week",

    "Electronics category leading marketplace growth",

    "Delivery success rate improved to 94%",

    "Top seller generated ₹4.2L this month",

    "Low inventory alerts rising across 12 SKUs",
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Business Intelligence
          </h2>

          <p className="text-zinc-400 mt-1">
            AI-driven marketplace insights
          </p>

        </div>

        <div className="space-y-4">

          {insights.map((insight) => (

            <div
              key={insight}
              className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20"
            >

              <p className="text-violet-300">
                {insight}
              </p>

            </div>
          ))}
        </div>

      </CardContent>

    </Card>
  );
}