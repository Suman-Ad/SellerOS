// src/components/admin/KPICard.jsx

import { Card, CardContent } from "@/components/ui/card";

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10">

      <CardContent className="p-6">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-zinc-400 text-sm">
              {title}
            </p>

            <h2 className="text-3xl font-bold mt-2 text-white">
              {value}
            </h2>

            <p className="text-xs text-zinc-500 mt-2">
              {subtitle}
            </p>

          </div>

          <div
            className={`p-3 rounded-2xl ${color}`}
          >
            <Icon className="text-white" />
          </div>

        </div>

      </CardContent>

    </Card>
  );
}