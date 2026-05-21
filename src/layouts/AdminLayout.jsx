import { Outlet, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { signOut } from "firebase/auth";

import { auth } from "@/firebase/config";

import { toast } from "sonner";

import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Search,
  LogOut,
  HelpCircle,
  Mail,
  CreditCard,
  ShieldCheck,
  Boxes,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";

import { useState } from "react";

export default function AdminLayout() {

  const { userData } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "New seller registration",
      time: "2 min ago",
    },
    {
      id: 2,
      title: "Inventory alert triggered",
      time: "10 min ago",
    },
    {
      id: 3,
      title: "Subscription payment received",
      time: "1 hour ago",
    },
  ];

  const [collapsed,
    setCollapsed] =
    useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      toast.success("Logged out successfully");

      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const menuSections = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          path: "/admin",
          icon: LayoutDashboard,
        },
        {
          name: "Analytics",
          path: "/admin/analytics",
          icon: BarChart3,
        },
      ],
    },

    {
      title: "Seller Management",
      items: [
        {
          name: "Seller Approvals",
          path: "/admin/sellers",
          icon: ShieldCheck,
        },
        {
          name: "Subscriptions",
          path: "/admin/subscriptions",
          icon: CreditCard,
        },
      ],
    },

    {
      title: "Commerce",
      items: [
        {
          name: "Products",
          path: "/admin/products",
          icon: Package,
        },
        {
          name: "Inventory",
          path: "/admin/inventory",
          icon: Boxes,
        },
        {
          name: "Orders",
          path: "/admin/orders",
          icon: ShoppingCart,
        },
      ],
    },

    {
      title: "Management",
      items: [
        {
          name: "Staff",
          path: "/admin/staff",
          icon: Users,
        },
        {
          name: "Settings",
          path: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="h-screen bg-zinc-950 text-white flex overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`
      bg-zinc-900/95
      backdrop-blur-xl
      border-r
      border-zinc-800
      transition-all
      duration-300
      flex
      flex-col
      ${collapsed ? "w-20" : "w-72"}
    `}
      >

        {/* Logo */}
        <div className="h-20 px-4 border-b border-zinc-800 flex items-center justify-between">

          {!collapsed && (
            <div>

              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                SellerOS
              </h1>

              <p className="text-xs text-zinc-400 mt-1">
                Admin ERP Panel
              </p>

            </div>
          )}

          <button
            onClick={() =>
              setCollapsed(!collapsed)
            }
            className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
          >
            {collapsed
              ? <PanelLeftOpen size={18} />
              : <PanelLeftClose size={18} />}
          </button>

        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4">

          {menuSections.map((section) => (

            <div
              key={section.title}
              className="mb-6"
            >

              {!collapsed && (

                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3 px-3">
                  {section.title}
                </p>

              )}

              <div className="space-y-1">

                {section.items.map((item) => {

                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/admin"}
                      className={({ isActive }) =>
                        `
                      flex items-center
                      ${collapsed
                          ? "justify-center"
                          : "gap-3"}
                      px-4 py-3 rounded-xl transition-all
                      ${isActive
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                          : "hover:bg-zinc-800 text-zinc-300"}
                    `
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

              </div>

            </div>
          ))}

        </div>

        {/* Bottom Area */}
        <div className="border-t border-zinc-800 p-3 space-y-2">

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-zinc-300">

            <HelpCircle size={18} />

            {!collapsed && <span>FAQ</span>}

          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-zinc-300">

            <Mail size={18} />

            {!collapsed && <span>Contact Us</span>}

          </button>

        </div>

      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-20 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl px-6 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-4">

            {/* Breadcrumb */}
            <div className="hidden lg:flex flex-col">

              <p className="text-xs uppercase tracking-wider text-zinc-500"
              onClick={() => navigate("/")}
              style={{cursor:"pointer"}}
              >
                SellerOS ERP
              </p>

              <h2 className="text-lg font-semibold">
                Admin Control Center
              </h2>

            </div>

            {/* Search */}
            <div className="hidden md:flex items-center bg-zinc-800 rounded-xl px-4 h-12 w-[380px]">

              <Search
                size={18}
                className="text-zinc-400"
              />

              <input
                type="text"
                placeholder="Search sellers, products, orders..."
                className="bg-transparent outline-none border-none px-3 text-sm w-full"
              />

            </div>

          </div>

          {/* Right */}
          <div className="flex items-center gap-3">

            {/* Pro Badge */}
            <div className="hidden md:flex items-center gap-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-4 h-11 rounded-xl text-sm font-medium">

              <CreditCard size={16} />

              Enterprise Plan

            </div>

            {/* Quick Action */}
            <button className="hidden md:flex items-center gap-2 h-11 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 transition font-medium">

              + Quick Action

            </button>

            {/* Notifications */}
            <div className="relative">

              <button
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
                className="relative w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
              >

                <Bell size={18} />

                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />

              </button>

              {/* Dropdown */}
              {showNotifications && (

                <div className="absolute right-0 top-14 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">

                  <div className="p-4 border-b border-zinc-800">

                    <h3 className="font-semibold">
                      Notifications
                    </h3>

                  </div>

                  <div className="max-h-96 overflow-y-auto">

                    {notifications.map((item) => (

                      <div
                        key={item.id}
                        className="p-4 border-b border-zinc-800 hover:bg-zinc-800 transition cursor-pointer"
                      >

                        <p className="text-sm font-medium">
                          {item.title}
                        </p>

                        <p className="text-xs text-zinc-500 mt-1">
                          {item.time}
                        </p>

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>

            {/* Profile */}
            <div className="relative">

              <button
                onClick={() =>
                  setShowProfileMenu(
                    !showProfileMenu
                  )
                }
                className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl px-3 py-2 transition"
              >

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold">
                  {userData?.fullName?.charAt(0) || "A"}
                </div>

                <div className="hidden md:block text-left">

                  <p className="font-medium text-sm">
                    {userData?.fullName || "Admin"}
                  </p>

                  <p className="text-xs text-zinc-400">
                    Super Admin
                  </p>

                </div>

                <ChevronDown size={16} />

              </button>

              {/* Dropdown */}
              {showProfileMenu && (

                <div className="absolute right-0 top-16 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">

                  {/* User Info */}
                  <div className="p-4 border-b border-zinc-800">

                    <p className="font-semibold">
                      {userData?.fullName}
                    </p>

                    <p className="text-sm text-zinc-400 mt-1">
                      {userData?.email}
                    </p>

                  </div>

                  {/* Menu */}
                  <div className="p-2">

                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-sm">
                      Profile Settings
                    </button>

                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-sm">
                      Billing & Subscription
                    </button>

                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-sm">
                      Activity Logs
                    </button>

                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-sm">
                      Help Center
                    </button>

                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-zinc-800">

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition text-sm"
                    >

                      Logout

                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">

          <div className="p-6">

            <Outlet />

          </div>

        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800 bg-zinc-900 px-6 py-3 text-xs text-zinc-500 flex items-center justify-between">

          <p>
            © 2026 SellerOS ERP
          </p>

          <p>
            Admin Platform v1.0
          </p>

        </footer>

      </div>

    </div>
  );
}