import Papa from "papaparse";
import * as XLSX from "xlsx";

const HEADER_MAP = {
    category: "category",

    subcategory: "subCategory",
    sub_category: "subCategory",

    brand: "brand",

    color: "color",

    parentsku: "parentSKU",
    parent_sku: "parentSKU",

    size: "size",

    qty: "qty",
    quantity: "qty",

    buyingprice: "buyingPrice",
    buying_price: "buyingPrice",

    marginpercent: "marginPercent",
    margin_percent: "marginPercent",

    gstpercent: "gstPercent",
    gst_percent: "gstPercent",

    packaging: "packaging",
    labeling: "labeling",
    rto: "rto",
    return: "return",

    advertisement: "advertisement",
    delivery: "delivery",
    others: "others",

    barcode: "barcode",

    lowstockalert: "lowStockAlert",
    low_stock_alert: "lowStockAlert",
};

const NUMBER_FIELDS = [
    "qty",
    "buyingPrice",
    "marginPercent",
    "gstPercent",
    "packaging",
    "labeling",
    "rto",
    "return",
    "advertisement",
    "delivery",
    "others",
    "lowStockAlert",
];

const REQUIRED_COLUMNS = [
    "category",
    "subCategory",
    "brand",
    "color",
    "size",
    "qty",
    "buyingPrice",
];

const normalizeRow = (row) => {

    const normalized = {};

    Object.entries(row).forEach(
        ([key, value]) => {

            const cleanKey =
                String(key)
                    .trim()
                    .replace(/\s+/g, "")
                    .toLowerCase();

            const mappedKey =
                HEADER_MAP[cleanKey] || key;

            if (
                typeof value === "string"
            ) {

                normalized[mappedKey] =
                    value.trim();

            } else {

                normalized[mappedKey] =
                    value;
            }
        }
    );

    NUMBER_FIELDS.forEach(
        (field) => {

            if (
                normalized[field] !== undefined &&
                normalized[field] !== null &&
                normalized[field] !== ""
            ) {

                const parsed =
                    Number(normalized[field]);

                normalized[field] =
                    Number.isNaN(parsed)
                        ? 0
                        : parsed;
            }
        }
    );

    return normalized;
};

const validateColumns = (
    rows
) => {

    if (!rows.length) {

        throw new Error(
            "No rows found in file"
        );
    }

    const headers =
        Object.keys(rows[0]);

    const missing =
        REQUIRED_COLUMNS.filter(
            (field) =>
                !headers.includes(field)
        );

    if (missing.length) {

        throw new Error(
            `Missing required columns: ${missing.join(
                ", "
            )}`
        );
    }
};

export const parseInternalFile = (
    file
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();

            // ====================================
            // CSV
            // ====================================

            if (
                extension === "csv"
            ) {

                Papa.parse(file, {

                    header: true,

                    skipEmptyLines: true,

                    complete: (
                        results
                    ) => {

                        try {

                            const normalizedRows =
                                results.data.map(
                                    normalizeRow
                                );

                            validateColumns(
                                normalizedRows
                            );

                            resolve(
                                normalizedRows
                            );

                        } catch (error) {

                            reject(error);
                        }
                    },

                    error: (
                        error
                    ) => {

                        reject(error);
                    },
                });

                return;
            }

            // ====================================
            // XLSX / XLS
            // ====================================

            if (
                extension === "xlsx" ||
                extension === "xls"
            ) {

                const reader =
                    new FileReader();

                reader.onload = (
                    e
                ) => {

                    try {

                        const data =
                            new Uint8Array(
                                e.target
                                    .result
                            );

                        const workbook =
                            XLSX.read(
                                data,
                                {
                                    type:
                                        "array",
                                }
                            );

                        const sheet =
                            workbook.Sheets[
                            workbook
                                .SheetNames[0]
                            ];

                        const json =
                            XLSX.utils.sheet_to_json(
                                sheet,
                                {
                                    defval:
                                        "",
                                }
                            );

                        const normalizedRows =
                            json.map(
                                normalizeRow
                            );

                        validateColumns(
                            normalizedRows
                        );

                        resolve(
                            normalizedRows
                        );

                    } catch (error) {

                        reject(error);
                    }
                };

                reader.onerror =
                    reject;

                reader.readAsArrayBuffer(
                    file
                );

                return;
            }

            reject(
                new Error(
                    "Unsupported file type"
                )
            );
        }
    );
};