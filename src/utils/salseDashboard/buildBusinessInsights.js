// ====================================
// BUILD BUSINESS INSIGHTS
// ====================================

const buildBusinessInsights = ({
    topProducts = [],
    products = [],
}) => {

    try {

        // ====================================
        // EMPTY
        // ====================================

        if (!topProducts.length) {

            return {
                bestSeller: null,
                worstSeller: null,
                highestRTO: null,
                highestCancelled: null,
                lowStockProducts: [],
                deadStockProducts: [],
                fastMovingProducts: [],
            };
        }

        // ====================================
        // BEST SELLER
        // ====================================

        const bestSeller =
            [...topProducts]
                .sort(
                    (
                        a,
                        b
                    ) =>

                        b.totalSold -
                        a.totalSold
                )[0];

        // ====================================
        // WORST SELLER
        // ====================================

        const worstSeller =
            [...topProducts]
                .sort(
                    (
                        a,
                        b
                    ) =>

                        a.totalSold -
                        b.totalSold
                )[0];

        // ====================================
        // HIGHEST RTO
        // ====================================

        const highestRTO =
            [...topProducts]
                .sort(
                    (
                        a,
                        b
                    ) =>

                        b.rto -
                        a.rto
                )[0];

        // ====================================
        // HIGHEST CANCELLED
        // ====================================

        const highestCancelled =
            [...topProducts]
                .sort(
                    (
                        a,
                        b
                    ) =>

                        b.cancelled -
                        a.cancelled
                )[0];

        // ====================================
        // LOW STOCK
        // ====================================

        const lowStockProducts =
            [];

        // ====================================
        // DEAD STOCK
        // ====================================

        const deadStockProducts =
            [];

        // ====================================
        // FAST MOVING
        // ====================================

        const fastMovingProducts =
            [];

        // ====================================
        // LOOP PRODUCTS
        // ====================================

        products.forEach(
            (product) => {

                let totalQty = 0;

                Object.values(
                    product.variants || {}
                ).forEach(
                    (variant) => {

                        totalQty +=
                            Number(
                                variant.qty || 0
                            );
                    }
                );

                // ====================================
                // LOW STOCK
                // ====================================

                if (
                    totalQty > 0 &&
                    totalQty <= 5
                ) {

                    lowStockProducts.push({

                        parentSKU:
                            product.parentSKU,

                        productName:
                            product.productName,

                        qty:
                            totalQty,
                    });
                }

                // ====================================
                // DEAD STOCK
                // ====================================

                const analytics =
                    topProducts.find(
                        (item) =>

                            item.sku ===
                            product.parentSKU
                    );

                if (
                    !analytics ||
                    analytics.totalSold === 0
                ) {

                    deadStockProducts.push({

                        parentSKU:
                            product.parentSKU,

                        productName:
                            product.productName,

                        qty:
                            totalQty,
                    });
                }

                // ====================================
                // FAST MOVING
                // ====================================

                if (
                    analytics &&
                    analytics.totalSold >= 20
                ) {

                    fastMovingProducts.push({

                        parentSKU:
                            product.parentSKU,

                        productName:
                            product.productName,

                        sold:
                            analytics.totalSold,
                    });
                }
            }
        );

        // ====================================
        // RETURN
        // ====================================

        return {

            bestSeller,

            worstSeller,

            highestRTO,

            highestCancelled,

            lowStockProducts:
                lowStockProducts.slice(
                    0,
                    10
                ),

            deadStockProducts:
                deadStockProducts.slice(
                    0,
                    10
                ),

            fastMovingProducts:
                fastMovingProducts.slice(
                    0,
                    10
                ),
        };

    } catch (err) {

        console.error(err);

        return {

            bestSeller: null,
            worstSeller: null,
            highestRTO: null,
            highestCancelled: null,
            lowStockProducts: [],
            deadStockProducts: [],
            fastMovingProducts: [],
        };
    }
};

export default buildBusinessInsights;