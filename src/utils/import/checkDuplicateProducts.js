import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

// ====================================
// CHECK DUPLICATE PRODUCTS
// ====================================

const checkDuplicateProducts =
    async ({

        products = [],

        user,
    }) => {

        try {

            // ====================================
            // EMPTY
            // ====================================

            if (
                !products.length
            ) {

                return {

                    uniqueProducts: [],

                    duplicateProducts: [],
                };
            }

            // ====================================
            // LOAD USER PRODUCTS
            // ====================================

            const productsQuery =
                query(

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

            const productsSnap =
                await getDocs(
                    productsQuery
                );

            const existingProducts =
                productsSnap.docs.map(
                    (doc) => ({

                        id:
                            doc.id,

                        ...doc.data(),
                    })
                );

            // ====================================
            // BUILD LOOKUPS
            // ====================================

            const existingParentSKUs =
                new Set();

            const existingVariantSKUs =
                new Set();

            existingProducts.forEach(
                (product) => {

                    // ====================================
                    // PARENT SKU
                    // ====================================

                    existingParentSKUs.add(

                        String(
                            product.parentSKU || ""
                        )
                            .trim()
                            .toUpperCase()
                    );

                    // ====================================
                    // VARIANT SKU
                    // ====================================

                    Object.values(
                        product.variants || {}
                    ).forEach(
                        (variant) => {

                            existingVariantSKUs.add(

                                String(
                                    variant.sku || ""
                                )
                                    .trim()
                                    .toUpperCase()
                            );
                        }
                    );
                }
            );

            // ====================================
            // RESULT
            // ====================================

            const uniqueProducts =
                [];

            const duplicateProducts =
                [];

            // ====================================
            // CHECK IMPORT PRODUCTS
            // ====================================

            products.forEach(
                (product) => {

                    const parentSKU =
                        String(
                            product.parentSKU || ""
                        )
                            .trim()
                            .toUpperCase();

                    // ====================================
                    // DUPLICATE PARENT SKU
                    // ====================================

                    if (
                        existingParentSKUs.has(
                            parentSKU
                        )
                    ) {

                        duplicateProducts.push({

                            ...product,

                            duplicateReason:
                                "Parent SKU already exists",
                        });

                        return;
                    }

                    // ====================================
                    // DUPLICATE VARIANT SKU
                    // ====================================

                    let hasDuplicateVariant =
                        false;

                    Object.values(
                        product.variants || {}
                    ).forEach(
                        (variant) => {

                            const variantSKU =
                                String(
                                    variant.sku || ""
                                )
                                    .trim()
                                    .toUpperCase();

                            if (

                                existingVariantSKUs.has(
                                    variantSKU
                                )
                            ) {

                                hasDuplicateVariant =
                                    true;
                            }
                        }
                    );

                    // ====================================
                    // PUSH DUPLICATE
                    // ====================================

                    if (
                        hasDuplicateVariant
                    ) {

                        duplicateProducts.push({

                            ...product,

                            duplicateReason:
                                "Variant SKU already exists",
                        });

                        return;
                    }

                    // ====================================
                    // UNIQUE
                    // ====================================

                    uniqueProducts.push(
                        product
                    );
                }
            );

            // ====================================
            // RETURN
            // ====================================

            return {

                uniqueProducts,

                duplicateProducts,
            };

        } catch (err) {

            console.error(err);

            throw err;
        }
    };

export default checkDuplicateProducts;