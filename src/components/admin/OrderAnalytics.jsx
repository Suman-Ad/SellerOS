// src/components/admin/OrderAnalytics.jsx

import {
    Card,
    CardContent,
} from "@/components/ui/card";

export default function OrderAnalytics({
    analytics,
}) {

    const items = [
        {
            label: "Delivered",
            value:
                analytics.deliveredOrders,
            color: "bg-green-500",
        },

        {
            label: "Pending",
            value:
                analytics.pendingOrders,
            color: "bg-yellow-500",
        },

        {
            label: "Cancelled",
            value:
                analytics.cancelledOrders,
            color: "bg-red-500",
        },
    ];

    return (
        <Card className="bg-zinc-900 border-zinc-800">

            <CardContent className="p-6">

                <div className="flex items-center justify-between mb-6">

                    <div>

                        <h2 className="text-2xl font-bold text-white">
                            Order Intelligence
                        </h2>

                        <p className="text-zinc-400 mt-1">
                            Marketplace order operations
                        </p>

                    </div>

                </div>

                <div className="space-y-5">

                    {items.map((item) => (

                        <div key={item.label}>

                            <div className="flex justify-between mb-2">

                                <span className="text-zinc-300">
                                    {item.label}
                                </span>

                                <span className="font-semibold text-white">
                                    {item.value}
                                </span>

                            </div>

                            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">

                                <div
                                    className={`${item.color} h-full rounded-full`}
                                    style={{
                                        width: `${analytics.totalOrders > 0
                                                ? (
                                                    (item.value /
                                                        analytics.totalOrders) *
                                                    100
                                                ).toFixed(0)
                                                : 0
                                            }%`,
                                    }}
                                />

                            </div>

                        </div>
                    ))}
                </div>

            </CardContent>

        </Card>
    );
}