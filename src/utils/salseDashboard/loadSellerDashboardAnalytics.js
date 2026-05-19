import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import buildBusinessInsights
    from "./buildBusinessInsights";

// ====================================
// LOAD SELLER DASHBOARD ANALYTICS
// ====================================

const loadSellerDashboardAnalytics =
    async ({
        user,
    }) => {

        try {

            // ====================================
            // LOAD PRODUCTS
            // ====================================

            const productsQuery =
                query(

                    collection(
                        db,
                        "products"
                    ),

                    where(
                        "sellerId",
                        "==",
                        user.uid
                    )
                );

            const productsSnap =
                await getDocs(
                    productsQuery
                );

            const products =
                productsSnap.docs.map(
                    (doc) => ({

                        id:
                            doc.id,

                        ...doc.data(),
                    })
                );

            // ====================================
            // LOAD ORDERS
            // ====================================

            const ordersQuery =
                query(

                    collection(
                        db,
                        "orders"
                    ),

                    where(
                        "sellerId",
                        "==",
                        user.uid
                    )
                );

            const ordersSnap =
                await getDocs(
                    ordersQuery
                );

            const orders =
                ordersSnap.docs.map(
                    (doc) => ({

                        id:
                            doc.id,

                        ...doc.data(),
                    })
                );

            // ====================================
            // KPI
            // ====================================

            let totalRevenue = 0;

            let totalCost = 0;

            let totalProfit = 0;

            let totalSoldQty = 0;

            let remainingInventory = 0;

            let remainingInventoryValue = 0;

            let expectedProfit = 0;

            // ====================================
            // STATUS COUNTS
            // ====================================

            const orderStatusCounts = {

                Delivered: 0,

                Shipped: 0,

                Pending: 0,

                Cancelled: 0,

                RTO: 0,
            };

            // ====================================
            // TOP PRODUCTS
            // ====================================

            const topProductsMap =
                {};

            // ====================================
            // PROCESS ORDERS
            // ====================================

            orders.forEach(
                (order) => {

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
                        sellingPrice * qty;

                    const cost =
                        buyingPrice * qty;

                    const profit =
                        revenue - cost;

                    totalRevenue +=
                        revenue;

                    totalCost +=
                        cost;

                    totalProfit +=
                        profit;

                    totalSoldQty +=
                        qty;

                    // ====================================
                    // STATUS
                    // ====================================

                    const status =
                        order.orderStatus ||
                        "Pending";

                    if (
                        orderStatusCounts[
                        status
                        ] !== undefined
                    ) {

                        orderStatusCounts[
                            status
                        ] += qty;
                    }

                    // ====================================
                    // SKU ANALYTICS
                    // ====================================

                    const sku =
                        order.parentSKU ||
                        "UNKNOWN";

                    if (
                        !topProductsMap[
                        sku
                        ]
                    ) {

                        topProductsMap[
                            sku
                        ] = {

                            sku,

                            delivered: 0,

                            shipped: 0,

                            pending: 0,

                            cancelled: 0,

                            rto: 0,

                            totalSold: 0,

                            revenue: 0,

                            profit: 0,
                        };
                    }

                    const productRef =
                        topProductsMap[
                        sku
                        ];

                    productRef.totalSold +=
                        qty;

                    productRef.revenue +=
                        revenue;

                    productRef.profit +=
                        profit;

                    // ====================================
                    // STATUS UPDATE
                    // ====================================

                    switch (status) {

                        case "Delivered":

                            productRef.delivered +=
                                qty;

                            break;

                        case "Shipped":

                            productRef.shipped +=
                                qty;

                            break;

                        case "Cancelled":

                            productRef.cancelled +=
                                qty;

                            break;

                        case "RTO":

                            productRef.rto +=
                                qty;

                            break;

                        default:

                            productRef.pending +=
                                qty;
                    }
                }
            );

            // ====================================
            // INVENTORY
            // ====================================

            products.forEach(
                (product) => {

                    Object.values(
                        product.variants || {}
                    ).forEach(
                        (variant) => {

                            const qty =
                                Number(
                                    variant.qty || 0
                                );

                            const buyingPrice =
                                Number(
                                    variant.buyingPrice || 0
                                );

                            const sellingPrice =
                                Number(
                                    variant.sellingPrice || 0
                                );

                            remainingInventory +=
                                qty;

                            remainingInventoryValue +=
                                qty *
                                buyingPrice;

                            expectedProfit +=
                                (
                                    sellingPrice -
                                    buyingPrice
                                ) * qty;
                        }
                    );
                }
            );

            // ====================================
            // SORT TOP PRODUCTS
            // ====================================

            const topProducts =
                Object.values(
                    topProductsMap
                )
                    .sort(
                        (
                            a,
                            b
                        ) =>

                            b.totalSold -
                            a.totalSold
                    )
                    .slice(0, 10);

            // ====================================
            // RECENT SALES
            // ====================================

            const recentSales =
                [...orders]
                    .sort(
                        (
                            a,
                            b
                        ) => {

                            const dateA =
                                a.createdAt?.seconds || 0;

                            const dateB =
                                b.createdAt?.seconds || 0;

                            return (
                                dateB -
                                dateA
                            );
                        }
                    )
                    .slice(0, 10);

            // ====================================
            // DAILY ANALYTICS
            // ====================================

            const dailyMap = {};

            orders.forEach((order) => {

                const date =
                    order.createdAt?.seconds

                        ?

                        new Date(
                            order.createdAt.seconds
                            * 1000
                        )

                        :

                        new Date();

                const day =
                    date.toLocaleDateString(
                        "en-IN",
                        {

                            day: "2-digit",

                            month: "short",
                        }
                    );

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
                    qty * sellingPrice;

                const profit =
                    qty *
                    (
                        sellingPrice -
                        buyingPrice
                    );

                if (
                    !dailyMap[day]
                ) {

                    dailyMap[day] = {

                        date: day,

                        revenue: 0,

                        profit: 0,
                    };
                }

                dailyMap[day].revenue +=
                    revenue;

                dailyMap[day].profit +=
                    profit;
            });

            const revenueAnalytics =
                Object.values(
                    dailyMap
                );

            // ====================================
            // BUSINESS INSIGHTS
            // ====================================

            const insights =
                buildBusinessInsights({

                    topProducts,

                    products,
                });

            // ====================================
            // RETURN
            // ====================================

            return {

                totalProducts:
                    products.length,

                totalOrders:
                    orders.length,

                totalRevenue,

                totalCost,

                totalProfit,

                totalSoldQty,

                remainingInventory,

                remainingInventoryValue,

                expectedProfit,

                orderStatusCounts,

                topProducts,

                recentSales,

                revenueAnalytics,

                insights,
            };

        } catch (err) {

            console.error(err);

            throw err;
        }
    };

export default loadSellerDashboardAnalytics;