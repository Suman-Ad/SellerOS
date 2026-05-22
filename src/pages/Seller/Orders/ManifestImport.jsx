import React, { useState } from "react";

import * as pdfjsLib from "pdfjs-dist";


import {
    Upload,
    FileText,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";

import {
    collection,
    getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "@/firebase/config";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ManifestImport = () => {

    const [loading, setLoading] =
        useState(false);

    const [rows, setRows] =
        useState([]);

    const [fileName, setFileName] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [matching, setMatching] =
        useState(false);

    const navigate = useNavigate();
    // ====================================
    // EXTRACT PDF TEXT
    // ====================================

    const extractPDF = async (file) => {

        try {

            setLoading(true);

            setFileName(file.name);

            const buffer =
                await file.arrayBuffer();

            const pdf =
                await pdfjsLib.getDocument({
                    data: buffer,
                }).promise;

            const extractedRows = [];

            let supplierName = "";

            let manifestDate = "";

            // ====================================
            // LOOP PAGES
            // ====================================

            for (
                let pageNum = 1;
                pageNum <= pdf.numPages;
                pageNum++
            ) {

                const page =
                    await pdf.getPage(pageNum);

                const textContent =
                    await page.getTextContent();

                // ====================================
                // BUILD REAL LINES
                // ====================================

                const rowsMap = {};

                textContent.items.forEach((item) => {

                    const y =
                        Math.round(
                            item.transform[5]
                        );

                    if (!rowsMap[y]) {

                        rowsMap[y] = [];
                    }

                    rowsMap[y].push({
                        text: item.str,
                        x: item.transform[4],
                    });
                });

                // ====================================
                // SORT ROWS
                // ====================================

                const lines =
                    Object.keys(rowsMap)

                        .sort((a, b) => b - a)

                        .map((y) => {

                            return rowsMap[y]

                                .sort((a, b) => a.x - b.x)

                                .map(item => item.text)

                                .join(" ");
                        });

                // ====================================
                // CURRENT COURIER
                // ====================================

                let currentCourier = "";

                // ====================================
                // PARSE LINES
                // ====================================

                lines.forEach((line) => {

                    console.log(line);

                    // ====================================
                    // SUPPLIER
                    // ====================================

                    if (
                        line.includes(
                            "Supplier Name"
                        )
                    ) {

                        supplierName =
                            line
                                .split(":")[1]
                                ?.trim() || "";
                    }

                    // ====================================
                    // DATE
                    // ====================================

                    if (
                        line.includes("Date")
                    ) {

                        manifestDate =
                            line
                                .split(":")[1]
                                ?.trim() || "";
                    }

                    // ====================================
                    // COURIER
                    // ====================================

                    if (
                        line.includes(
                            "Delhivery"
                        )
                    ) {

                        currentCourier =
                            "Delhivery";
                    }

                    if (
                        line.includes(
                            "Xpress Bees"
                        )
                    ) {

                        currentCourier =
                            "Xpress Bees";
                    }

                    // ====================================
                    // MANIFEST ROW
                    // ====================================

                    const regex =
                        /^(\d+)\s+(\d+)\s+([0-9]+_[0-9]+)\s+(\d{13,})\s+([A-Z0-9-]+)\s+(\d+)\s+(.+)$/;

                    const match =
                        line.match(regex);

                    if (!match)
                        return;

                    extractedRows.push({

                        serialNo:
                            match[1],

                        subOrderNo:
                            `${match[2]}_${match[3]}`,

                        awb:
                            match[4],

                        sku:
                            match[5],

                        qty:
                            Number(match[6]),

                        size:
                            match[7]
                                .replace(
                                    /Packed/i,
                                    ""
                                )
                                .trim(),

                        courier:
                            currentCourier,

                        supplierName,

                        manifestDate,

                        matched:
                            false,
                    });
                });
            }

            console.log(
                "FINAL:",
                extractedRows
            );

            await matchOrders(
                extractedRows
            );

            setLoading(false);

        } catch (err) {

            console.error(err);

            setLoading(false);
        }
    };

    const matchOrders =
        async (manifestRows) => {

            try {

                setMatching(true);

                // ====================================
                // FETCH ORDERS
                // ====================================

                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            "orders"
                        )
                    );

                const orders =
                    snapshot.docs.map(
                        (doc) => ({

                            id: doc.id,

                            ...doc.data(),
                        })
                    );

                console.log(
                    "ORDERS:",
                    orders
                );

                // ====================================
                // MATCH
                // ====================================

                const matchedRows =
                    manifestRows.map(
                        (row) => {

                            // ====================================
                            // MATCH PRIORITY
                            // ====================================

                            const found =
                                orders.find(
                                    (order) => {

                                        // SUBORDER

                                        const subOrderMatch =

                                            order.platformOrderId
                                                ?.toLowerCase()
                                                .trim()

                                            ===

                                            row.subOrderNo
                                                ?.toLowerCase()
                                                .trim();

                                        // SKU

                                        const skuMatch =

                                            order.variantSku
                                                ?.toLowerCase()
                                                .trim()

                                            ===

                                            row.sku
                                                ?.toLowerCase()
                                                .trim();

                                        // SIZE

                                        const sizeMatch =

                                            order.variantSize
                                                ?.toLowerCase()
                                                .trim()

                                            ===

                                            row.size
                                                ?.toLowerCase()
                                                .trim();

                                        return (
                                            subOrderMatch
                                            ||

                                            (
                                                skuMatch
                                                &&
                                                sizeMatch
                                            )
                                        );
                                    }
                                );

                            // ====================================
                            // FOUND
                            // ====================================

                            if (found) {

                                return {

                                    ...row,

                                    matched:
                                        true,

                                    orderId:
                                        found.id,

                                    orderStatus:
                                        found.orderStatus,

                                    matchedOrder:
                                        found,
                                };
                            }

                            // ====================================
                            // NOT FOUND
                            // ====================================

                            return {

                                ...row,

                                matched:
                                    false,

                                reason:
                                    "Order not found",
                            };
                        }
                    );

                console.log(
                    "MATCHED:",
                    matchedRows
                );

                setRows(matchedRows);

                setMatching(false);

            } catch (err) {

                console.error(err);

                setMatching(false);
            }
        };

    // ====================================
    // PARSER
    // ====================================

    const parseManifestText = (text) => {

        const extracted = [];

        let courier = "";

        let supplierName = "";

        let manifestDate = "";

        const lines =
            text
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean);

        lines.forEach((line) => {

            // ====================================
            // SUPPLIER
            // ====================================

            if (
                line.includes(
                    "Supplier Name"
                )
            ) {

                supplierName =
                    line
                        .split(":")[1]
                        ?.trim() || "";
            }

            // ====================================
            // DATE
            // ====================================

            if (
                line.startsWith(
                    "Date"
                )
            ) {

                manifestDate =
                    line
                        .split(":")[1]
                        ?.trim() || "";
            }

            // ====================================
            // COURIER
            // ====================================

            if (
                line.includes(
                    "Delhivery"
                )
            ) {

                courier =
                    "Delhivery";
            }

            if (
                line.includes(
                    "Xpress Bees"
                )
            ) {

                courier =
                    "Xpress Bees";
            }

            // ====================================
            // MATCH SHIPMENT ROW
            // ====================================

            const regex =
                /^(\d+)\s+(\d+)\s+([0-9]+_[0-9]+)\s+(\d{13,})\s+([A-Z0-9-]+)\s+(\d+)\s+(.+)$/;

            const match =
                line.match(regex);

            if (!match)
                return;

            extracted.push({

                serialNo:
                    match[1],

                subOrderNo:
                    `${match[2]}_${match[3]}`,

                awb:
                    match[4],

                sku:
                    match[5],

                qty:
                    Number(match[6]),

                size:
                    match[7]
                        .replace(
                            /Packed/i,
                            ""
                        )
                        .trim(),

                courier,

                supplierName,

                manifestDate,

                matched:
                    false,
            });
        });

        return extracted;
    };

    const filteredRows =
        rows.filter((row) => {

            const value =
                search.toLowerCase();

            return (

                row.subOrderNo
                    ?.toLowerCase()
                    .includes(value)

                ||

                row.awb
                    ?.toLowerCase()
                    .includes(value)

                ||

                row.sku
                    ?.toLowerCase()
                    .includes(value)

                ||

                row.courier
                    ?.toLowerCase()
                    .includes(value)
            );
        });

    return (

        <div className="
min-h-screen
bg-gray-50
dark:bg-neutral-950
p-4
md:p-6
transition-colors
">
            <button
                onClick={() =>
                    navigate(-1)
                }
                className="w-10 h-10 rounded-xl border border-gray-300 bg-zinc-800 flex items-center justify-center"
            >

                <ArrowLeft size={18} />

            </button>

            {/* HEADER */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">

                    Manifest Import

                </h1>

                <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">

                    Upload supplier shipment manifest PDF

                </p>

            </div>

            {/* UPLOAD */}

            <div className="
bg-white
dark:bg-neutral-900
border
border-gray-200
dark:border-neutral-800
rounded-2xl
p-6
mb-6
shadow-sm
">

                <label
                    className="
border-2
border-dashed
border-gray-300
dark:border-neutral-700
bg-gray-50
dark:bg-neutral-950
rounded-2xl
p-10
flex
flex-col
items-center
justify-center
cursor-pointer
hover:border-black
dark:hover:border-white
transition
"
                >

                    <Upload
                        size={40}
                        className="text-gray-500 dark:text-neutral-400 mb-4"
                    />

                    <div className="font-medium text-gray-900 dark:text-white dark:text-white">

                        Upload Manifest PDF

                    </div>

                    <div className="text-sm text-gray-500 dark:text-neutral-400 mt-1">

                        PDF only
                    </div>

                    <input
                        type="file"
                        accept=".pdf"
                        className="
w-full
px-4
py-3
rounded-xl
border
border-gray-300
dark:border-neutral-700
bg-white
dark:bg-neutral-950
text-gray-900
dark:text-white
placeholder:text-gray-400
outline-none
focus:ring-2
focus:ring-black
dark:focus:ring-white
transition
"
                        onChange={(e) => {

                            const file =
                                e.target.files?.[0];

                            if (file) {

                                extractPDF(file);
                            }
                        }}

                    />

                </label>

            </div>

            {rows.length > 0 && (

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                    {[
                        "Delhivery",
                        "Xpress Bees",
                    ].map((courier) => {

                        const total =
                            rows.filter(
                                row =>
                                    row.courier === courier
                            ).length;

                        return (

                            <div
                                key={courier}
                                className="bg-white
dark:bg-neutral-900
border
border-gray-200
dark:border-neutral-800
shadow-sm rounded-2xl p-5"
                            >

                                <div className="text-sm text-gray-500 dark:text-neutral-400 mb-2">
                                    {courier}
                                </div>

                                <div className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">
                                    {total}
                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

            {/* FILE */}

            {fileName && (

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                    {/* FILE */}

                    <div className="bg-white
dark:bg-neutral-900
border
border-gray-200
dark:border-neutral-800
shadow-sm rounded-2xl p-5">

                        <div className="text-sm text-gray-500 dark:text-neutral-400 mb-2">
                            Manifest File
                        </div>

                        <div className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {fileName}
                        </div>

                    </div>

                    {/* SUPPLIER */}

                    <div className="bg-white
dark:bg-neutral-900
border
border-gray-200
dark:border-neutral-800
shadow-sm rounded-2xl p-5">

                        <div className="text-sm text-gray-500 dark:text-neutral-400 mb-2">
                            Supplier
                        </div>

                        <div className="font-semibold text-gray-900 dark:text-white">
                            {rows?.[0]?.supplierName || "-"}
                        </div>

                    </div>

                    {/* DATE */}

                    <div className="bg-white
dark:bg-neutral-900
border
border-gray-200
dark:border-neutral-800
shadow-sm rounded-2xl p-5">

                        <div className="text-sm text-gray-500 dark:text-neutral-400 mb-2">
                            Manifest Date
                        </div>

                        <div className="font-semibold text-gray-900 dark:text-white">
                            {rows?.[0]?.manifestDate || "-"}
                        </div>

                    </div>

                    {/* TOTAL */}

                    <div className="bg-white
dark:bg-neutral-900
border
border-gray-200
dark:border-neutral-800
shadow-sm rounded-2xl p-5">

                        <div className="text-sm text-gray-500 dark:text-neutral-400 mb-2">
                            Total Shipments
                        </div>

                        <div className="font-semibold text-gray-900 dark:text-white">
                            {rows.length}
                        </div>

                    </div>

                </div>
            )}

            {/* LOADING */}

            {loading && (

                <div className="bg-white
dark:bg-neutral-900
border
border-gray-200
dark:border-neutral-800
shadow-sm rounded-2xl p-10 text-center">

                    Extracting manifest...

                </div>
            )}

            {matching && (

                <div className="
    bg-blue-50
    dark:bg-blue-500/10
    border
    border-blue-200
    dark:border-blue-500/20
    rounded-2xl
    p-4
    mb-6
    ">

                    <div className="
        text-sm
        font-medium
        text-blue-700
        dark:text-blue-300
        ">
                        Matching manifest with orders...
                    </div>

                </div>
            )}


            {/* TABLE */}

            {!loading &&
                rows.length > 0 && (

                    <div className="
bg-white
dark:bg-neutral-900
border
border-gray-200
dark:border-neutral-800
rounded-2xl
overflow-hidden
shadow-sm
">


                        <div className="p-4 border-b border-gray-200">

                            <div className="flex items-center gap-2 mb-4">

                                <FileText size={18} />

                                <h2 className="font-semibold text-gray-900 dark:text-white">

                                    Extracted Rows

                                </h2>

                            </div>

                            <input
                                type="text"
                                placeholder="Search suborder, AWB, SKU..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                className="
w-full
px-4
py-3
rounded-xl
border
border-gray-300
dark:border-neutral-700
bg-white
dark:bg-neutral-950
text-gray-900
dark:text-white
placeholder:text-gray-400
outline-none
focus:ring-2
focus:ring-black
dark:focus:ring-white
transition
"
                            />

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1000px]">

                                <thead className="
bg-gray-100
dark:bg-neutral-800
">

                                    <tr>

                                        <th className="px-4 py-3 text-left text-sm">
                                            Match
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm">
                                            Sub Order
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm">
                                            AWB
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm">
                                            Courier
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm">
                                            SKU
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm">
                                            Qty
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm">
                                            Size
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm">
                                            Order Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredRows.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={7}
                                                className="
                text-center
                py-10
                text-gray-500 dark:text-neutral-400
                "
                                            >
                                                No manifest rows found
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredRows.map((row, index) => (

                                            <tr
                                                key={index}
                                                className="
border-t
border-gray-100
dark:border-neutral-800
hover:bg-gray-50
dark:hover:bg-neutral-800/50
transition
"
                                            >

                                                {/* MATCH */}

                                                <td className="px-4 py-3">

                                                    <div
                                                        className={`
    inline-flex
    items-center
    px-3
    py-1
    rounded-full
    text-xs
    font-semibold

    ${row.matched

                                                                ? `
        bg-green-100
        text-green-700
        dark:bg-green-500/20
        dark:text-green-300
        `

                                                                : `
        bg-red-100
        text-red-700
        dark:bg-red-500/20
        dark:text-red-300
        `
                                                            }
    `}
                                                    >
                                                        {row.matched
                                                            ? "Matched"
                                                            : "Not Found"}
                                                    </div>

                                                </td>

                                                {/* SUBORDER */}

                                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                                    {row.subOrderNo}
                                                </td>

                                                {/* AWB */}

                                                <td className="px-4 py-3 text-sm font-mono">
                                                    {row.awb}
                                                </td>

                                                {/* COURIER */}

                                                <td className="px-4 py-3 text-sm">
                                                    {row.courier}
                                                </td>

                                                {/* SKU */}

                                                <td className="px-4 py-3 text-sm">
                                                    {row.sku}
                                                </td>

                                                {/* QTY */}

                                                <td className="px-4 py-3 text-sm">
                                                    {row.qty}
                                                </td>

                                                {/* SIZE */}

                                                <td className="px-4 py-3 text-sm">
                                                    {row.size}
                                                </td>

                                                <td className="px-4 py-3 text-sm">

                                                    {row.orderStatus || "-"}

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default ManifestImport;