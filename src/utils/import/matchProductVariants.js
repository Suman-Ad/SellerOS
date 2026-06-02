// utils/import/matchProductVariants.js
import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

// ====================================
// MATCH PRODUCT VARIANTS
// ====================================

const matchProductVariants = async ({
    rows = [],
    user,
}) => {

    try {

        // ====================================
        // LOAD PRODUCTS
        // ====================================

        const productQuery = query(
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

        const productSnap =
            await getDocs(
                productQuery
            );

        const products =
            productSnap.docs.map(
                (doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })
            );

        // ====================================
        // RESULT
        // ====================================

        const matched = [];

        const unmatched = [];

        // ====================================
        // LOOP ROWS
        // ====================================

        for (const row of rows) {

            // ====================================
            // BASIC
            // ====================================

            const parentSKU =
                String(
                    row.parentSKU || ""
                )
                    .trim()
                    .toLowerCase();

            const productId =
                String(
                    row.productId || ""
                )
                    .trim()
                    .toLowerCase();

            const variantSize =
                String(
                    row.variantSize || ""
                )
                    .trim()
                    .toUpperCase();

            const qty =
                Number(
                    row.qty || 1
                );

            // ====================================
            // FIND PRODUCT
            // ====================================

            const matchedProduct =
                products.find(
                    (product) => {

                        // ====================================
                        // PARENT SKU
                        // ====================================

                        const parentSkuMatch =

                            parentSKU &&

                            String(
                                product.parentSKU || ""
                            )
                                .trim()
                                .toLowerCase()

                            ===

                            parentSKU;

                        // ====================================
                        // PRODUCT ID
                        // ====================================

                        const productIdMatch =

                            productId &&

                            String(
                                product.id || ""
                            )
                                .trim()
                                .toLowerCase()

                            ===

                            productId;

                        return (
                            parentSkuMatch ||
                            productIdMatch
                        );
                    }
                );

            // ====================================
            // PRODUCT NOT FOUND
            // ====================================

            if (!matchedProduct) {

                unmatched.push({

                    row,

                    reason:
                        "Product not found",
                });

                continue;
            }

            // ====================================
            // VARIANTS
            // ====================================

            const variants =
                matchedProduct.variants || {};

            const matchedVariant =
                variants?.[
                    variantSize
                ];

            // ====================================
            // VARIANT NOT FOUND
            // ====================================

            if (!matchedVariant) {

                unmatched.push({

                    row,

                    reason:
                        "Variant size not found",
                });

                continue;
            }

            // ====================================
            // INVENTORY
            // ====================================

            const availableQty =
                Number(
                    matchedVariant.qty || 0
                );

            if (
                availableQty < qty
            ) {

                unmatched.push({

                    row,

                    reason:
                        "Insufficient inventory",

                    availableQty,
                });

                continue;
            }

            // ====================================
            // MATCHED
            // ====================================

            matched.push({

                row,

                product: matchedProduct,

                variant: matchedVariant,

                variantSize,

                availableQty,

                qty,

                status:
                    "matched",
            });
        }

        // ====================================
        // RETURN
        // ====================================

        return {

            matched,

            unmatched,
        };

    } catch (err) {

        console.error(err);

        throw err;
    }
};

export default matchProductVariants;