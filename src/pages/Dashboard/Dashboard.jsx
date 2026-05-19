import { Card, CardContent } from "@/components/ui/card";

import { signOut } from "firebase/auth";

import { auth } from "@/firebase/config";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

import {
  Users,
  Store,
  Package,
  ShoppingCart,
  IndianRupee,
  LogOut,
} from "lucide-react";


export default function Dashboard() {

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

    <div className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-6">
              SellerOS Dashboard
            </h1>
            <Button onClick={() => navigate("/seller")} >
              Seller Options
            </Button>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <h2 className="text-zinc-400">Total Orders</h2>
            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <h2 className="text-zinc-400">Revenue</h2>
            <p className="text-3xl font-bold mt-2">₹0</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <h2 className="text-zinc-400">Products</h2>
            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>

      </div>

    </div >
  );
}