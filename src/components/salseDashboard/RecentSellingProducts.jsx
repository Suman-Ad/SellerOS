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
// STATUS BADGE
// ====================================

const StatusBadge = ({
    status,
}) => {

    const styles = {

        Delivered:
            "bg-green-500/10 text-green-400",

        Shipped:
            "bg-blue-500/10 text-blue-400",

        Pending:
            "bg-yellow-500/10 text-yellow-400",

        Cancelled:
            "bg-red-500/10 text-red-400",

        RTO:
            "bg-orange-500/10 text-orange-400",
    };

    return (

        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] ||
                "bg-zinc-700 text-zinc-300"
                }`}
        >

            {status}

        </span>
    );
};

// ====================================
// COMPONENT
// ====================================

export default function RecentSellingProducts({
    sales = [],
}) {

    return (

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

            {/* HEADER */}

            <div className="p-5 border-b border-zinc-800">

                <h2 className="text-xl font-bold text-white">

                    Recent Selling Products

                </h2>

                <p className="text-sm text-zinc-400 mt-1">

                    Latest marketplace order activities

                </p>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px]">

                    <thead className="bg-zinc-950 border-b border-zinc-800">

                        <tr>

                            {[
                                "Product",
                                "SKU",
                                "Qty",
                                "Selling Price",
                                "Buying Price",
                                "Revenue",
                                "Profit",
                                "Status",
                                "Date",
                            ].map((head) => (

                                <th
                                    key={head}
                                    className="px-4 py-4 text-left text-sm font-semibold text-zinc-300"
                                >

                                    {head}

                                </th>
                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        {sales.map(
                            (
                                order,
                                index
                            ) => {

                                const qty =
                                    Number(
                                        order.qty || 0
                                    );

                                const sellingPrice =
                                    Number(
                                        order.sellingPrice || 0
                                    );

                                const buyingPrice =
                                    Number(
                                        order.buyingPrice || 0
                                    );

                                const revenue =
                                    qty *
                                    sellingPrice;

                                const profit =
                                    qty *
                                    (
                                        sellingPrice -
                                        buyingPrice
                                    );

                                const orderDate =
                                    order.createdAt?.seconds

                                        ?

                                        new Date(
                                            order.createdAt.seconds * 1000
                                        ).toLocaleDateString()

                                        :

                                        "-";

                                return (

                                    <tr
                                        key={index}
                                        className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
                                    >

                                        {/* PRODUCT */}

                                        <td className="px-4 py-4">

                                            <div>

                                                <div className="font-semibold text-white">

                                                    {order.productName ||
                                                        "-"}

                                                </div>

                                                <div className="text-xs text-zinc-500 mt-1">

                                                    {order.variantSize ||
                                                        "-"}

                                                </div>

                                            </div>

                                        </td>

                                        {/* SKU */}

                                        <td className="px-4 py-4 font-medium text-zinc-300">

                                            {order.parentSKU ||
                                                "-"}

                                        </td>

                                        {/* QTY */}

                                        <td className="px-4 py-4">

                                            {qty}

                                        </td>

                                        {/* SELLING */}

                                        <td className="px-4 py-4 text-green-400 font-semibold">

                                            {formatCurrency(
                                                sellingPrice
                                            )}

                                        </td>

                                        {/* BUYING */}

                                        <td className="px-4 py-4 text-zinc-300">

                                            {formatCurrency(
                                                buyingPrice
                                            )}

                                        </td>

                                        {/* REVENUE */}

                                        <td className="px-4 py-4 text-green-400 font-semibold">

                                            {formatCurrency(
                                                revenue
                                            )}

                                        </td>

                                        {/* PROFIT */}

                                        <td className="px-4 py-4 text-violet-400 font-semibold">

                                            {formatCurrency(
                                                profit
                                            )}

                                        </td>

                                        {/* STATUS */}

                                        <td className="px-4 py-4">

                                            <StatusBadge
                                                status={
                                                    order.orderStatus
                                                }
                                            />

                                        </td>

                                        {/* DATE */}

                                        <td className="px-4 py-4 text-zinc-400">

                                            {orderDate}

                                        </td>

                                    </tr>
                                );
                            }
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}