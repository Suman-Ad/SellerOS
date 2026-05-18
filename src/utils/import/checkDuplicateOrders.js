import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

// ====================================
// CHECK DUPLICATE ORDERS
// ====================================

const checkDuplicateOrders = async ({
    rows = [],
    user,
}) => {

    try {

        // ====================================
        // RESULT
        // ====================================

        const newOrders = [];

        const duplicateOrders = [];

        // ====================================
        // EMPTY
        // ====================================

        if (!rows.length) {

            return {
                newOrders,
                duplicateOrders,
            };
        }

        // ====================================
        // LOAD EXISTING ORDERS
        // ====================================

        const orderQuery = query(
            collection(
                db,
                "orders"
            ),

            where(
                "sellerId",
                "==",
                user.uid
            )
        );

        const orderSnap =
            await getDocs(
                orderQuery
            );

        // ====================================
        // CREATE LOOKUP
        // ====================================

        const existingOrders =
            new Set();

        orderSnap.docs.forEach(
            (doc) => {

                const data =
                    doc.data();

                const duplicateKey = [

                    String(
                        data.platform || ""
                    )
                        .trim()
                        .toLowerCase(),

                    String(
                        data.platformOrderId || ""
                    )
                        .trim()
                        .toLowerCase(),

                ].join("_");

                existingOrders.add(
                    duplicateKey
                );
            }
        );

        // ====================================
        // LOOP ROWS
        // ====================================

        rows.forEach((item) => {

            const row =
                item.row || item;

            const duplicateKey = [

                String(
                    row.platform || ""
                )
                    .trim()
                    .toLowerCase(),

                String(
                    row.platformOrderId || ""
                )
                    .trim()
                    .toLowerCase(),

            ].join("_");

            // ====================================
            // DUPLICATE
            // ====================================

            if (
                existingOrders.has(
                    duplicateKey
                )
            ) {

                duplicateOrders.push({

                    ...item,

                    reason:
                        "Order already imported",
                });

                return;
            }

            // ====================================
            // NEW
            // ====================================

            newOrders.push(item);
        });

        // ====================================
        // RETURN
        // ====================================

        return {

            newOrders,

            duplicateOrders,
        };

    } catch (err) {

        console.error(err);

        throw err;
    }
};

export default checkDuplicateOrders;