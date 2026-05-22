// src/components/admin/RiskAlerts.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  AlertTriangle,
} from "lucide-react";

export default function RiskAlerts() {

  const alerts = [
    "High cancellation rate detected",
    "2 sellers pending verification",
    "Low inventory products increasing",
    "Delivery delays rising this week",
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="flex items-center gap-3 mb-6">

          <AlertTriangle className="text-red-500" />

          <div>

            <h2 className="text-2xl font-bold text-white">
              Risk Alerts
            </h2>

            <p className="text-zinc-400 text-sm">
              Operational monitoring
            </p>

          </div>

        </div>

        <div className="space-y-3">

          {alerts.map((alert) => (

            <div
              key={alert}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >

              <p className="text-red-300">
                {alert}
              </p>

            </div>
          ))}
        </div>

      </CardContent>

    </Card>
  );
}