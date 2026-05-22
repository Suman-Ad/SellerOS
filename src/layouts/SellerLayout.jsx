import { Outlet, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { signOut } from "firebase/auth";

import { auth } from "@/firebase/config";

import { toast } from "sonner";

import { useState, useEffect } from "react";

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
  Bell,
  Search,
  CreditCard,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

import SubscriptionDashboardCard from "@/components/subscription/SubscriptionDashboardCard";

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

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();

      setDeferredPrompt(e);
      setInstallable(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } =
      await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      toast.success("SellerOS installed");
    }

    setDeferredPrompt(null);
    setInstallable(false);
  };

  const [showNotifications, setShowNotifications] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "New order received",
      time: "2 min ago",
    },
    {
      id: 2,
      title: "Low inventory alert",
      time: "12 min ago",
    },
    {
      id: 3,
      title: "Marketplace sync completed",
      time: "1 hour ago",
    },
  ];

  const menuSections = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          path: "/seller",
          icon: LayoutDashboard,
        },
        {
          name: "Analytics",
          path: "/seller/analytics",
          icon: BarChart3,
        },
      ],
    },

    {
      title: "Commerce",
      items: [
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
      ],
    },

    {
      title: "Business",
      items: [
        {
          name: "Customers",
          path: "/seller/customers",
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
      ],
    },
  ];


  return (
    <div className="h-screen bg-zinc-950 text-white flex overflow-hiddenv">

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

              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent"
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
              >
                SellerOS
              </h1>

              <p className="text-xs text-zinc-400 mt-1">
                Seller ERP Panel
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

          {installable && (
            <button
              onClick={installApp}
              className="
      w-full
      bg-violet-600
      hover:bg-violet-700
      text-white
      py-3
      rounded-xl
      font-medium
      transition
    "
            >
              Install SellerOS
            </button>
          )}

          <button
            onClick={() => setShowFAQ(true)}
            className={`w-full flex items-center
  ${collapsed ? "justify-center" : "gap-3"}
  px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-zinc-300`}
          >

            <HelpCircle size={18} />

            {!collapsed && <span>FAQ</span>}

          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-zinc-300"
            onClick={() =>
              navigate(
                "/contact-us"
              )
            }
          >

            <Mail size={18} />

            {!collapsed && <span>Contact Us</span>}

          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-zinc-300"
            onClick={() =>
              navigate("/upgrade-plan")
            }
          >
            <CreditCard size={18} />
            {!collapsed && <span>Upgrade Plan</span>}
          </button>

        </div>

      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-20 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl px-6 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-4">

            <div className="hidden lg:flex flex-col">

              <p className="text-xs uppercase tracking-wider text-zinc-500"
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
              >
                SellerOS ERP
              </p>

              <h2 className="text-lg font-semibold">
                Seller Control Center
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
                placeholder="Search products, orders, customers..."
                className="bg-transparent outline-none border-none px-3 text-sm w-full"
              />

            </div>

          </div>

          {/* Right */}
          <div className="flex items-center gap-3">

            {/* Quick Action */}
            <button className="hidden md:flex items-center gap-2 h-11 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 transition font-medium"
              onClick={() =>
                navigate(
                  "/seller/products/add"
                )
              }
            >

              + Add Product

            </button>

          </div>
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
                {userData?.firstName?.charAt(0) || "A"}{userData?.lastName?.charAt(0) || "A"}
              </div>

              <div className="hidden md:block text-left">

                <p className="font-medium text-sm">
                  {userData?.businessName || "Seller"}
                </p>

                <p className="text-xs text-zinc-400">
                  {userData?.gstNo || "GST No:"}
                </p>

              </div>

              <ChevronDown size={16} />

            </button>

            {/* Dropdown */}
            {showProfileMenu && (

              <div className="absolute right-0 top-16 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-1001">

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

                  <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-sm"
                    onClick={() => navigate("/seller/profile-settings")}
                  >
                    Profile Settings
                  </button>

                  <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-sm">
                    Billing & Subscription
                  </button>

                  <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800 transition text-sm"
                    onClick={() => navigate("/security-center")}
                  >
                    Security Center
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
        </header>

        {/* Main */}
        <main className="flex-1 overflow-auto bg-zinc-950">

          {/* Page Content */}
          <div className="p-4 md:p-6">
            <Outlet />
          </div>

        </main>
        <footer className="border-t border-zinc-800 bg-zinc-900 px-6 py-3 text-xs text-zinc-500 flex items-center justify-between">

          <p>
            © 2026 SellerOS ERP
          </p>

          <p>
            Seller Platform v1.0
          </p>

        </footer>
        {/* FAQ Modal */}
        {showFAQ && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

            <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">

                <div>

                  <h2 className="text-3xl font-black tracking-tight">

                    Frequently Asked
                    <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                      {" "}Questions
                    </span>

                  </h2>

                  <p className="text-zinc-400 mt-2">
                    SellerOS ERP Support Center
                  </p>

                </div>

                <button
                  onClick={() => setShowFAQ(false)}
                  className="w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition flex items-center justify-center text-xl"
                >
                  ✕
                </button>

              </div>

              {/* Content */}
              <div className="max-h-[75vh] overflow-y-auto p-8 space-y-5">

                {[
                  {
                    question: "What is SellerOS ERP?",
                    answer:
                      "SellerOS is a modern commerce ERP platform for managing products, inventory, marketplaces, orders, analytics, and staff operations.",
                  },

                  {
                    question: "Can I manage multiple marketplaces?",
                    answer:
                      "Yes. SellerOS supports multi-marketplace integrations including Amazon, Flipkart, Shopify, WooCommerce, and more.",
                  },

                  {
                    question: "Does SellerOS support bulk uploads?",
                    answer:
                      "Yes. You can upload products and inventory in bulk using CSV or Excel templates.",
                  },

                  {
                    question: "Can I manage staff permissions?",
                    answer:
                      "Yes. SellerOS includes role-based access control for Admins, Sellers, and Staff users.",
                  },

                  {
                    question: "How secure is SellerOS?",
                    answer:
                      "SellerOS uses Firebase Authentication, secure APIs, encrypted storage, and protected role-based access.",
                  },

                  {
                    question: "Can I upgrade my plan later?",
                    answer:
                      "Absolutely. You can upgrade or change subscription plans anytime from your account settings.",
                  },

                  {
                    question: "How do I contact support?",
                    answer:
                      "Use the Contact Us section or reach out through email and support channels available in the dashboard.",
                  },
                ].map((faq, index) => (

                  <div
                    key={index}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/30 transition"
                  >

                    <h3 className="text-lg font-semibold mb-3">
                      {faq.question}
                    </h3>

                    <p className="text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}