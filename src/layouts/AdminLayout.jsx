import { Outlet, NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";


export default function AdminLayout() {

  const [collapsed,
    setCollapsed] =
    useState(true);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Seller Approvals",
      path: "/admin/sellers",
      icon: Store,
    },
    {
      name: "Staff",
      path: "/admin/staff",
      icon: Users,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/admin/settings",
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

                  Admin Panel

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
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center
${collapsed
                    ? "justify-center"
                    : "gap-3"
                  }
px-4 py-3 rounded-xl transition-all ${isActive
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
      <main className="flex-1 p-4 md:p-6 overflow-auto">

        <Outlet />

      </main>

    </div>
  );
}