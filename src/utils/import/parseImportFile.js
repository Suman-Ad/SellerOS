import Papa from "papaparse";

import * as XLSX from "xlsx";

const parseCSV = async (file) => {

  return new Promise(
    async (resolve, reject) => {

      try {

        if (!file) {
          reject(
            new Error("No file selected")
          );

          return;
        }

        const lower =
          file.name.toLowerCase();

        // ====================================
        // CSV
        // ====================================

        if (lower.endsWith(".csv")) {

          Papa.parse(file, {

            header: true,

            skipEmptyLines: true,

            complete: (results) => {

              resolve(
                results.data || []
              );
            },

            error: (err) => {
              reject(err);
            },
          });

          return;
        }

        // ====================================
        // EXCEL
        // ====================================

        if (
          lower.endsWith(".xlsx") ||
          lower.endsWith(".xls")
        ) {

          const buffer =
            await file.arrayBuffer();

          const workbook =
            XLSX.read(buffer);

          const firstSheet =
            workbook.SheetNames[0];

          const worksheet =
            workbook.Sheets[firstSheet];

          const json =
            XLSX.utils.sheet_to_json(
              worksheet,
              {
                defval: "",
              }
            );

          resolve(json);

          return;
        }

        reject(
          new Error(
            "Unsupported file format"
          )
        );

      } catch (err) {

        reject(err);
      }
    }
  );
};

export default parseCSV;