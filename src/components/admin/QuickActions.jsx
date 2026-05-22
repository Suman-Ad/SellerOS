// src/components/admin/QuickActions.jsx

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Users,
  Store,
  Package,
  FileBarChart,
  ShieldAlert,
  Truck,
} from "lucide-react";

export default function QuickActions() {

  const actions = [
    {
      title: "Approve Sellers",
      icon: Store,
    },

    {
      title: "Manage Users",
      icon: Users,
    },

    {
      title: "Products",
      icon: Package,
    },

    {
      title: "Shipment Center",
      icon: Truck,
    },

    {
      title: "Risk Center",
      icon: ShieldAlert,
    },

    {
      title: "Export Reports",
      icon: FileBarChart,
    },
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">

      <CardContent className="p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Quick Actions
          </h2>

          <p className="text-zinc-400 mt-1">
            Marketplace control shortcuts
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4">

          {actions.map((action) => {

            const Icon = action.icon;

            return (
              <button
                key={action.title}
                className="p-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition-all duration-300 text-left"
              >

                <Icon className="text-violet-500 mb-4" />

                <h3 className="text-white font-medium">
                  {action.title}
                </h3>

              </button>
            );
          })}
        </div>

      </CardContent>

    </Card>
  );
}