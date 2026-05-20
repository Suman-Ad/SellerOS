const generateParentSKU = (
    row
) => {

    const product =
        `${row.productName
            ?.substring(0, 3)
            .toUpperCase()}-${row.subCategory
                ?.substring(0, 3)
                .toUpperCase()
        }-${row.color
            ?.substring(0, 2)
            .toUpperCase()
        }`;

    const random =
        Math.floor(
            100 +
            Math.random() * 900000
        );

    return `${product}-${random}`;
};

const generateBatchNo = (
    row,
    index
) => {

    const now =
        new Date();

    const year =
        now
            .getFullYear()
            .toString()
            .slice(-2);

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const productPrefix =
        row.subCategory
            ?.substring(0, 3)
            .toUpperCase();

    return `${productPrefix}-${year}${month}-${String(
        index + 1
    ).padStart(3, "0")}-${row.size}`;
};

export const groupInternalProducts = (
    rows
) => {

    const grouped = {};

    rows.forEach(
        (
            row,
            index
        ) => {

            const key =
                `${row.productName}-${row.color}-${row.subCategory}`;

            if (
                !grouped[key]
            ) {

                grouped[key] = {

                    category:
                        row.category,

                    subCategory:
                        row.subCategory,

                    productName:
                        row.productName,

                    brand:
                        row.brand || "",

                    color:
                        row.color,

                    parentSKU:
                        generateParentSKU(
                            row
                        ),

                    variants: {},
                };
            }

            const parentSKU =
                grouped[key]
                    .parentSKU;

            const variantSKU =
                `${parentSKU}-${row.color
                    ?.substring(0, 3)
                    .toUpperCase()}-${row.size}`;

            grouped[
                key
            ].variants[
                row.size
            ] = {

                size: row.size,

                color:
                    row.color,

                sku:
                    variantSKU,

                skuHistory: [],

                batchNo:
                    generateBatchNo(
                        row,
                        index
                    ),

                barcode:
                    row.barcode ||
                    "",

                qty: Number(
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
                        row.lowStockAlert ||
                        0
                    ),

                buyingPrice:
                    Number(
                        row.buyingPrice ||
                        0
                    ),

                sellingPrice:
                    Number(
                        row.sellingPrice ||
                        0
                    ),

                inventoryHistory:
                    [
                        {
                            type:
                                "initial_import",

                            qty:
                                Number(
                                    row.qty || 0
                                ),

                            date:
                                new Date(),

                            note:
                                "Bulk inventory import",
                        },
                    ],

                qrEnabled: true,

                qrGenerated: false,

                qrPrinted: false,

                marketplaces: {

                    meesho: {
                        sellingPrice:
                            Number(
                                row.sellingPrice ||
                                0
                            ),

                        mrp:
                            Number(
                                row.sellingPrice ||
                                0
                            ),
                    },

                    amazon: {
                        sellingPrice:
                            Number(
                                row.sellingPrice ||
                                0
                            ),

                        mrp:
                            Number(
                                row.sellingPrice ||
                                0
                            ),
                    },

                    flipkart: {
                        sellingPrice:
                            Number(
                                row.sellingPrice ||
                                0
                            ),

                        mrp:
                            Number(
                                row.sellingPrice ||
                                0
                            ),
                    },
                },
            };
        }
    );

    return Object.values(
        grouped
    );
};