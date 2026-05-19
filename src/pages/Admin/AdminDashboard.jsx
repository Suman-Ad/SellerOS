import { useAuth } from "@/context/AuthContext";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Users,
  Store,
  Package,
  ShoppingCart,
  IndianRupee,
} from "lucide-react";

import { signOut } from "firebase/auth";

import { auth } from "@/firebase/config";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";


export default function AdminDashboard() {

  const { userData } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {

    try {

      await signOut(auth);

      toast.success("Logged out");

      navigate("/login");

    } catch (error) {

      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              SellerOS Admin
            </h1>

            <p className="text-zinc-400 text-sm mt-1">
              Welcome back,{" "}
              {userData?.fullName}
            </p>

          </div>

        </div>

      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto p-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Total Sellers */}
          <Card className="bg-zinc-900 border-zinc-800">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-zinc-400 text-sm">
                    Total Sellers
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    0
                  </h2>

                </div>

                <div className="bg-violet-500/10 p-3 rounded-xl">

                  <Store className="text-violet-500" />

                </div>

              </div>

            </CardContent>

          </Card>

          {/* Total Staff */}
          <Card className="bg-zinc-900 border-zinc-800">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-zinc-400 text-sm">
                    Staff Members
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    0
                  </h2>

                </div>

                <div className="bg-blue-500/10 p-3 rounded-xl">

                  <Users className="text-blue-500" />

                </div>

              </div>

            </CardContent>

          </Card>

          {/* Products */}
          <Card className="bg-zinc-900 border-zinc-800">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-zinc-400 text-sm">
                    Products
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    0
                  </h2>

                </div>

                <div className="bg-emerald-500/10 p-3 rounded-xl">

                  <Package className="text-emerald-500" />

                </div>

              </div>

            </CardContent>

          </Card>

          {/* Orders */}
          <Card className="bg-zinc-900 border-zinc-800">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-zinc-400 text-sm">
                    Orders
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    0
                  </h2>

                </div>

                <div className="bg-orange-500/10 p-3 rounded-xl">

                  <ShoppingCart className="text-orange-500" />

                </div>

              </div>

            </CardContent>

          </Card>

        </div>

        {/* Revenue Card */}
        <div className="mt-6">

          <Card className="bg-zinc-900 border-zinc-800">

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-zinc-400 text-sm">
                    Total Revenue
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    ₹0
                  </h2>

                </div>

                <div className="bg-green-500/10 p-4 rounded-2xl">

                  <IndianRupee className="text-green-500" size={32} />

                </div>

              </div>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  );
}