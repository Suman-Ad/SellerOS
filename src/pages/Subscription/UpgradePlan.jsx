// src/pages/Subscription/UpgradePlan.jsx

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  Crown,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function UpgradePlan() {

  const navigate = useNavigate();

  const { userData } = useAuth();

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [billingCycle, setBillingCycle] =
    useState("monthly");

  const [selectedPlan, setSelectedPlan] =
    useState(null);

  // ========================================
  // Fetch Plans
  // ========================================

  useEffect(() => {

    const fetchPlans = async () => {

      try {

        const q = query(
          collection(db, "subscriptionPlans"),
          where("isActive", "==", true)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setPlans(data);

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load plans"
        );

      } finally {

        setLoading(false);
      }
    };

    fetchPlans();

  }, []);

  // ========================================
  // Select Plan
  // ========================================

  const handleSelectPlan = (
    plan
  ) => {

    setSelectedPlan(plan);
  };

  // ========================================
  // Continue Upgrade
  // ========================================

  const handleContinue = () => {

    if (!selectedPlan) {

      return toast.error(
        "Please select a plan"
      );
    }

    toast.success(
      `${selectedPlan.name} selected`
    );

    // Later:
    // Razorpay
    // Stripe
    // UPI
    // Invoice
    // GST

    navigate("/checkout", {
      state: {
        plan: selectedPlan,
        billingCycle,
      },
    });
  };

  return (

    <div className="min-h-screen bg-zinc-950 text-white p-6">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">

          <div className="inline-flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-full px-5 py-2 text-violet-300 mb-6">

            <Sparkles size={18} />

            SellerOS Premium SaaS

          </div>

          <h1 className="text-5xl font-black">

            Upgrade Your Plan

          </h1>

          <p className="text-zinc-400 mt-5 max-w-2xl mx-auto text-lg">

            Unlock advanced analytics,
            AI insights, bulk operations,
            enterprise-grade automation
            and higher business limits.

          </p>

        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 flex items-center gap-2">

            <button
              onClick={() =>
                setBillingCycle(
                  "monthly"
                )
              }
              className={`
                px-6 py-3 rounded-xl text-sm font-semibold transition
                ${
                  billingCycle ===
                  "monthly"
                    ? "bg-violet-600 text-white"
                    : "text-zinc-400"
                }
              `}
            >

              Monthly

            </button>

            <button
              onClick={() =>
                setBillingCycle(
                  "yearly"
                )
              }
              className={`
                px-6 py-3 rounded-xl text-sm font-semibold transition
                ${
                  billingCycle ===
                  "yearly"
                    ? "bg-violet-600 text-white"
                    : "text-zinc-400"
                }
              `}
            >

              Yearly

            </button>

          </div>

        </div>

        {/* Plans */}
        {loading ? (

          <div className="text-center text-zinc-400 py-20">

            Loading plans...

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

            {plans.map((plan) => {

              const selected =
                selectedPlan?.id ===
                plan.id;

              const price =
                billingCycle ===
                "monthly"
                  ? plan.priceMonthly
                  : plan.priceYearly;

              return (

                <Card
                  key={plan.id}
                  className={`
                    relative
                    overflow-hidden
                    border-2
                    transition-all
                    duration-300
                    cursor-pointer
                    ${
                      selected
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-zinc-800 bg-zinc-900"
                    }
                  `}
                  onClick={() =>
                    handleSelectPlan(
                      plan
                    )
                  }
                >

                  {/* Popular Badge */}
                  {plan.badge && (

                    <div className="absolute top-5 right-5 bg-violet-600 text-white text-xs px-3 py-1 rounded-full font-semibold">

                      {plan.badge}

                    </div>

                  )}

                  <CardContent className="p-7">

                    {/* Header */}
                    <div>

                      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">

                        <Crown size={28} />

                      </div>

                      <h2 className="text-3xl font-black mt-6">

                        {plan.name}

                      </h2>

                      <p className="text-zinc-400 mt-3">

                        {plan.description}

                      </p>

                    </div>

                    {/* Pricing */}
                    <div className="mt-8">

                      <div className="flex items-end gap-2">

                        <h3 className="text-5xl font-black">

                          ₹{price}

                        </h3>

                        <span className="text-zinc-400 mb-2">

                          /
                          {billingCycle ===
                          "monthly"
                            ? "month"
                            : "year"}

                        </span>

                      </div>

                    </div>

                    {/* Limits */}
                    <div className="mt-8 space-y-3 text-sm">

                      <div className="flex items-center justify-between">

                        <span className="text-zinc-400">
                          Products
                        </span>

                        <span className="font-semibold">
                          {
                            plan.maxProducts
                          }
                        </span>

                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-zinc-400">
                          Orders
                        </span>

                        <span className="font-semibold">
                          {
                            plan.maxOrdersPerMonth
                          }
                        </span>

                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-zinc-400">
                          Staff
                        </span>

                        <span className="font-semibold">
                          {
                            plan.maxStaffAccounts
                          }
                        </span>

                      </div>

                    </div>

                    {/* Features */}
                    <div className="mt-8 space-y-3">

                      {plan.features?.map(
                        (
                          feature,
                          index
                        ) => (

                          <div
                            key={index}
                            className="flex items-center gap-3 text-sm"
                          >

                            <CheckCircle2
                              size={16}
                              className="text-emerald-400"
                            />

                            {feature}

                          </div>
                        )
                      )}

                    </div>

                    {/* Feature Access */}
                    <div className="mt-8 flex flex-wrap gap-2">

                      {plan.aiInsightsAccess && (

                        <div className="bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full text-xs flex items-center gap-2">

                          <Sparkles size={12} />

                          AI Insights

                        </div>

                      )}

                      {plan.analyticsAccess && (

                        <div className="bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full text-xs flex items-center gap-2">

                          <Zap size={12} />

                          Analytics

                        </div>

                      )}

                      {plan.apiAccess && (

                        <div className="bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full text-xs flex items-center gap-2">

                          <ShieldCheck size={12} />

                          API Access

                        </div>

                      )}

                    </div>

                    {/* Select */}
                    <Button
                      className={`
                        w-full
                        mt-8
                        h-12
                        rounded-xl
                        font-semibold
                        ${
                          selected
                            ? "bg-violet-600 hover:bg-violet-700"
                            : ""
                        }
                      `}
                    >

                      {selected
                        ? "Selected"
                        : "Choose Plan"}

                    </Button>

                  </CardContent>

                </Card>
              );
            })}

          </div>

        )}

        {/* Footer */}
        <div className="mt-14 flex flex-col lg:flex-row items-center justify-between gap-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

          <div>

            <h2 className="text-2xl font-bold">

              Secure SaaS Billing

            </h2>

            <p className="text-zinc-400 mt-2">

              Razorpay, UPI, cards,
              GST invoices and enterprise
              billing support coming next.

            </p>

          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="
              bg-violet-600
              hover:bg-violet-700
              h-14
              px-8
              rounded-2xl
              text-lg
              font-semibold
            "
          >

            Continue Upgrade

            <ArrowRight className="ml-3 h-5 w-5" />

          </Button>

        </div>

      </div>

    </div>

  );
}