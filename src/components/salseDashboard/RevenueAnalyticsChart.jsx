import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

// ====================================
// FORMAT
// ====================================

const formatCurrency =
    (value = 0) => {

        return new Intl.NumberFormat(
            "en-IN",
            {

                style: "currency",

                currency: "INR",

                maximumFractionDigits: 0,
            }
        ).format(value);
    };

// ====================================
// COMPONENT
// ====================================

export default function RevenueAnalyticsChart({
    data = [],
}) {

    return (

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

            {/* HEADER */}

            <div className="mb-6">

                <h2 className="text-xl font-bold text-white">

                    Revenue & Profit Analytics

                </h2>

                <p className="text-sm text-zinc-400 mt-1">

                    Daily business performance overview

                </p>

            </div>

            {/* CHART */}

            <div className="h-[380px]">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <AreaChart
                        data={data}
                    >

                        <defs>

                            <linearGradient
                                id="revenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >

                                <stop
                                    offset="5%"
                                    stopColor="#8b5cf6"
                                    stopOpacity={0.8}
                                />

                                <stop
                                    offset="95%"
                                    stopColor="#8b5cf6"
                                    stopOpacity={0}
                                />

                            </linearGradient>

                            <linearGradient
                                id="profit"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >

                                <stop
                                    offset="5%"
                                    stopColor="#22c55e"
                                    stopOpacity={0.8}
                                />

                                <stop
                                    offset="95%"
                                    stopColor="#22c55e"
                                    stopOpacity={0}
                                />

                            </linearGradient>

                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#27272a"
                        />

                        <XAxis
                            dataKey="date"
                            stroke="#a1a1aa"
                        />

                        <YAxis
                            stroke="#a1a1aa"
                        />

                        <Tooltip
                            contentStyle={{
                                background:
                                    "#18181b",

                                border:
                                    "1px solid #27272a",

                                borderRadius:
                                    "16px",

                                color:
                                    "#fff",
                            }}

                            formatter={(value) =>
                                formatCurrency(
                                    value
                                )
                            }
                        />

                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8b5cf6"
                            fillOpacity={1}
                            fill="url(#revenue)"
                            strokeWidth={3}
                        />

                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="#22c55e"
                            fillOpacity={1}
                            fill="url(#profit)"
                            strokeWidth={3}
                        />

                    </AreaChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}