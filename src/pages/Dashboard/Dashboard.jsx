import { Card, CardContent } from "@/components/ui/card";

import { signOut } from "firebase/auth";

import { auth } from "@/firebase/config";

import { Button } from "@/components/ui/button";


export default function Dashboard() {
  const handleLogout = async () => {
    await signOut(auth);
  };
  return (

    <div className="min-h-screen bg-zinc-950 p-6 text-white">

      <h1 className="text-4xl font-bold mb-6">
        SellerOS Dashboard
      </h1>

      <Button onClick={handleLogout}>
        Logout
      </Button>

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

    </div>
  );
}