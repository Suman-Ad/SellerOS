// src/components/admin/SystemStatus.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function SystemStatus() {

  const systems = [
    {
      name: "Payments",
      status: "Operational",
      color: "bg-green-500",
    },

    {
      name: "Orders",
      status: "Healthy",
      color: "bg-green-500",
    },

    {
      name: "Shipments",
      status: "Minor Delays",
      color: "bg-yellow-500",
    },

    {
      name: "Notifications",
      status: "Operational",
      color: "bg-green-500",
    },
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            System Status
          </h2>

          <p className="text-zinc-400 mt-1">
            Platform infrastructure health
          </p>

        </div>

        <div className="space-y-4">

          {systems.map((system) => (

            <div
              key={system.name}
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50"
            >

              <div className="flex items-center gap-3">

                <div
                  className={`w-3 h-3 rounded-full ${system.color}`}
                />

                <span className="text-white">
                  {system.name}
                </span>

              </div>

              <span className="text-zinc-400 text-sm">
                {system.status}
              </span>

            </div>
          ))}
        </div>

      </CardContent>

    </Card>
  );
}