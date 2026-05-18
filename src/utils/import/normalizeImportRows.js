import importProfiles from "./config/importProfiles";
import normalizeSize from "./normalizeSize";

// ====================================
// GET VALUE FROM PROFILE
// ====================================

const getMappedValue = (
    row,
    possibleFields = []
) => {

    for (const field of possibleFields) {

        // exact match

        if (
            row[field] !== undefined &&
            row[field] !== null &&
            row[field] !== ""
        ) {

            return row[field];
        }

        // case insensitive fallback

        const matchedKey =
            Object.keys(row).find(
                (key) =>
                    key
                        .trim()
                        .toLowerCase()

                    ===

                    field
                        .trim()
                        .toLowerCase()
            );

        if (
            matchedKey &&
            row[matchedKey] !== undefined
        ) {

            return row[matchedKey];
        }
    }

    return "";
};

// ====================================
// NORMALIZE NUMBER
// ====================================

const normalizeNumber = (
    value,
    fallback = 0
) => {

    if (
        value === null ||
        value === undefined
    ) {

        return fallback;
    }

    const cleaned =
        String(value)
            .replace(/,/g, "")
            .replace(/[^0-9.-]/g, "");

    const number =
        Number(cleaned);

    return Number.isNaN(number)
        ? fallback
        : number;
};

// ====================================
// NORMALIZE DATE
// ====================================

const normalizeDate = (
    value
) => {

    if (!value) return null;

    try {

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;
        }

        return date;

    } catch (err) {

        return null;
    }
};

// ====================================
// NORMALIZE STATUS
// ====================================

const normalizeStatus = (
    status = ""
) => {

    const value =
        String(status)
            .trim()
            .toLowerCase();

    if (
        value.includes("deliver")
    ) {

        return "Delivered";
    }

    if (
        value.includes("ship")
    ) {

        return "Shipped";
    }

    if (
        value.includes("rto")
    ) {

        return "RTO";
    }

    if (
        value.includes("cancel")
    ) {

        return "Cancelled";
    }

    return "Pending";
};

// ====================================
// MAIN
// ====================================

const normalizeImportRows = ({
    rows = [],
    platform = "meesho",
    importType = "orders",
    fieldMapping = {},
}) => {

    try {

        // ====================================
        // PROFILE
        // ====================================

        const platformProfile =
            importProfiles?.[
            platform
            ];

        if (!platformProfile) {

            throw new Error(
                `Unsupported platform: ${platform}`
            );
        }

        const profile =
            platformProfile?.[
            importType
            ];

        // ====================================
        // MANUAL FIELD OVERRIDES
        // ====================================

        const mappedProfile = {

            ...profile,
        };

        // CSV Header → Internal Field
        Object.entries(
            fieldMapping
        ).forEach(

            ([csvHeader, internalField]) => {

                if (!internalField) return;

                mappedProfile[
                    internalField
                ] = [

                        csvHeader,

                        ...(profile?.[
                            internalField
                        ] || []),
                    ];
            }
        );

        if (!profile) {

            throw new Error(
                `Missing import profile for ${platform}/${importType}`
            );
        }

        // ====================================
        // NORMALIZE
        // ====================================

        const normalizedRows =
            rows.map((row) => {

                const platformOrderId =
                    String(
                        getMappedValue(
                            row,
                            mappedProfile.orderId
                        )
                    ).trim();

                const orderDate =
                    normalizeDate(
                        getMappedValue(
                            row,
                            mappedProfile.orderDate
                        )
                    );

                const parentSKU =
                    String(
                        getMappedValue(
                            row,
                            mappedProfile.parentSKU
                        )
                    ).trim();

                const productId =
                    String(
                        getMappedValue(
                            row,
                            mappedProfile.productId
                        )
                    ).trim();

                const productName =
                    String(
                        getMappedValue(
                            row,
                            mappedProfile.productName
                        )
                    ).trim();

                const variantSize =
                    normalizeSize(
                        getMappedValue(
                            row,
                            mappedProfile.size
                        )
                    );

                const qty =
                    normalizeNumber(
                        getMappedValue(
                            row,
                            mappedProfile.qty
                        ),
                        1
                    );

                const sellingPrice =
                    normalizeNumber(
                        getMappedValue(
                            row,
                            mappedProfile.sellingPrice
                        ),
                        0
                    );

                const customerName =
                    String(
                        getMappedValue(
                            row,
                            mappedProfile.customerName
                        )
                    ).trim();

                const customerPhone =
                    String(
                        getMappedValue(
                            row,
                            mappedProfile.phone
                        )
                    ).trim();

                const awb =
                    String(
                        getMappedValue(
                            row,
                            mappedProfile.awb
                        )
                    ).trim();

                const orderStatus =
                    normalizeStatus(
                        getMappedValue(
                            row,
                            mappedProfile.orderStatus
                        )
                    );

                return {

                    // ====================================
                    // CORE
                    // ====================================

                    platform,

                    platformOrderId,

                    orderDate,

                    // ====================================
                    // PRODUCT
                    // ====================================

                    parentSKU,

                    productId,

                    productName,

                    variantSize,

                    // ====================================
                    // ORDER
                    // ====================================

                    qty,

                    sellingPrice,

                    // ====================================
                    // CUSTOMER
                    // ====================================

                    customerName,

                    customerPhone,

                    // ====================================
                    // SHIPPING
                    // ====================================

                    awb,

                    // ====================================
                    // STATUS
                    // ====================================

                    orderStatus,

                    // ====================================
                    // RAW
                    // ====================================

                    rawData: row,
                };
            });

        return normalizedRows;

    } catch (err) {

        console.error(err);

        throw err;
    }
};

export default normalizeImportRows;