import {
    collection,
    doc,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import logActivity
    from "@/utils/activity/logActivity";

import { incrementProducts } from "@/utils/subscription/SubscriptionUsageTracker";

import { useState } from "react";

// ====================================
// EXECUTE INVENTORY IMPORT
// ====================================

const executeInventoryImport =
    async ({

        products = [],

        user,
        userData,
        onProgress,
    }) => {



        try {

            let lastProductRefId = null;
            let totalQty = 0;
            let totalVariants = 0;

            // ====================================
            // EMPTY
            // ====================================

            if (
                !products.length
            ) {

                return {

                    imported: 0,
                };
            }

            // ====================================
            // BATCH
            // ====================================

            const batchRef = {
                current:
                    writeBatch(db),
            };

            const operationRef = {
                current: 0,
            };

            // ====================================
            // COMMIT BATCH
            // ====================================

            const commitBatch =
                async () => {

                    if (
                        operationRef.current === 0
                    ) {

                        return;
                    }

                    await batchRef.current.commit();

                    batchRef.current =
                        writeBatch(db);

                    operationRef.current = 0;
                };

            // ====================================
            // LOOP PRODUCTS
            // ====================================

            const total =
                products.length;

            let imported = 0;

            for (
                let index = 0;
                index < total;
                index++
            ) {

                const product =
                    products[index];

                // ====================================
                // PROGRESS
                // ====================================

                const percent =
                    Math.round(

                        (
                            (index + 1) / total
                        ) * 100
                    );

                onProgress?.({

                    progress:
                        percent,

                    text:
                        `Importing Product ${index + 1}/${total}`,
                });

                // ====================================
                // NEW DOC
                // ====================================

                const productRef =
                    doc(

                        collection(
                            db,
                            "products"
                        )
                    );
                lastProductRefId = productRef.id;

                const variants = product.variants || {};

                totalVariants += Object.keys(variants).length;

                totalQty += Object.values(variants).reduce(
                    (sum, variant) =>
                        sum + Number(variant?.qty || 0),
                    0
                );
                // ====================================
                // CREATE PRODUCT
                // ====================================

                batchRef.current.set(

                    productRef,

                    {

                        sellerId:
                            user.uid,

                        category:
                            product.category || "",

                        subCategory:
                            product.subCategory || "",

                        productName:
                            product.productName || "",

                        brand:
                            product.brand || "",

                        color:
                            product.color || "",

                        parentSKU:
                            product.parentSKU || "",

                        variants:
                            product.variants || {},

                        status:
                            "active",

                        importSource:
                            "csv",

                        createdAt:
                            serverTimestamp(),

                        updatedAt: serverTimestamp(),
                    }
                );

                operationRef.current++;

                imported++;

                // ====================================
                // FIRESTORE LIMIT
                // ====================================

                if (

                    operationRef.current >= 450
                ) {

                    await commitBatch();
                }
            }

            // ====================================
            // FINAL COMMIT
            // ====================================

            await commitBatch();

            // ========================================
            // Activity Log
            // ========================================

            await logActivity({

                uid: user.uid,

                type: "bulk_product_import",

                title:
                    "Marketplace Bulk Product Imported",

                description:
                    `Shop Name:- ${userData?.organizationName} imported ${totalQty} units across ${totalVariants} variants (${products.length} products) into SellerOS successfully. DB Ref:- ${lastProductRefId}`,
                meta: {
                    role:
                        userData?.access?.role,
                    fullName:
                        userData?.fullName,
                    organizationId:
                        userData?.organizationId ||
                        null,
                    subscriptionPlan:
                        userData?.subscription?.planName ||
                        null,
                },
            });

            await incrementProducts(
                user.uid,
                totalQty,
            );


            // ====================================
            // RETURN
            // ====================================

            return {

                imported,
            };

        } catch (err) {

            console.error(err);

            throw err;
        }
    };

export default executeInventoryImport;