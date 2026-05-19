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
  HelpCircle,
  Mail,
} from "lucide-react";


export default function SellerLayout() {
  const { userData } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      toast.success("Logged out successfully");

      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

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
            : "w-72 md:w-72"
          }
    `}
      >


        <div className="mb-8">

          <div className="flex items-center justify-between">

            {!collapsed && (

              <div>

                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                  SellerOS
                </h1>

                <p className="text-zinc-400 text-sm mt-1">
                  Smart Commerce ERP
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


        <div className="flex flex-col h-full">

          {/* Menu */}
          <nav className="space-y-2 flex-1">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin" || item.path === "/seller"}
                  className={({ isActive }) =>
                    `flex items-center
            ${collapsed ? "justify-center" : "gap-3"}
            px-4 py-3 rounded-xl transition-all duration-200
            ${isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "hover:bg-zinc-800 text-zinc-300"
                    }`
                  }
                >
                  <Icon size={18} />

                  {!collapsed && (
                    <span className="font-medium">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-zinc-800 pt-4 space-y-2">

            {/* FAQ */}
            <button
              className={`w-full flex items-center
      ${collapsed ? "justify-center" : "gap-3"}
      px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-zinc-300`}
            >
              <HelpCircle size={18} />

              {!collapsed && <span>FAQ</span>}
            </button>

            {/* Contact */}
            <button
              className={`w-full flex items-center
      ${collapsed ? "justify-center" : "gap-3"}
      px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-zinc-300`}
            >
              <Mail size={18} />

              {!collapsed && <span>Contact Us</span>}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center
      ${collapsed ? "justify-center" : "gap-3"}
      px-4 py-3 rounded-xl
      bg-red-500/10
      hover:bg-red-500/20
      text-red-400
      transition`}
            >
              <LogOut size={18} />

              {!collapsed && <span>Logout</span>}
            </button>

            {/* Footer */}
            {!collapsed && (
              <div className="pt-4 text-center text-xs text-zinc-500">
                © 2026 SellerOS
                <br />
                All Rights Reserved
              </div>
            )}

          </div>

        </div>

      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-zinc-950">

        {/* Topbar */}
        <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold">
              Welcome Back 👋
            </h2>

            <p className="text-sm text-zinc-400">
              Manage your business operations efficiently
            </p>
          </div>

          {!collapsed && (
            <div className="text-right">
              <p className="font-medium">
                {userData?.name || "User"}
              </p>

              <p className="text-xs text-zinc-400">
                {userData?.role || "Seller"}
              </p>
            </div>
          )}
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>

      </main>

    </div>
  );
}