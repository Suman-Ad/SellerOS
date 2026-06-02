import {
    categoryMap,
    sizeCategoryMap,
    productSizeTypeMap,
} from "@/utils/categoryMap";

export const validateInternalRows = (
    rows
) => {

    const errors = [];

    const variantSKUs =
        new Set();

    const barcodes =
        new Set();

    rows.forEach(
        (
            row,
            index
        ) => {

            const requiredFields = [
                "category",
                "subCategory",
                "brand",
                "color",
                "size",
                "qty",
                "buyingPrice",
            ];


            row.category =
                String(
                    row.category || ""
                ).trim();

            row.subCategory =
                String(
                    row.subCategory || ""
                ).trim();

            row.size =
                String(
                    row.size || ""
                ).trim();

            row.color =
                String(
                    row.color || ""
                ).trim();


            if (Number(row.qty) <= 0) {
                errors.push({
                    row: index + 1,
                    field: "qty",
                    message: "qty must be greater than 0",
                });
            }

            if (Number(row.buyingPrice) < 0) {
                errors.push({
                    row: index + 1,
                    field: "buyingPrice",
                    message: "buyingPrice cannot be negative",
                });
            }

            if (
                row.marginPercent !== undefined &&
                Number(row.marginPercent) < 0
            ) {
                errors.push({
                    row: index + 1,
                    field: "marginPercent",
                    message: "marginPercent cannot be negative",
                });
            }

            if (
                row.gstPercent !== undefined &&
                Number(row.gstPercent) < 0
            ) {
                errors.push({
                    row: index + 1,
                    field: "gstPercent",
                    message: "gstPercent cannot be negative",
                });
            }

            const variantSKU =
                `${row.parentSKU || "AUTO"}-${row.color}-${row.size}`
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "");

            if (
                variantSKUs.has(
                    variantSKU
                )
            ) {

                errors.push({
                    row: index + 1,
                    field: "sku",
                    message:
                        "Duplicate variant SKU found",
                });
            }

            variantSKUs.add(
                variantSKU
            );

            const barcode =
                String(
                    row.barcode || ""
                )
                    .trim()
                    .toUpperCase();

            if (barcode) {

                if (
                    barcodes.has(
                        barcode
                    )
                ) {

                    errors.push({
                        row: index + 1,
                        field: "barcode",
                        message:
                            "Duplicate barcode found",
                    });
                }

                barcodes.add(
                    barcode
                );
            }

            if (
                row.category &&
                !categoryMap[row.category]
            ) {

                errors.push({
                    row: index + 1,
                    field: "category",
                    message:
                        `Invalid category: ${row.category}`,
                });
            }

            if (
                row.category &&
                row.subCategory
            ) {

                const validSubCategories =
                    categoryMap[
                    row.category
                    ] || [];

                if (
                    !validSubCategories.includes(
                        row.subCategory
                    )
                ) {

                    errors.push({
                        row: index + 1,
                        field: "subCategory",
                        message:
                            `Invalid subCategory '${row.subCategory}' for category '${row.category}'`,
                    });
                }
            }

            const sizeType =
                productSizeTypeMap?.[
                row.category
                ]?.[
                row.subCategory
                ] || "clothing";

            const validSizes =
                sizeCategoryMap[
                sizeType
                ] || [];

            if (
                row.size &&
                !validSizes.includes(
                    row.size
                )
            ) {

                errors.push({
                    row: index + 1,
                    field: "size",
                    message:
                        `Invalid size '${row.size}' for ${row.subCategory}`,
                });
            }
            requiredFields.forEach(
                (
                    field
                ) => {

                    if (
                        row[
                        field
                        ] ===
                        undefined ||
                        row[
                        field
                        ] === ""
                    ) {

                        errors.push({
                            row:
                                index + 1,

                            field,

                            message:
                                `${field} is required`,
                        });
                    }
                }
            );
        }
    );

    return errors;
};