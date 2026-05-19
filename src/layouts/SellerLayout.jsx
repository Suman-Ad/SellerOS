import { Outlet, NavLink } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { signOut } from "firebase/auth";

import { auth } from "@/firebase/config";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";


import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  BarChart3,
  Users,
  Store,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function SellerLayout() {
  const { userData } = useAuth();

  const navigate = useNavigate();

  const [collapsed,
    setCollapsed] =
    useState(true);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/seller",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/seller/products",
      icon: Package,
    },
    {
      name: "Inventory",
      path: "/seller/inventory",
      icon: Boxes,
    },
    {
      name: "Orders",
      path: "/seller/orders",
      icon: ShoppingCart,
    },
    {
      name: "Analytics",
      path: "/seller/analytics",
      icon: BarChart3,
    },
    {
      name: "Staff",
      path: "/seller/staff",
      icon: Users,
    },
    {
      name: "Marketplaces",
      path: "/seller/marketplaces",
      icon: Store,
    },
    {
      name: "Settings",
      path: "/seller/settings",
      icon: Settings,
    },
  ];

  

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`

        bg-zinc-900
        border-r
        border-zinc-800
        p-4
        transition-all
        duration-300
        flex
        flex-col

        ${collapsed
            ? "w-20"
            : "w-72"
          }
    `}
      >


        <div className="mb-8">

          <div className="flex items-center justify-between">

            {!collapsed && (

              <div>

                <h1 className="text-2xl font-bold">

                  SellerOS

                </h1>

                <p className="text-zinc-400 text-sm mt-1">

                  Seller Panel

                </p>

              </div>
            )}

            <button
              onClick={() =>
                setCollapsed(
                  !collapsed
                )
              }

              className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
            >

              {collapsed

                ? <PanelLeftOpen size={18} />

                : <PanelLeftClose size={18} />
              }

            </button>

          </div>

        </div>

        <nav className="space-y-2">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/seller"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? "bg-violet-600 text-white"
                    : "hover:bg-zinc-800 text-zinc-300"
                  }`
                }
              >
                <Icon size={18} />

                {!collapsed && (

                  <span>
                    {item.name}
                  </span>
                )}

              </NavLink>
            );
          })}

        </nav>

      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">

        <Outlet />

      </main>

    </div>
  );
}