import { Outlet, NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  BarChart3,
  Settings,
} from "lucide-react";

export default function AdminLayout() {

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
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-6">

        <div className="mb-10">

          <h1 className="text-2xl font-bold">
            SellerOS
          </h1>

          <p className="text-zinc-400 text-sm mt-1">
            Admin Panel
          </p>

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
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "hover:bg-zinc-800 text-zinc-300"
                  }`
                }
              >
                <Icon size={18} />

                <span>
                  {item.name}
                </span>

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