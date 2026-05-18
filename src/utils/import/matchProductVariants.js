// import {
//   collection,
//   getDocs,
//   query,
//   where,
// } from "firebase/firestore";

// import { db } from "@/firebase/config";

// import normalizeSize from "./normalizeImportRows";

// const matchInventory = async ({
//   rows,
//   user,
// }) => {

//   try {

//     // ====================================
//     // LOAD STOCKS
//     // ====================================

//     const stockQuery = query(
//       collection(db, "stocks"),

//       where(
//         "userId",
//         "==",
//         user.uid
//       )
//     );

//     const stockSnap =
//       await getDocs(stockQuery);

//     const stocks =
//       stockSnap.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//     const matched = [];

//     const unmatched = [];

//     // ====================================
//     // LOOP ROWS
//     // ====================================

//     for (const row of rows) {

//       const catalogValue =
//         row.catalogId;

//       const productValue =
//         row.productId;

//       const sizeValue =
//         normalizeSize(row.size);

//       const qty =
//         Number(row.qty) || 1;

//       // ====================================
//       // FIND STOCK
//       // ====================================

//       const stockMatch =
//         stocks.find((stock) => {

//           const catalogMatch =
//             catalogValue &&
//             stock.catalogId
//               ?.toLowerCase()

//             ===

//             String(catalogValue)
//               .toLowerCase();

//           const productMatch =
//             productValue &&
//             stock.productId
//               ?.toLowerCase()

//             ===

//             String(productValue)
//               .toLowerCase();

//           return (
//             catalogMatch ||
//             productMatch
//           );
//         });

//       // ====================================
//       // VALIDATE SIZE
//       // ====================================

//       if (
//         stockMatch &&
//         stockMatch.sizes?.[
//           sizeValue
//         ]
//       ) {

//         const sizeStock =
//           stockMatch.sizes[
//             sizeValue
//           ];

//         const availableQty =
//           sizeStock.qty || 0;

//         if (availableQty >= qty) {

//           matched.push({
//             row,

//             stock: stockMatch,

//             size: sizeValue,

//             qty,

//             availableQty,

//             status: "matched",
//           });

//         } else {

//           unmatched.push({
//             row,

//             reason:
//               "Insufficient stock",
//           });
//         }

//       } else {

//         unmatched.push({
//           row,

//           reason:
//             "Product/Size not found",
//         });
//       }
//     }

//     return {
//       matched,
//       unmatched,
//     };

//   } catch (err) {

//     console.error(err);

//     throw err;
//   }
// };

// export default matchInventory;

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