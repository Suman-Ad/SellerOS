import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Package,
  ShoppingCart,
  IndianRupee,
  Boxes,
} from "lucide-react";

export default function SellerDashboard() {

  const { userData } = useAuth();

  const cards = [
    {
      title: "Products",
      value: 0,
      icon: Package,
    },
    {
      title: "Orders",
      value: 0,
      icon: ShoppingCart,
    },
    {
      title: "Inventory",
      value: 0,
      icon: Boxes,
    },
    {
      title: "Revenue",
      value: "₹0",
      icon: IndianRupee,
    },
  ];

  return (
    <div>

      {/* Header */}
      <div className="mb-6">

        <h1 className="text-3xl font-bold">
          Seller Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">

          Welcome back,{" "}
          {userData?.fullName}

        </p>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {cards.map((card) => {

          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="bg-zinc-900 border-zinc-800"
            >

              <CardContent className="p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-zinc-400 text-sm">
                      {card.title}
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                      {card.value}
                    </h2>

                  </div>

                  <div className="bg-violet-500/10 p-3 rounded-xl">

                    <Icon className="text-violet-500" />

                  </div>

                </div>

              </CardContent>

            </Card>
          );
        })}

      </div>

    </div>
  );
}