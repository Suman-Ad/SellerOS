import {
    collection,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export const importInternalProducts =
    async (
        products,
        sellerId
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
        }
    };