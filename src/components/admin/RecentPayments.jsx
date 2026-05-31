import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Badge
} from "@/components/ui/badge";

import {
  CreditCard,
  Receipt,
} from "lucide-react";

export default function RecentPayments({
  payments = [],
}) {

  return (

    <Card className="bg-zinc-900 border-zinc-800">

      <CardHeader>

        <CardTitle className="text-white flex items-center gap-2">

          <CreditCard size={20} />

          Recent Payments

        </CardTitle>

      </CardHeader>

      <CardContent>

        {!payments.length ? (

          <div className="text-center py-10 text-zinc-500">

            No payment records found

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-zinc-800 text-left">

                  <th className="py-3 text-zinc-400">
                    Invoice
                  </th>

                  <th className="py-3 text-zinc-400">
                    Plan
                  </th>

                  <th className="py-3 text-zinc-400">
                    Amount
                  </th>

                  <th className="py-3 text-zinc-400">
                    Payment ID
                  </th>

                  <th className="py-3 text-zinc-400">
                    Status
                  </th>

                  <th className="py-3 text-zinc-400">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {payments.map(
                  (payment) => {

                    const date =
                      payment.createdAt?.toDate
                        ? payment.createdAt.toDate()
                        : null;

                    return (

                      <tr
                        key={payment.id}
                        className="border-b border-zinc-800/50"
                      >

                        <td className="py-4">

                          <div className="flex items-center gap-2">

                            <Receipt
                              size={14}
                            />

                            <span className="text-white">

                              {payment.invoiceId ||
                                "N/A"}

                            </span>

                          </div>

                        </td>

                        <td className="py-4 text-white">

                          {payment.planName ||
                            "-"}

                        </td>

                        <td className="py-4 text-white font-medium">

                          ₹
                          {Number(
                            payment.total || 0
                          ).toLocaleString()}

                        </td>

                        <td className="py-4">

                          <span className="text-zinc-300 text-sm">

                            {payment.razorpayPaymentId ||
                              payment.transactionId ||
                              "-"}

                          </span>

                        </td>

                        <td className="py-4">

                          <Badge
                            variant={
                              payment.status ===
                              "paid"
                                ? "default"
                                : "secondary"
                            }
                          >

                            {payment.status ||
                              "unknown"}

                          </Badge>

                        </td>

                        <td className="py-4 text-zinc-400 text-sm">

                          {date
                            ? date.toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </CardContent>

    </Card>
  );
}