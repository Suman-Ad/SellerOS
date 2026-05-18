import parseCSV from "@/utils/import/parseCSV";

import normalizeImportRows from "@/utils/import/normalizeImportRows";

import validateImportRows from "@/utils/import/validateImportRows";

import matchProductVariants from "@/utils/import/matchProductVariants";

import checkDuplicateOrders from "@/utils/import/checkDuplicateOrders";

import executeOrdersImport from "@/utils/import/executeOrdersImport";

import executeInventoryImport from "@/utils/import/executeInventoryImport";

import executePricingImport from "@/utils/import/executePricingImport";

// ====================================
// MARKETPLACE IMPORT ENGINE
// ====================================

const MarketplaceImportEngine = async ({
  file,

  importType = "orders",

  platform = "meesho",

  user,

  previewOnly = false,

  onParsed,
  onValidated,
  onMatched,
  onDuplicates,

  onProgress,

  onComplete,
  onError,
}) => {

  try {

    // ====================================
    // PARSE FILE
    // ====================================

    onProgress?.({
      progress: 5,
      text: "Parsing file...",
    });

    const parsedRows =
      await parseCSV(file);

    onParsed?.(parsedRows);

    // ====================================
    // NORMALIZE
    // ====================================

    onProgress?.({
      progress: 15,
      text: "Normalizing rows...",
    });

    const normalizedRows =
      normalizeImportRows({

        rows: parsedRows,

        platform,

        importType,
      });

    // ====================================
    // VALIDATE
    // ====================================

    onProgress?.({
      progress: 30,
      text: "Validating rows...",
    });

    const validationResult =
      validateImportRows(
        normalizedRows
      );

    onValidated?.(
      validationResult
    );

    // ====================================
    // VALID ROWS
    // ====================================

    const validRows =
      validationResult.validRows || [];

    // ====================================
    // MATCH PRODUCTS
    // ====================================

    let matchedData = {
      matched: [],
      unmatched: [],
    };

    // ====================================
    // ONLY ORDERS
    // ====================================

    if (
      importType === "orders"
    ) {

      onProgress?.({
        progress: 45,
        text:
          "Matching product variants...",
      });

      matchedData =
        await matchProductVariants({

          rows: validRows,

          user,
        });

      onMatched?.(
        matchedData
      );

      // ====================================
      // CHECK DUPLICATES
      // ====================================

      onProgress?.({
        progress: 60,
        text:
          "Checking duplicate orders...",
      });

      const duplicateCheck =
        await checkDuplicateOrders({

          rows:
            matchedData.matched,

          user,
        });

      onDuplicates?.(
        duplicateCheck
      );

      // ====================================
      // REPLACE MATCHED
      // ====================================

      matchedData.matched =
        duplicateCheck.newOrders;
    }

    // ====================================
    // PREVIEW ONLY
    // ====================================

    if (previewOnly) {

      onProgress?.({
        progress: 100,
        text:
          "Preview ready",
      });

      onComplete?.({

        parsedRows,

        normalizedRows,

        validationResult,

        matchedData,

        readyToImport:
          matchedData.matched || [],
      });

      return;
    }

    // ====================================
    // EXECUTE IMPORT
    // ====================================

    onProgress?.({
      progress: 75,
      text:
        "Executing import...",
    });

    let result = null;

    switch (importType) {

      // ====================================
      // ORDERS
      // ====================================

      case "orders":

        result =
          await executeOrdersImport({

            matchedOrders:
              matchedData.matched,

            user,

            platform,

            onProgress,
          });

        break;

      // ====================================
      // INVENTORY
      // ====================================

      case "inventory":

        result =
          await executeInventoryImport({

            rows: validRows,

            user,

            platform,

            onProgress,
          });

        break;

      // ====================================
      // PRICING
      // ====================================

      case "pricing":

        result =
          await executePricingImport({

            rows: validRows,

            user,

            platform,

            onProgress,
          });

        break;

      default:

        throw new Error(
          "Invalid import type"
        );
    }

    // ====================================
    // COMPLETE
    // ====================================

    onProgress?.({
      progress: 100,
      text:
        "Import completed",
    });

    onComplete?.({

      parsedRows,

      normalizedRows,

      validationResult,

      matchedData,

      result,
    });

  } catch (err) {

    console.error(err);

    onError?.(err);
  }
};

export default MarketplaceImportEngine;