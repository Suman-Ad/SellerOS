import {
    collection,
    doc,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/firebase/config";

// ====================================
// EXECUTE INVENTORY IMPORT
// ====================================

const executeInventoryImport =
    async ({

        products = [],

        user,

        onProgress,
    }) => {

        try {

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