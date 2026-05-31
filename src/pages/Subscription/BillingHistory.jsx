/// src/pages/Subscription/BillingHistory.jsx

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Receipt,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock3,
  Download,
  IndianRupee,
  Crown,
  CalendarClock,
} from "lucide-react";

import { toast } from "sonner";

export default function BillingHistory() {

  const { user } = useAuth();

  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ========================================
  // Fetch Payments
  // ========================================

  useEffect(() => {

    const fetchPayments = async () => {

      try {

        const q = query(
          collection(db, "paymentHistory"),
          where("uid", "==", user.uid),
          // orderBy(
          //   "createdAt",
          //   "desc"
          // )
        );

        const snapshot =
          await getDocs(q);

        const data =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        data.sort((a, b) => {

          const aTime =
            a.createdAt?.seconds || 0;

          const bTime =
            b.createdAt?.seconds || 0;

          return bTime - aTime;
        });
        setPayments(data);

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load billing history"
        );

      } finally {

        setLoading(false);
      }
    };

    if (!user?.uid) {

      setLoading(false);

      return;
    }

    fetchPayments();

  }, [user]);

  // ========================================
  // Status UI
  // ========================================

  const getStatusUI = (
    status
  ) => {

    switch (status) {

      case "paid":
        return {
          icon: (
            <CheckCircle2
              size={16}
            />
          ),
          className:
            "bg-emerald-500/10 text-emerald-400",
        };

      case "failed":
        return {
          icon: (
            <XCircle
              size={16}
            />
          ),
          className:
            "bg-red-500/10 text-red-400",
        };

      default:
        return {
          icon: (
            <Clock3
              size={16}
            />
          ),
          className:
            "bg-yellow-500/10 text-yellow-400",
        };
    }
  };

  // ========================================
  // Download Invoice
  // ========================================

  const handleDownloadInvoice =
    async (payment) => {

      // ========================================
      // Later:
      // PDF invoice generation
      // GST invoice
      // Download blob
      // Cloud Storage
      // ========================================

      toast.success(
        `Invoice download started for ${payment.planName}`
      );
    };

  return (

    <div className="min-h-screen bg-zinc-950 text-white p-6">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">

          <div>

            <div className="inline-flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-full px-5 py-2 text-violet-300 mb-5">

              <Receipt size={18} />

              SellerOS Billing

            </div>

            <h1 className="text-5xl font-black">

              Billing History

            </h1>

            <p className="text-zinc-400 mt-4 text-lg">

              Track payments, invoices,
              subscriptions and GST billing.

            </p>

          </div>

        </div>

        {/* Loading */}
        {loading ? (

          <div className="text-center py-20 text-zinc-400">

            Loading billing history...

          </div>

        ) : payments.length === 0 ? (

          /* Empty */
          <Card className="bg-zinc-900 border-zinc-800">

            <CardContent className="p-20 text-center">

              <Receipt
                size={60}
                className="mx-auto text-zinc-600"
              />

              <h2 className="text-3xl font-bold mt-8">

                No Billing Records

              </h2>

              <p className="text-zinc-400 mt-3">

                No payments or invoices found.

              </p>

            </CardContent>

          </Card>

        ) : (

          <div className="space-y-6">

            {payments.map(
              (payment) => {

                const statusUI =
                  getStatusUI(
                    payment.status
                  );

                return (

                  <Card
                    key={payment.id}
                    className="bg-zinc-900 border-zinc-800 overflow-hidden"
                  >

                    <CardContent className="p-0">

                      <div className="grid grid-cols-1 xl:grid-cols-4">

                        {/* Left */}
                        <div className="xl:col-span-3 p-8">

                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                            {/* Plan */}
                            <div className="flex items-start gap-5">

                              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">

                                <Crown size={30} />

                              </div>

                              <div>

                                <div className="flex flex-wrap items-center gap-3">

                                  <h2 className="text-2xl font-black">

                                    {
                                      payment.planName
                                    }

                                  </h2>

                                  <div
                                    className={`
                                      px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2
                                      ${statusUI.className}
                                    `}
                                  >

                                    {
                                      statusUI.icon
                                    }

                                    {
                                      payment.status
                                    }

                                  </div>

                                </div>

                                <p className="text-zinc-400 mt-2">

                                  {
                                    payment.billingCycle
                                  }{" "}
                                  subscription

                                </p>

                                {/* Meta */}
                                <div className="flex flex-wrap gap-4 mt-5 text-sm">

                                  <div className="flex items-center gap-2 text-zinc-400">

                                    <CalendarClock
                                      size={16}
                                    />

                                    {payment.createdAt
                                      ?.toDate?.()
                                      ?.toLocaleDateString()}

                                  </div>

                                  <div className="flex items-center gap-2 text-zinc-400">

                                    <CreditCard
                                      size={16}
                                    />

                                    {
                                      payment.paymentMethod
                                    }

                                  </div>

                                  <div className="flex items-center gap-2 text-zinc-400">

                                    <Receipt
                                      size={16}
                                    />

                                    Payment:
                                    {payment.razorpayPaymentId ||
                                      payment.transactionId}

                                  </div>

                                </div>

                              </div>

                            </div>

                            {/* Price */}
                            <div className="text-left lg:text-right">

                              <div className="flex items-center gap-2 text-4xl font-black">

                                <IndianRupee
                                  size={32}
                                />

                                {
                                  payment.total
                                }

                              </div>

                              <p className="text-zinc-400 mt-2">

                                GST Included

                              </p>

                            </div>

                          </div>

                        </div>

                        {/* Right */}
                        <div className="border-t xl:border-t-0 xl:border-l border-zinc-800 p-8 flex flex-col justify-center bg-zinc-950">

                          <div className="space-y-5">

                            <div>

                              <p className="text-sm text-zinc-500">

                                Invoice ID

                              </p>

                              <h3 className="font-semibold mt-1 break-all">

                                {
                                  payment.invoiceId
                                }

                              </h3>

                            </div>

                            <div>

                              <p className="text-sm text-zinc-500">

                                GST Amount

                              </p>

                              <h3 className="font-semibold mt-1">

                                ₹
                                {
                                  payment.gst
                                }

                              </h3>

                            </div>

                            <Button
                              onClick={() =>
                                handleDownloadInvoice(
                                  payment
                                )
                              }
                              className="
                                w-full
                                h-12
                                rounded-xl
                                bg-violet-600
                                hover:bg-violet-700
                                font-semibold
                              "
                            >

                              <Download className="mr-2 h-4 w-4" />

                              Download Invoice

                            </Button>

                          </div>

                        </div>

                      </div>

                    </CardContent>

                  </Card>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>

  );
}