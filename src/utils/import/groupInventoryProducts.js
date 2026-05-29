// ====================================
// GROUP INVENTORY PRODUCTS
// ====================================

const groupInventoryProducts = ({
    rows = [],
}) => {

    // ====================================
    // GROUPED OBJECT
    // ====================================

    const groupedProducts = {};

    // ====================================
    // LOOP ROWS
    // ====================================

    rows.forEach((row) => {

        const parentSKU =
            String(
                row.parentSKU || ""
            )
                .trim()
                .toUpperCase();

        const size =
            String(
                row.size || ""
            )
                .trim()
                .toUpperCase();

        // ====================================
        // SKIP INVALID
        // ====================================

        if (
            !parentSKU ||
            !size
        ) {

            return;
        }

        // ====================================
        // CREATE PRODUCT
        // ====================================

        if (
            !groupedProducts[
            parentSKU
            ]
        ) {

            groupedProducts[
                parentSKU
            ] = {

                category:
                    row.category || "",

                subCategory:
                    row.subCategory || "",

                productName:
                    row.productName || "",

                brand:
                    row.brand || "",

                color:
                    row.color || "",

                parentSKU,

                variants: {},
            };
        }

        // ====================================
        // VARIANT SKU
        // ====================================

        const variantSKU =
            row.variantSku ||

            `${parentSKU}-${size}`;

        // ====================================
        // CREATE VARIANT
        // ====================================

        if (
            groupedProducts[parentSKU]
                .variants[size]
        ) {

            return;
        }

        groupedProducts[
            parentSKU
        ].variants[size] = {

            size,

            color:
                row.color || "",

            sku:
                variantSKU,

            skuHistory: [],

            batchNo:
                row.batchNo || "",

            barcode:
                row.barcode || "",

            qty:
                Number(
                    row.qty || 0
                ),

            reservedQty: 0,

            damagedQty: 0,

            soldQty: 0,

            initialQty:
                Number(
                    row.qty || 0
                ),

            lowStockAlert:
                Number(
                    row.lowStockAlert || 0
                ),

            buyingPrice:
                Number(
                    row.buyingPrice || 0
                ),

            marginPercent:
                Number(
                    row.marginPercent || 0
                ),

            gstPercent:
                Number(
                    row.gstPercent || 0
                ),

            extraCosts: {

                packaging:
                    Number(
                        row.packaging || 0
                    ),

                labeling:
                    Number(
                        row.labeling || 0
                    ),

                rto:
                    Number(
                        row.rto || 0
                    ),

                return:
                    Number(
                        row.return || 0
                    ),

                advertisement:
                    Number(
                        row.advertisement || 0
                    ),

                delivery:
                    Number(
                        row.delivery || 0
                    ),

                others:
                    Number(
                        row.others || 0
                    ),
            },

            totalExtraCost: 0,

            sellingPrice:
                Number(
                    row.sellingPrice || 0
                ),

            inventoryHistory: [],

            qrEnabled: true,

            qrGenerated: false,

            qrPrinted: false,

            marketplaces: {

                meesho: {

                    sellingPrice:
                        Number(
                            row.meeshoSellingPrice ||

                            row.sellingPrice ||

                            0
                        ),

                    mrp:
                        Number(
                            row.meeshoMrp ||

                            0
                        ),
                },

                amazon: {

                    sellingPrice:
                        Number(
                            row.amazonSellingPrice ||

                            row.sellingPrice ||

                            0
                        ),

                    mrp:
                        Number(
                            row.amazonMrp ||

                            0
                        ),
                },

                flipkart: {

                    sellingPrice:
                        Number(
                            row.flipkartSellingPrice ||

                            row.sellingPrice ||

                            0
                        ),

                    mrp:
                        Number(
                            row.flipkartMrp ||

                            0
                        ),
                },
            },
        };
    });

    // ====================================
    // RETURN ARRAY
    // ====================================

    return Object.values(
        groupedProducts
    );
};

export default groupInventoryProducts;