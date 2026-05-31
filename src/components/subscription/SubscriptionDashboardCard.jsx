// src\components\subscription\SubscriptionDashboardCard.jsx

import {
  Crown,
  CalendarClock,
  Package,
  ShoppingCart,
  Users,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import useSubscription from "@/hooks/useSubscription";

import { useNavigate } from "react-router-dom";

export default function SubscriptionDashboardCard({
  onUpgrade,
}) {

  const subscription = useSubscription();
  const navigate = useNavigate();

  const {
    planName = "Free",
    isEnterprise = false,

    status = "inactive",
    isExpired = false,
    remainingDays = 0,

    features = [],

    maxProducts = 0,
    usedProducts = 0,
    remainingProducts = 0,
    productUsagePercent = 0,

    maxOrders = 0,
    usedOrders = 0,
    remainingOrders = 0,
    orderUsagePercent = 0,

    maxStaff = 0,
    usedStaff = 0,
    remainingStaff = 0,
    staffUsagePercent = 0,
  } = subscription || {};


  return (

    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">

      <CardContent className="p-0">

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6">

          {/* Glow */}
          <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Left */}
            <div>

              <div className="flex items-center gap-3">

                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center">

                  <Crown size={28} />

                </div>

                <div>

                  <p className="text-sm text-white/70">
                    Current Subscription
                  </p>

                  <h2 className="text-3xl font-black text-white capitalize">

                    {planName}

                  </h2>

                </div>

              </div>

              {/* Status */}
              <div className="flex flex-wrap items-center gap-3 mt-5">

                <div
                  className={`
                    px-4 py-2 rounded-full text-sm font-semibold
                    ${isExpired
                      ? "bg-red-500/20 text-red-100"
                      : "bg-emerald-500/20 text-emerald-100"
                    }
                  `}
                >

                  {isExpired
                    ? "Expired"
                    : status}

                </div>

                <div className="bg-white/10 px-4 py-2 rounded-full text-sm text-white flex items-center gap-2">

                  <CalendarClock size={16} />

                  {remainingDays} Days Remaining

                </div>

                {isEnterprise && (

                  <div className="bg-amber-400/20 text-amber-100 px-4 py-2 rounded-full text-sm flex items-center gap-2">

                    <ShieldCheck size={16} />

                    Enterprise Access

                  </div>

                )}

              </div>

            </div>

            {/* Upgrade */}
            <div>

              <Button
                onClick={() => onUpgrade?.()}
                className="
                  bg-white
                  text-black
                  hover:bg-zinc-200
                  font-semibold
                  rounded-xl
                  h-12
                  px-6
                "
              >

                Upgrade Plan

                <ArrowUpRight className="ml-2 h-4 w-4" />

              </Button>

            </div>

          </div>

        </div>

        {/* Usage Section */}
        <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Products */}
          <UsageCard
            title="Products"
            icon={<Package size={20} />}
            used={usedProducts}
            max={maxProducts}
            remaining={remainingProducts}
            percent={productUsagePercent}
            color="violet"
          />

          {/* Orders */}
          <UsageCard
            title="Orders"
            icon={<ShoppingCart size={20} />}
            used={usedOrders}
            max={maxOrders}
            remaining={remainingOrders}
            percent={orderUsagePercent}
            color="emerald"
          />

          {/* Staff */}
          <UsageCard
            title="Staff Accounts"
            icon={<Users size={20} />}
            used={usedStaff}
            max={maxStaff}
            remaining={remainingStaff}
            percent={staffUsagePercent}
            color="orange"
          />

          <ArrowUpRight onClick={() => navigate("/billing-history")} />
        </div>

        {/* Features */}
        <div className="px-6 pb-6">

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">

            <div className="flex items-center gap-3 mb-4">

              <Sparkles className="text-violet-400" />

              <h3 className="text-lg font-bold text-white">
                Active Features
              </h3>

            </div>

            {features?.length > 0 ? (

              <div className="flex flex-wrap gap-3">

                {features.map(
                  (feature, index) => (

                    <div
                      key={index}
                      className="
                        px-4 py-2
                        rounded-xl
                        bg-violet-500/10
                        border
                        border-violet-500/20
                        text-violet-300
                        text-sm
                        font-medium
                      "
                    >

                      {feature}

                    </div>
                  )
                )}

              </div>

            ) : (

              <div className="text-zinc-500 text-sm">
                No premium features enabled.
              </div>

            )}

          </div>

        </div>

      </CardContent>

    </Card>
  );
}

/* =========================================
   Usage Card
========================================= */

function UsageCard({
  title,
  icon,
  used,
  max,
  remaining,
  percent,
  color,
}) {

  const barColor = {
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    orange: "bg-orange-500",
  };

  return (

    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">

      {/* Top */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-white">

            {icon}

          </div>

          <div>

            <p className="text-zinc-400 text-sm">
              {title}
            </p>

            <h3 className="text-2xl font-black text-white mt-1">

              {used}

              <span className="text-zinc-500 text-base font-medium">
                / {max === 0 ? "Unlimited" : max}
              </span>

            </h3>

          </div>

        </div>

      </div>

      {/* Progress */}
      <div className="mt-5">

        <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">

          <div
            className={`
              h-full
              rounded-full
              transition-all
              duration-500
              ${barColor[color]}
            `}
            style={{
              width: `${percent}%`,
            }}
          />

        </div>

        <div className="flex items-center justify-between mt-3 text-sm">

          <span className="text-zinc-400">
            {max === 0
              ? "Unlimited"
              : `${percent.toFixed(0)}% Used`}
          </span>

          <span className="text-zinc-400">

            {remaining} Remaining

          </span>

        </div>

      </div>

    </div>

  );
}