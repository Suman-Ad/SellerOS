import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import normalizeSize from "./normalizeImportRows";

const executeInventoryImport = async ({
  rows = [],
  user,
  platform = "meesho",

  onProgress,
}) => {

  try {

    if (!rows.length) {

      return {
        updated: 0,
      };
    }

    // ====================================
    // LOAD STOCKS
    // ====================================

    const stockQuery = query(
      collection(db, "stocks"),

      where(
        "userId",
        "==",
        user.uid
      )
    );

    const stockSnap =
      await getDocs(stockQuery);

    const stocks =
      stockSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    // ====================================
    // GROUP INVENTORY
    // ====================================

    const groupedInventory =
      {};

    rows.forEach((row) => {

      const catalogKey =
        String(
          row.catalogId || ""
        )
          .trim()
          .toUpperCase();

      const sizeKey =
        normalizeSize(
          row.size
        );

      if (
        !catalogKey ||
        !sizeKey
      ) {
        return;
      }

      // ====================================
      // CREATE GROUP
      // ====================================

      if (
        !groupedInventory[
          catalogKey
        ]
      ) {

        groupedInventory[
          catalogKey
        ] = {

          catalogId:
            row.catalogId || "",

          productId:
            row.productId || "",

          productName:
            row.productName ||
            "Marketplace Product",

          sizes: {},
        };
      }

      // ====================================
      // CREATE SIZE
      // ====================================

      if (
        !groupedInventory[
          catalogKey
        ].sizes[sizeKey]
      ) {

        groupedInventory[
          catalogKey
        ].sizes[sizeKey] = {

          qty: 0,

          initialQty: 0,

          buyingPrice:
            Number(
              row.buyingPrice || 0
            ),

          sellingPrice:
            Number(
              row.sellingPrice || 0
            ),
        };
      }

      // ====================================
      // ADD QTY
      // ====================================

      groupedInventory[
        catalogKey
      ].sizes[sizeKey].qty +=
        Number(row.qty || 0);

      groupedInventory[
        catalogKey
      ].sizes[
        sizeKey
      ].initialQty +=
        Number(row.qty || 0);
    });

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
    // LOOP GROUPS
    // ====================================

    const groupedRows =
      Object.values(
        groupedInventory
      );

    const total =
      groupedRows.length;

    let updated = 0;

    for (
      let index = 0;
      index < total;
      index++
    ) {

      const groupedRow =
        groupedRows[index];

      const percent =
        Math.round(
          ((index + 1) / total) *
            100
        );

      onProgress?.({
        progress: percent,

        text:
          `Updating Inventory ${index + 1}/${total}`,
      });

      // ====================================
      // FIND STOCK
      // ====================================

      const stockMatch =
        stocks.find(
          (stock) =>
            String(
              stock.catalogId || ""
            )
              .trim()
              .toUpperCase()

            ===

            String(
              groupedRow.catalogId ||
                ""
            )
              .trim()
              .toUpperCase()
        );

      // ====================================
      // CREATE NEW STOCK
      // ====================================

      if (!stockMatch) {

        const newStockRef =
          doc(
            collection(
              db,
              "stocks"
            )
          );

        batchRef.current.set(
          newStockRef,
          {
            userId:
              user.uid,

            productName:
              groupedRow.productName,

            catalogId:
              groupedRow.catalogId,

            productId:
              groupedRow.productId,

            sizes:
              groupedRow.sizes,

            isItemOnline: true,

            inventorySource:
              "csv",

            platform,

            createdAt:
              serverTimestamp(),
          }
        );

        operationRef.current++;

        updated++;

        continue;
      }

      // ====================================
      // UPDATE STOCK
      // ====================================

      const updatedSizes = {
        ...stockMatch.sizes,
      };

      Object.keys(
        groupedRow.sizes
      ).forEach((sizeKey) => {

        const incomingSize =
          groupedRow.sizes[
            sizeKey
          ];

        if (
          !updatedSizes[
            sizeKey
          ]
        ) {

          updatedSizes[
            sizeKey
          ] = incomingSize;

        } else {

          updatedSizes[
            sizeKey
          ].qty =
            Number(
              incomingSize.qty || 0
            );

          updatedSizes[
            sizeKey
          ].initialQty =
            Number(
              incomingSize.initialQty ||
                0
            );

          updatedSizes[
            sizeKey
          ].buyingPrice =
            incomingSize.buyingPrice;

          updatedSizes[
            sizeKey
          ].sellingPrice =
            incomingSize.sellingPrice;
        }
      });

      const stockRef = doc(
        db,
        "stocks",
        stockMatch.id
      );

      batchRef.current.update(
        stockRef,
        {
          sizes:
            updatedSizes,

          isItemOnline: true,

          inventorySource:
            "csv",

          platform,
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

      updated++;
    }

    // ====================================
    // FINAL COMMIT
    // ====================================

    await commitBatch();

    return {
      updated,
    };

  } catch (err) {

    console.error(err);

    throw err;
  }
};

export default executeInventoryImport;