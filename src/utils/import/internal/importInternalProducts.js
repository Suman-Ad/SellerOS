// import {
//     collection,
//     addDoc,
//     serverTimestamp,
// } from "firebase/firestore";

// import { db }
//     from "@/firebase/config";
// import logActivity
//     from "@/utils/activity/logActivity";

// export const importInternalProducts =
//     async (
//         products,
//         sellerId,
//         userData,
//     ) => {

//         for (
//             const product of products
//         ) {

//             await addDoc(
//                 collection(
//                     db,
//                     "products"
//                 ),
//                 {

//                     sellerId,

//                     category:
//                         product.category,

//                     subCategory:
//                         product.subCategory,

//                     productName:
//                         product.productName,

//                     brand:
//                         product.brand,

//                     color:
//                         product.color,

//                     parentSKU:
//                         product.parentSKU,

//                     variants:
//                         product.variants,

//                     status:
//                         "active",

//                     createdAt:
//                         serverTimestamp(),
//                 }
//             );

//             // ========================================
//             // Activity Log
//             // ========================================

//             await logActivity({

//                 uid: sellerId,

//                 type: "bulk_product_import",

//                 title:
//                     "Internal Bulk Product Imported",

//                 description:
//                     `Shop Name:- ${userData.businessName} imported ${products.length} products into SellerOS successfully. DB Ref:- ${product.id}`,

//                 meta: {
//                     role:
//                         userData.role,
//                     fullName:
//                         userData.fullName,
//                     businessName:
//                         userData.businessName ||
//                         null,
//                     subscriptionPlan:
//                         userData.subscription.planName ||
//                         null,
//                 },
//             });
//         }
//     };

import {
    collection,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db }
    from "@/firebase/config";

import logActivity
    from "@/utils/activity/logActivity";

import {
    incrementProducts,
} from "@/utils/subscription/SubscriptionUsageTracker";

export const importInternalProducts =
    async (
        products,
        sellerId,
        userData,
    ) => {

        let productsImported = 0;
        let variantsImported = 0;
        let qtyImported = 0;

        const docIds = [];

        for (const product of products) {

            const docRef =
                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    {
                        sellerId,

                        category:
                            product.category,

                        subCategory:
                            product.subCategory,

                        productName:
                            product.productName,

                        brand:
                            product.brand,

                        color:
                            product.color,

                        parentSKU:
                            product.parentSKU,

                        variants:
                            product.variants,

                        status:
                            "active",

                        createdAt:
                            serverTimestamp(),
                    }
                );

            docIds.push(
                docRef.id
            );

            productsImported++;

            const variants =
                Object.values(
                    product.variants
                );

            variantsImported +=
                variants.length;

            qtyImported +=
                variants.reduce(
                    (
                        total,
                        variant
                    ) =>
                        total +
                        Number(
                            variant.qty || 0
                        ),
                    0
                );
        }

        await incrementProducts(
            sellerId,
            qtyImported
        );

        await addDoc(
            collection(
                db,
                "product_import_history"
            ),
            {
                sellerId,

                productsImported,

                variantsImported,

                qtyImported,

                importedProductIds:
                    docIds,

                uploadedAt:
                    serverTimestamp(),
            }
        );

        await logActivity({

            uid: sellerId,

            type:
                "bulk_product_import",

            title:
                "Internal Bulk Product Imported",

            description:
                `Shop Name:- ${
                    userData?.organizationName ||
                    "N/A"
                } imported ${qtyImported} units across ${variantsImported} variants and ${productsImported} products into SellerOS successfully.`,

            meta: {

                role:
                    userData?.access
                        ?.role,

                fullName:
                    userData?.fullName,

                organizationName:
                    userData?.organizationName ||
                    null,

                subscriptionPlan:
                    userData?.subscription
                        ?.planName ||
                    null,
            },
        });

        return {

            productsImported,

            variantsImported,

            qtyImported,

            docIds,
        };
    };