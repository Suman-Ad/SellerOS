import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  X,
  CreditCard,
  Crown,
  CalendarClock,
  IndianRupee,
} from "lucide-react";

export default function UserSubscriptionHistoryDrawer({
  open,
  user,
  onClose,
}) {

  const [loading, setLoading] =
    useState(false);

  const [history, setHistory] =
    useState([]);

  const [summary, setSummary] =
    useState({
      totalRevenue: 0,
      totalPayments: 0,
    });

  useEffect(() => {

    if (
      !open ||
      !user?.id
    ) return;

    loadHistory();

  }, [open, user]);

  const loadHistory =
    async () => {

      try {

        setLoading(true);

        const q = query(
          collection(
            db,
            "paymentHistory"
          ),
          where(
            "uid",
            "==",
            user.id
          ),
        //   orderBy(
        //     "createdAt",
        //     "desc"
        //   )
        );

        const snapshot =
          await getDocs(q);

        const rows =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        const totalRevenue =
          rows.reduce(
            (sum, row) =>
              sum +
              Number(
                row.total || 0
              ),
            0
          );

        setHistory(rows);

        setSummary({

          totalRevenue,

          totalPayments:
            rows.length,
        });

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  if (!open) return null;

  return (

    <div className="
      fixed
      inset-0
      z-[1001]
      bg-black/60
      backdrop-blur-sm
      flex
      justify-end
    ">

      <div className="
        w-full
        max-w-3xl
        h-full
        bg-zinc-950
        border-l
        border-zinc-800
        overflow-y-auto
      ">

        {/* Header */}

        <div className="
          sticky
          top-0
          bg-zinc-950
          border-b
          border-zinc-800
          p-6
          flex
          items-center
          justify-between
        ">

          <div>

            <h2 className="
              text-2xl
              font-bold
              text-white
            ">

              Subscription History

            </h2>

            <p className="
              text-zinc-400
              mt-1
            ">

              {user?.fullName}

            </p>

          </div>

          <Button
            variant="ghost"
            onClick={onClose}
          >

            <X size={18} />

          </Button>

        </div>

        {/* Summary */}

        <div className="
          p-6
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        ">

          <Card className="
            bg-zinc-900
            border-zinc-800
          ">

            <CardContent className="p-5">

              <div className="
                flex
                items-center
                gap-3
              ">

                <IndianRupee />

                <div>

                  <p className="
                    text-zinc-400
                    text-sm
                  ">

                    Total Revenue

                  </p>

                  <h3 className="
                    text-2xl
                    font-bold
                    text-white
                  ">

                    ₹
                    {summary.totalRevenue.toLocaleString()}

                  </h3>

                </div>

              </div>

            </CardContent>

          </Card>

          <Card className="
            bg-zinc-900
            border-zinc-800
          ">

            <CardContent className="p-5">

              <div className="
                flex
                items-center
                gap-3
              ">

                <CreditCard />

                <div>

                  <p className="
                    text-zinc-400
                    text-sm
                  ">

                    Payments

                  </p>

                  <h3 className="
                    text-2xl
                    font-bold
                    text-white
                  ">

                    {summary.totalPayments}

                  </h3>

                </div>

              </div>

            </CardContent>

          </Card>

        </div>

        {/* History */}

        <div className="px-6 pb-10">

          {loading ? (

            <div className="
              text-zinc-400
            ">
              Loading...
            </div>

          ) : history.length === 0 ? (

            <div className="
              text-zinc-500
            ">
              No payment history found.
            </div>

          ) : (

            <div className="
              space-y-4
            ">

              {history.map(
                (item) => {

                  const date =
                    item.createdAt
                      ?.toDate
                      ? item.createdAt.toDate()
                      : null;

                  return (

                    <Card
                      key={item.id}
                      className="
                        bg-zinc-900
                        border-zinc-800
                      "
                    >

                      <CardContent className="p-5">

                        <div className="
                          flex
                          flex-col
                          lg:flex-row
                          lg:items-center
                          justify-between
                          gap-4
                        ">

                          <div>

                            <div className="
                              flex
                              items-center
                              gap-2
                              text-white
                              font-semibold
                            ">

                              <Crown
                                size={16}
                              />

                              {item.planName}

                            </div>

                            <div className="
                              text-zinc-400
                              text-sm
                              mt-2
                            ">

                              Invoice:
                              {" "}
                              {item.invoiceId}

                            </div>

                            <div className="
                              text-zinc-400
                              text-sm
                            ">

                              Payment:
                              {" "}
                              {item.razorpayPaymentId ||
                                "-"}

                            </div>

                          </div>

                          <div>

                            <div className="
                              text-right
                              text-white
                              font-bold
                              text-xl
                            ">

                              ₹
                              {Number(
                                item.total || 0
                              ).toLocaleString()}

                            </div>

                            <div className="
                              text-zinc-400
                              text-sm
                              mt-1
                            ">

                              {item.billingCycle}

                            </div>

                            <div className="
                              text-zinc-500
                              text-xs
                              mt-2
                            ">

                              {date
                                ? date.toLocaleDateString("en-IN")
                                : "-"}

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

    </div>
  );
}