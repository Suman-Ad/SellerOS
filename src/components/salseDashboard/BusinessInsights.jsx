import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    RotateCcw,
    Boxes,
    Flame,
} from "lucide-react";

// ====================================
// INSIGHT CARD
// ====================================

const InsightCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}) => {

    return (

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

            <div className="flex items-start justify-between">

                <div>

                    <div className="text-sm text-zinc-400">

                        {title}

                    </div>

                    <div className="text-xl font-bold text-white mt-3">

                        {value || "-"}
                    </div>

                    <div className="text-sm text-zinc-500 mt-2">

                        {subtitle || "-"}
                    </div>

                </div>

                <div className={`p-3 rounded-2xl ${color}`}>

                    <Icon size={22} />

                </div>

            </div>

        </div>
    );
};

// ====================================
// COMPONENT
// ====================================

export default function BusinessInsights({
    insights,
}) {

    return (

        <div className="space-y-6">

            {/* TOP INSIGHTS */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                <InsightCard
                    title="Best Seller"
                    value={
                        insights.bestSeller?.sku
                    }
                    subtitle={`Sold ${insights.bestSeller?.totalSold || 0
                        } qty`}
                    icon={TrendingUp}
                    color="bg-green-500/10 text-green-400"
                />

                <InsightCard
                    title="Worst Seller"
                    value={
                        insights.worstSeller?.sku
                    }
                    subtitle={`Sold ${insights.worstSeller?.totalSold || 0
                        } qty`}
                    icon={TrendingDown}
                    color="bg-red-500/10 text-red-400"
                />

                <InsightCard
                    title="Highest RTO"
                    value={
                        insights.highestRTO?.sku
                    }
                    subtitle={`${insights.highestRTO?.rto || 0
                        } RTO qty`}
                    icon={RotateCcw}
                    color="bg-orange-500/10 text-orange-400"
                />

                <InsightCard
                    title="Highest Cancelled"
                    value={
                        insights.highestCancelled?.sku
                    }
                    subtitle={`${insights.highestCancelled?.cancelled || 0
                        } cancelled qty`}
                    icon={AlertTriangle}
                    color="bg-yellow-500/10 text-yellow-400"
                />

            </div>

            {/* INVENTORY INSIGHTS */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                {/* LOW STOCK */}

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

                    <div className="p-5 border-b border-zinc-800">

                        <h2 className="font-bold text-white flex items-center gap-2">

                            <Boxes
                                size={18}
                            />

                            Low Stock Alerts

                        </h2>

                    </div>

                    <div className="divide-y divide-zinc-800">

                        {insights.lowStockProducts.map(
                            (
                                item,
                                index
                            ) => (

                                <div
                                    key={index}
                                    className="p-4"
                                >

                                    <div className="font-medium text-white">

                                        {item.parentSKU}

                                    </div>

                                    <div className="text-sm text-zinc-400 mt-1">

                                        Qty:
                                        {" "}
                                        {item.qty}
                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </div>

                {/* FAST MOVING */}

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

                    <div className="p-5 border-b border-zinc-800">

                        <h2 className="font-bold text-white flex items-center gap-2">

                            <Flame
                                size={18}
                            />

                            Fast Moving Products

                        </h2>

                    </div>

                    <div className="divide-y divide-zinc-800">

                        {insights.fastMovingProducts.map(
                            (
                                item,
                                index
                            ) => (

                                <div
                                    key={index}
                                    className="p-4"
                                >

                                    <div className="font-medium text-white">

                                        {item.parentSKU}

                                    </div>

                                    <div className="text-sm text-zinc-400 mt-1">

                                        Sold:
                                        {" "}
                                        {item.sold}
                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </div>

                {/* DEAD STOCK */}

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

                    <div className="p-5 border-b border-zinc-800">

                        <h2 className="font-bold text-white flex items-center gap-2">

                            <AlertTriangle
                                size={18}
                            />

                            Dead Stock

                        </h2>

                    </div>

                    <div className="divide-y divide-zinc-800">

                        {insights.deadStockProducts.map(
                            (
                                item,
                                index
                            ) => (

                                <div
                                    key={index}
                                    className="p-4"
                                >

                                    <div className="font-medium text-white">

                                        {item.parentSKU}

                                    </div>

                                    <div className="text-sm text-zinc-400 mt-1">

                                        Qty:
                                        {" "}
                                        {item.qty}
                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}