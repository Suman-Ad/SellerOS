import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  BarChart3,
  Store,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const navigate = useNavigate();

  const features = [
    {
      title: "Inventory Management",
      icon: Package,
      desc: "Track and manage stock across multiple marketplaces in real time.",
    },

    {
      title: "Order Processing",
      icon: ShoppingCart,
      desc: "Handle orders, shipping, returns, and fulfillment from one dashboard.",
    },

    {
      title: "Advanced Analytics",
      icon: BarChart3,
      desc: "Get powerful business insights with real-time analytics.",
    },

    {
      title: "Marketplace Sync",
      icon: Store,
      desc: "Connect Amazon, Flipkart, Shopify, WooCommerce and more.",
    },

    {
      title: "Enterprise Security",
      icon: ShieldCheck,
      desc: "Secure authentication, role management, and protected APIs.",
    },

    {
      title: "PWA Mobile App",
      icon: Smartphone,
      desc: "Install SellerOS like a native app on desktop and mobile.",
    },
  ];

  return (
    <div>

      {/* Hero */}
      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 py-28 relative">

          <div className="max-w-4xl">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-8">
              Modern Ecommerce ERP Platform
            </div>

            <h1 className="text-6xl md:text-7xl font-black leading-tight tracking-tight">

              Manage Your Entire
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                {" "}Commerce Business
              </span>
              {" "}From One Platform

            </h1>

            <p className="text-zinc-400 text-xl leading-relaxed mt-8 max-w-3xl">
              SellerOS helps sellers manage products,
              inventory, orders, analytics, marketplaces,
              and team operations with one powerful ERP system.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">

              <Button
                size="lg"
                className="bg-violet-600 hover:bg-violet-700 h-14 px-8 text-base"
                onClick={() => navigate("/register")}
              >
                Get Started
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 h-14 px-8 text-base"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>

            </div>

          </div>

        </div>

      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {[
            ["10K+", "Orders Processed"],
            ["500+", "Active Sellers"],
            ["99.9%", "Platform Uptime"],
            ["24/7", "Support"],
          ].map((item, index) => (

            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
            >

              <h2 className="text-4xl font-black">
                {item[0]}
              </h2>

              <p className="text-zinc-400 mt-3">
                {item[1]}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-black">
            Everything You Need To Run
            Your Ecommerce Business
          </h2>

          <p className="text-zinc-400 text-lg mt-6 max-w-3xl mx-auto">
            SellerOS combines inventory, order management,
            analytics, and marketplace automation into one platform.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-violet-500/40 transition"
              >

                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">

                  <Icon
                    size={28}
                    className="text-violet-400"
                  />

                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {feature.title}
                </h3>

                <p className="text-zinc-400 leading-relaxed">
                  {feature.desc}
                </p>

              </div>
            );
          })}

        </div>

      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">

        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[40px] p-14 text-center">

          <h2 className="text-5xl font-black">
            Ready To Scale Your Business?
          </h2>

          <p className="text-white/80 text-lg mt-6 max-w-2xl mx-auto">
            Join SellerOS and simplify your ecommerce operations with one powerful ERP platform.
          </p>

          <div className="flex justify-center gap-4 mt-10">

            <Button
              size="lg"
              className="bg-white text-black hover:bg-zinc-200 h-14 px-8"
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 h-14 px-8"
              onClick={() => navigate("/login")}
            >
              Seller Login
            </Button>

          </div>

        </div>

      </section>

    </div>
  );
}