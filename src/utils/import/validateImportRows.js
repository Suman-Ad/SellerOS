const validateImportRows = (
    rows = []
) => {

    try {

        const validRows = [];

        const invalidRows = [];

        const duplicateRows = [];

        // ====================================
        // TRACK DUPLICATES INSIDE FILE
        // ====================================

        const seenOrders =
            new Set();

        // ====================================
        // LOOP ROWS
        // ====================================

        rows.forEach((row) => {

            // ====================================
            // ORDER ID
            // ====================================

            const platformOrderId =
                String(
                    row.platformOrderId || ""
                ).trim();

            if (!platformOrderId) {

                invalidRows.push({
                    row,

                    reason:
                        "Missing platform order ID",
                });

                return;
            }

            // ====================================
            // DUPLICATE CHECK
            // ====================================

            const duplicateKey = [
                row.platform,
                platformOrderId,
            ].join("_");

            if (
                seenOrders.has(
                    duplicateKey
                )
            ) {

                duplicateRows.push({
                    row,

                    reason:
                        "Duplicate order inside file",
                });

                return;
            }

            seenOrders.add(
                duplicateKey
            );

            // ====================================
            // PRODUCT CHECK
            // ====================================

            const hasProductReference =
                row.parentSKU ||
                row.productId;

            if (
                !hasProductReference
            ) {

                invalidRows.push({
                    row,

                    reason:
                        "Missing parent SKU and product ID",
                });

                return;
            }

            // ====================================
            // SIZE CHECK
            // ====================================

            const variantSize =
                String(
                    row.variantSize || ""
                ).trim();

            if (!variantSize) {

                invalidRows.push({
                    row,

                    reason:
                        "Missing variant size",
                });

                return;
            }

            // ====================================
            // QTY
            // ====================================

            const qty =
                Number(
                    row.qty || 0
                );

            if (
                Number.isNaN(qty) ||
                qty <= 0
            ) {

                invalidRows.push({
                    row,

                    reason:
                        "Invalid quantity",
                });

                return;
            }

            // ====================================
            // PRICE
            // ====================================

            const sellingPrice =
                Number(
                    row.sellingPrice || 0
                );

            if (
                Number.isNaN(
                    sellingPrice
                ) ||
                sellingPrice < 0
            ) {

                invalidRows.push({
                    row,

                    reason:
                        "Invalid selling price",
                });

                return;
            }

            // ====================================
            // VALID
            // ====================================

            validRows.push(row);
        });

        // ====================================
        // RETURN
        // ====================================

        return {

            validRows,

            invalidRows,

            duplicateRows,
        };

    } catch (err) {

        console.error(err);

        throw err;
    }
};

export default validateImportRows;