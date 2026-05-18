import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import normalizeSize from "./normalizeImportRows";

const executePricingImport = async ({
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
    // REMOVE DUPLICATES
    // ====================================

    const uniqueRows = [];

    const seen = new Set();

    rows.forEach((row) => {

      const key = [
        row.catalogId,

        normalizeSize(
          row.size
        ),
      ].join("_");

      if (!seen.has(key)) {

        seen.add(key);

        uniqueRows.push(row);
      }
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
    // LOOP
    // ====================================

    const total =
      uniqueRows.length;

    let updated = 0;

    for (
      let index = 0;
      index < total;
      index++
    ) {

      const row =
        uniqueRows[index];

      const percent =
        Math.round(
          ((index + 1) / total) *
            100
        );

      onProgress?.({
        progress: percent,

        text:
          `Updating Pricing ${index + 1}/${total}`,
      });

      // ====================================
      // ACTION
      // ====================================

      const action =
        String(
          row.action || ""
        ).toUpperCase();

      // Skip explicit reject

      if (
        action &&
        action.trim() ===
          "REJECT"
      ) {
        continue;
      }

      // ====================================
      // PRICES
      // ====================================

      const meeshoPrice =
        Number(
          String(
            row.meeshoPrice || ""
          ).replace(
            /[^0-9.]/g,
            ""
          )
        );

      const bankSettlementPrice =
        Number(
          String(
            row.bankSettlementPrice ||
              ""
          ).replace(
            /[^0-9.]/g,
            ""
          )
        );

      if (
        !meeshoPrice ||
        !bankSettlementPrice
      ) {
        continue;
      }

      // ====================================
      // DELIVERY COST
      // ====================================

      const deliveryCost =
        Number(
          (
            meeshoPrice -
            bankSettlementPrice
          ).toFixed(2)
        );

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
              row.catalogId || ""
            )
              .trim()
              .toUpperCase()
        );

      if (!stockMatch) {
        continue;
      }

      // ====================================
      // SIZE
      // ====================================

      const sizeKey =
        normalizeSize(
          row.size
        );

      if (
        !stockMatch.sizes?.[
          sizeKey
        ]
      ) {
        continue;
      }

      // ====================================
      // UPDATE SIZE
      // ====================================

      const updatedSizes = {
        ...stockMatch.sizes,
      };

      const sizeData =
        updatedSizes[
          sizeKey
        ];

      // marketplace price

      sizeData.meeshoPrice =
        meeshoPrice;

      // settlement

      sizeData.bankSettlementPrice =
        bankSettlementPrice;

      // imported selling price

      sizeData.sellingPrice =
        meeshoPrice;

      // ====================================
      // EXTRA COSTS
      // ====================================

      if (
        !sizeData.extraCosts
      ) {

        sizeData.extraCosts =
          {
            packaging: 0,

            labeling: 0,

            rto: 0,

            returnCost: 0,

            advertisementCost: 0,

            delivery: 0,

            others: 0,

            gst: 0,
          };
      }

      // ====================================
      // DELIVERY
      // ====================================

      sizeData.extraCosts.delivery =
        deliveryCost;

      // ====================================
      // UPDATE FIRESTORE
      // ====================================

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

export default executePricingImport;