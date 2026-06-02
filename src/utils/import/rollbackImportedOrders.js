import {
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  decrementOrders,
} from "@/utils/subscription/SubscriptionUsageTracker";

const rollbackImportedOrders = async ({
  importedOrderIds = [],
  sellerId,
}) => {

  if (!importedOrderIds.length) {
    return;
  }

  const batch = writeBatch(db);

  let rollbackCount = 0;

  for (const orderId of importedOrderIds) {

    const orderRef =
      doc(
        db,
        "orders",
        orderId
      );

    const orderSnap =
      await getDoc(orderRef);

    if (!orderSnap.exists()) {
      continue;
    }

    const order =
      orderSnap.data();

    const rollback =
      order.inventoryRollbackMeta;

    if (rollback?.productId) {

      const productRef =
        doc(
          db,
          "products",
          rollback.productId
        );

      const productSnap =
        await getDoc(productRef);

      if (productSnap.exists()) {

        const product =
          productSnap.data();

        const variants = {
          ...(product.variants || {}),
        };

        variants[
          rollback.variantSize
        ] = {

          ...(variants[
            rollback.variantSize
          ] || {}),

          qty:
            Number(
              variants[rollback.variantSize]?.qty || 0
            ) + rollback.qty,

          soldQty:
            Math.max(
              0,
              Number(
                variants[rollback.variantSize]?.soldQty || 0
              ) - rollback.qty
            ),
        };

        batch.update(
          productRef,
          {
            variants,
          }
        );
      }
    }

    if (
      order.inventoryTransactionId
    ) {

      batch.delete(
        doc(
          db,
          "inventoryTransactions",
          order.inventoryTransactionId
        )
      );
    }

    batch.delete(orderRef);

    rollbackCount++;
  }

  await batch.commit();

  if (
    rollbackCount > 0 &&
    sellerId
  ) {

    await decrementOrders(
      sellerId,
      rollbackCount
    );
  }

  return rollbackCount;
};

export default rollbackImportedOrders;