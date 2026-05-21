import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  CreditCard,
  ShieldCheck,
  Receipt,
  Crown,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";

import {
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  addDoc,
  collection,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { useAuth } from "@/context/AuthContext";

export default function Checkout() {

  const location = useLocation();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [loading, setLoading] =
    useState(false);

  // =========================================
  // Safe State Access
  // =========================================

  const plan =
    location.state?.plan || null;

  const billingCycle =
    location.state?.billingCycle ||
    "monthly";

  // =========================================
  // Redirect Safely
  // =========================================

  useEffect(() => {

    if (!plan) {

      toast.error(
        "No subscription plan selected"
      );

      navigate("/upgrade-plan");
    }

  }, [plan, navigate]);

  // Prevent render before redirect
  if (!plan) return null;

  // =========================================
  // Pricing
  // =========================================

  const basePrice = useMemo(() => {

    return billingCycle === "monthly"
      ? Number(plan.priceMonthly || 0)
      : Number(plan.priceYearly || 0);

  }, [billingCycle, plan]);

  const gst = useMemo(() => {

    return Math.round(basePrice * 0.18);

  }, [basePrice]);

  const total = useMemo(() => {

    return basePrice + gst;

  }, [basePrice, gst]);

  // =========================================
  // Activate Subscription
  // =========================================

  const handleActivatePlan =
    async () => {

      try {

        if (!user?.uid) {

          return toast.error(
            "User not found"
          );
        }

        setLoading(true);

        // =========================================
        // Expiry Date
        // =========================================

        const expiryDate =
          new Date();

        if (
          billingCycle === "monthly"
        ) {

          expiryDate.setMonth(
            expiryDate.getMonth() + 1
          );

        } else {

          expiryDate.setFullYear(
            expiryDate.getFullYear() + 1
          );
        }

        // =========================================
        // Transaction IDs
        // =========================================

        const transactionId =
          `TXN-${Date.now()}`;

        const invoiceId =
          `INV-${Date.now()}`;

        // =========================================
        // Update User
        // =========================================

        await updateDoc(
          doc(db, "users", user.uid),
          {

            subscription: {

              planId: plan.id,

              planName:
                plan.name,

              status: "active",

              isActive: true,

              billingCycle,

              subscribedAt:
                serverTimestamp(),

              expiresAt:
                Timestamp.fromDate(
                  expiryDate
                ),

              features:
                plan.features || [],

              limits: {

                maxProducts:
                  plan.maxProducts ||
                  0,

                maxOrdersPerMonth:
                  plan.maxOrdersPerMonth ||
                  0,

                maxStaffAccounts:
                  plan.maxStaffAccounts ||
                  0,
              },
            },

            updatedAt:
              serverTimestamp(),
          }
        );

        // =========================================
        // Payment History
        // =========================================

        await addDoc(
          collection(
            db,
            "paymentHistory"
          ),
          {

            uid: user.uid,

            planId: plan.id,

            planName:
              plan.name,

            billingCycle,

            paymentMethod:
              "Razorpay",

            transactionId,

            invoiceId,

            basePrice,

            gst,

            total,

            status: "paid",

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Subscription activated successfully"
        );

        navigate("/billing-history");

      } catch (error) {

        console.error(
          "CHECKOUT ERROR:",
          error
        );

        toast.error(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="min-h-screen bg-zinc-950 text-white p-6">

      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button
          onClick={() =>
            navigate(-1)
          }
          className="
            flex items-center gap-2
            text-zinc-400
            hover:text-white
            transition mb-8
          "
        >

          <ArrowLeft size={18} />

          Back

        </button>

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="xl:col-span-2">

            <Card className="bg-zinc-900 border-zinc-800">

              <CardContent className="p-8">

                <div className="flex items-center gap-4 mb-8">

                  <div className="
                    w-14 h-14
                    rounded-2xl
                    bg-violet-500/10
                    flex items-center
                    justify-center
                    text-violet-400
                  ">

                    <CreditCard size={28} />

                  </div>

                  <div>

                    <h1 className="text-3xl font-black">
                      Secure Checkout
                    </h1>

                    <p className="text-zinc-400 mt-1">
                      Complete your subscription upgrade
                    </p>

                  </div>

                </div>

                {/* Payment Method */}
                <div className="
                  border border-violet-500
                  bg-violet-500/10
                  rounded-2xl p-5
                ">

                  <div className="
                    flex items-center
                    justify-between
                  ">

                    <div className="
                      flex items-center gap-4
                    ">

                      <div className="
                        w-12 h-12 rounded-xl
                        bg-white text-black
                        flex items-center
                        justify-center
                        font-black
                      ">

                        ₹

                      </div>

                      <div>

                        <h3 className="font-bold">
                          Razorpay
                        </h3>

                        <p className="text-sm text-zinc-400">
                          UPI, Cards, Wallets
                        </p>

                      </div>

                    </div>

                    <CheckCircle2 className="text-emerald-400" />

                  </div>

                </div>

                {/* Security */}
                <div className="
                  mt-8 bg-zinc-950
                  border border-zinc-800
                  rounded-2xl p-5
                  flex items-center gap-4
                ">

                  <ShieldCheck className="text-emerald-400" />

                  <div>

                    <h3 className="font-semibold">
                      Secure Transaction
                    </h3>

                    <p className="text-sm text-zinc-400 mt-1">
                      End-to-end encrypted billing system.
                    </p>

                  </div>

                </div>

              </CardContent>

            </Card>

          </div>

          {/* RIGHT */}
          <div>

            <Card className="
              bg-zinc-900
              border-zinc-800
              sticky top-6
            ">

              <CardContent className="p-8">

                {/* Plan */}
                <div className="
                  flex items-center gap-4
                ">

                  <div className="
                    w-14 h-14 rounded-2xl
                    bg-violet-500/10
                    flex items-center
                    justify-center
                    text-violet-400
                  ">

                    <Crown size={28} />

                  </div>

                  <div>

                    <h2 className="
                      text-2xl font-black
                    ">

                      {plan.name}

                    </h2>

                    <p className="
                      text-zinc-400 capitalize
                    ">

                      {billingCycle} plan

                    </p>

                  </div>

                </div>

                {/* Divider */}
                <div className="
                  border-t border-zinc-800
                  my-8
                " />

                {/* Pricing */}
                <div className="space-y-5">

                  <div className="
                    flex items-center
                    justify-between
                  ">

                    <span className="text-zinc-400">
                      Subscription
                    </span>

                    <span>
                      ₹{basePrice}
                    </span>

                  </div>

                  <div className="
                    flex items-center
                    justify-between
                  ">

                    <span className="text-zinc-400">
                      GST (18%)
                    </span>

                    <span>
                      ₹{gst}
                    </span>

                  </div>

                  <div className="
                    border-t border-zinc-800
                    pt-5 flex items-center
                    justify-between
                    text-xl font-black
                  ">

                    <span>Total</span>

                    <span>
                      ₹{total}
                    </span>

                  </div>

                </div>

                {/* Features */}
                <div className="mt-8">

                  <h3 className="
                    font-bold mb-4
                  ">
                    Included Features
                  </h3>

                  <div className="
                    space-y-3
                  ">

                    {plan.features?.map(
                      (
                        feature,
                        index
                      ) => (

                        <div
                          key={index}
                          className="
                            flex items-center
                            gap-3 text-sm
                          "
                        >

                          <CheckCircle2
                            size={16}
                            className="
                              text-emerald-400
                            "
                          />

                          {feature}

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* Invoice */}
                <div className="
                  mt-8 bg-zinc-950
                  border border-zinc-800
                  rounded-2xl p-5
                  flex items-center gap-4
                ">

                  <Receipt className="
                    text-violet-400
                  " />

                  <div>

                    <h3 className="
                      font-semibold
                    ">
                      GST Invoice
                    </h3>

                    <p className="
                      text-sm text-zinc-400 mt-1
                    ">
                      Auto-generated after payment.
                    </p>

                  </div>

                </div>

                {/* Pay */}
                <Button
                  onClick={
                    handleActivatePlan
                  }
                  disabled={loading}
                  className="
                    w-full mt-8 h-14
                    rounded-2xl
                    bg-violet-600
                    hover:bg-violet-700
                    text-lg font-semibold
                  "
                >

                  {loading
                    ? "Processing..."
                    : `Pay ₹${total}`}

                </Button>

              </CardContent>

            </Card>

          </div>

        </div>

      </div>

    </div>
  );
}