import {
    collection,
    doc,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import logActivity
    from "@/utils/activity/logActivity";

import {
    incrementOrders,
} from "@/utils/subscription/SubscriptionUsageTracker";

// ====================================
// EXECUTE ORDERS IMPORT
// ====================================

const executeOrdersImport = async ({
    importBatchId,

    matchedOrders = [],

    user,

    userData,

    platform = "meesho",

    onProgress,
}) => {

    try {

        const createdOrderIds = [];

        // ====================================
        // EMPTY
        // ====================================

        if (!matchedOrders.length) {

            return {

                imported: 0,

                failed: 0,
            };
        }

        // ====================================
        // BATCH
        // ====================================

        const batchRef = {
            current: writeBatch(db),
        };

        const operationRef = {
            current: 0,
        };

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
        // COUNTERS
        // ====================================

        let imported = 0;

        let failed = 0;

        const total =
            matchedOrders.length;

        // ====================================
        // LOOP
        // ====================================

        for (
            let index = 0;
            index < total;
            index++
        ) {

            try {

                const item =
                    matchedOrders[index];

                const row =
                    item.row;

                const product =
                    item.product;

                const variant =
                    item.variant;

                const variantSize =
                    item.variantSize;

                const qty =
                    Number(
                        item.qty || 1
                    );

                // ====================================
                // PROGRESS
                // ====================================

                const percent =
                    Math.round(
                        ((index + 1) / total) *
                        100
                    );

                onProgress?.({

                    progress: percent,

                    text:
                        `Importing Orders ${index + 1}/${total}`,
                });

                // ====================================
                // ORDER REF
                // ====================================

                const orderRef =
                    doc(
                        collection(
                            db,
                            "orders"
                        )
                    );

                // ====================================
                // PRICING
                // ====================================

                const sellingPrice =
                    Number(
                        row.sellingPrice || 0
                    );

                const buyingPrice =
                    Number(
                        variant.buyingPrice || 0
                    );

                const totalSelling =
                    sellingPrice * qty;

                const totalBuying =
                    buyingPrice * qty;

                const profit =
                    totalSelling -
                    totalBuying;

                // ====================================
                // CREATE ORDER
                // ====================================

                batchRef.current.set(
                    orderRef,

                    {

                        // ====================================
                        // SELLER
                        // ====================================

                        sellerId:
                            user.uid,

                        importBatchId,

                        // ====================================
                        // PLATFORM
                        // ====================================

                        platform,

                        platformOrderId:
                            row.platformOrderId,

                        // ====================================
                        // PRODUCT
                        // ====================================

                        productRefId:
                            product.id,

                        parentSKU:
                            row.parentSKU ||

                            product.parentSKU ||

                            "",

                        productId:
                            row.productId ||

                            "",

                        productName:
                            row.productName ||

                            product.productName ||

                            "",

                        // ====================================
                        // VARIANT
                        // ====================================

                        variantSize,

                        variantSku:
                            variant.sku ||

                            "",

                        // ====================================
                        // ORDER
                        // ====================================

                        qty,

                        orderDate:
                            row.orderDate ||

                            null,

                        orderStatus:
                            row.orderStatus ||

                            "Pending",

                        paymentStatus:
                            "Pending",

                        shipmentStatus:
                            "Pending",

                        // ====================================
                        // PRICE
                        // ====================================

                        sellingPrice,

                        buyingPrice,

                        totalSelling,

                        totalBuying,

                        profit,

                        // ====================================
                        // CUSTOMER
                        // ====================================

                        customer: {

                            name:
                                row.customerName ||

                                "",

                            phone:
                                row.customerPhone ||

                                "",
                        },

                        // ====================================
                        // SHIPMENT
                        // ====================================

                        shipment: {

                            awb:
                                row.awb ||

                                "",
                        },

                        // ====================================
                        // IMPORT
                        // ====================================

                        importedFrom:
                            "csv",

                        inventoryReduced:
                            true,

                        rawMarketplaceData:
                            row.rawData ||

                            {},

                        // ====================================
                        // SYSTEM
                        // ====================================

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp(),
                    }
                );

                createdOrderIds.push(orderRef.id);

                operationRef.current++;

                // ========================================
                // Activity Log
                // ========================================

                await logActivity({

                    uid: user.uid,

                    type: "order_import",

                    title:
                        "Marketplace Order Imported",

                    description:
                        `Shop Name:- ${userData?.organizationName} imported ${total} orders into SellerOS successfully. DB Ref:- ${orderRef.id}`,

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
                // ====================================
                // INVENTORY UPDATE
                // ====================================

                const updatedVariants = {

                    ...product.variants,
                };

                const currentVariant =
                    updatedVariants[
                    variantSize
                    ];

                const currentQty =
                    Number(
                        currentVariant.qty || 0
                    );

                const currentSoldQty =
                    Number(
                        currentVariant.soldQty || 0
                    );

                updatedVariants[
                    variantSize
                ] = {

                    ...currentVariant,

                    qty:
                        currentQty - qty,

                    soldQty:
                        currentSoldQty + qty,
                };

                const productRef =
                    doc(
                        db,
                        "products",
                        product.id
                    );

                batchRef.current.update(
                    productRef,

                    {

                        variants:
                            updatedVariants,

                        updatedAt:
                            serverTimestamp(),
                    }
                );

                operationRef.current++;

                // ====================================
                // INVENTORY TRANSACTION
                // ====================================

                const inventoryTransactionRef =
                    doc(
                        collection(
                            db,
                            "inventoryTransactions"
                        )
                    );

                batchRef.current.set(

                    inventoryTransactionRef,

                    {

                        sellerId:
                            user.uid,

                        type:
                            "order_import",

                        source:
                            "marketplace",

                        platform,

                        orderId:
                            row.platformOrderId,

                        productRefId:
                            product.id,

                        variantSku:
                            variant.sku ||

                            "",

                        variantSize,

                        qty,

                        beforeQty:
                            currentQty,

                        afterQty:
                            currentQty - qty,

                        createdAt:
                            serverTimestamp(),
                    }
                );

                operationRef.current++;

                // ====================================
                // COMMIT
                // ====================================

                if (
                    operationRef.current >=
                    450
                ) {

                    await commitBatch();
                }

                imported++;

            } catch (err) {

                console.error(err);

                failed++;
            }
        }

        // ====================================
        // FINAL COMMIT
        // ====================================

        await commitBatch();

        /* ====================================
   UPDATE SUBSCRIPTION USAGE
==================================== */

        if (
            imported > 0 &&
            user?.uid
        ) {

            await incrementOrders(
                user.uid,
                imported
            );
        }

        

        return {
            imported,
            failed,
            orderIds: createdOrderIds
        };

    } catch (err) {

        console.error(err);

        throw err;
    }
};

export default executeOrdersImport;