import {
    collection,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db }
    from "@/firebase/config";
import logActivity
    from "@/utils/activity/logActivity";

export const importInternalProducts =
    async (
        products,
        sellerId,
        userData,
    ) => {

        for (
            const product of products
        ) {

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

            // ========================================
            // Activity Log
            // ========================================

            await logActivity({

                uid: sellerId,

                type: "bulk_product_import",

                title:
                    "Internal Bulk Product Imported",

                description:
                    `Shop Name:- ${userData.businessName} imported ${products.length} products into SellerOS successfully. DB Ref:- ${product.id}`,

                meta: {
                    role:
                        userData.role,
                    fullName:
                        userData.fullName,
                    businessName:
                        userData.businessName ||
                        null,
                    subscriptionPlan:
                        userData.subscription.planName ||
                        null,
                },
            });
        }
    };