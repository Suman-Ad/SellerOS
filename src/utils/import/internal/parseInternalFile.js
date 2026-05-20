import Papa from "papaparse";
import * as XLSX from "xlsx";

export const parseInternalFile = (
    file
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();

            // CSV
            if (
                extension === "csv"
            ) {

                Papa.parse(file, {

                    header: true,

                    skipEmptyLines: true,

                    complete: (
                        results
                    ) => {

                        resolve(
                            results.data
                        );
                    },

                    error: (
                        error
                    ) => {

                        reject(error);
                    },
                });

            }

            // XLSX
            else if (
                extension === "xlsx" ||
                extension === "xls"
            ) {

                const reader =
                    new FileReader();

                reader.onload = (
                    e
                ) => {

                    const data =
                        new Uint8Array(
                            e.target
                                .result
                        );

                    const workbook =
                        XLSX.read(
                            data,
                            {
                                type:
                                    "array",
                            }
                        );

                    const sheet =
                        workbook.Sheets[
                        workbook
                            .SheetNames[0]
                        ];

                    const json =
                        XLSX.utils.sheet_to_json(
                            sheet
                        );

                    resolve(json);
                };

                reader.readAsArrayBuffer(
                    file
                );

            } else {

                reject(
                    new Error(
                        "Unsupported file type"
                    )
                );
            }
        }
    );
};