import React, {
    useRef,
    useState,
    useEffect,
} from "react";

import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    ShieldAlert,
    CopyCheck,
    ArrowLeft,
} from "lucide-react";

import MarketplaceImportEngine from "@/components/imports/MarketplaceImportEngine";
import matchProductVariants from "@/utils/import/matchProductVariants";

import checkDuplicateOrders from "@/utils/import/checkDuplicateOrders";

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import useSubscription
    from "@/hooks/useSubscription";

import {
    addDoc,
    collection,
    serverTimestamp,
    getDoc,
    doc,
    query,
    updateDoc,
} from "firebase/firestore";


import { db } from "@/firebase/config";

import OrderImportHistory from "./OrderImportHistory";

import { useLocation } from "react-router-dom";


// ====================================
// PAGE
// ====================================

const OrderImport = () => {

    const { user, userData } =
        useAuth();

    const {
        canCreateOrder,
        remainingOrders,
        orderValidation,
    } = useSubscription();

    const fileInputRef =
        useRef();

    const navigate =
        useNavigate();
    // ====================================
    // FILE
    // ====================================

    const [fileName,
        setFileName] =
        useState("");

    // ====================================
    // LOADING
    // ====================================

    const [loading,
        setLoading] =
        useState(false);

    const [uploadedFile,
        setUploadedFile] =
        useState(null);

    // ====================================
    // PROGRESS
    // ====================================

    const [progress,
        setProgress] =
        useState(0);

    const [progressText,
        setProgressText] =
        useState("");

    // ====================================
    // ROWS
    // ====================================

    const [parsedRows,
        setParsedRows] =
        useState([]);

    // const [previewRows,
    //     setPreviewRows] =
    //     useState([]);

    // ====================================
    // VALIDATION
    // ====================================

    const [validRows,
        setValidRows] =
        useState([]);

    const [invalidRows,
        setInvalidRows] =
        useState([]);

    const [duplicateRows,
        setDuplicateRows] =
        useState([]);

    // ====================================
    // MATCHING
    // ====================================

    const [matchedRows,
        setMatchedRows] =
        useState([]);

    const [unmatchedRows,
        setUnmatchedRows] =
        useState([]);

    // ====================================
    // IMPORT
    // ====================================

    const [importResult,
        setImportResult] =
        useState(null);

    const [readyToImport,
        setReadyToImport] =
        useState([]);

    const [previewReady,
        setPreviewReady] =
        useState(false);

    const [importing,
        setImporting] =
        useState(false);

    // ====================================
    // Manual Field Mapping
    // ====================================

    const [csvHeaders,
        setCsvHeaders] =
        useState([]);

    const [fieldMapping,
        setFieldMapping] =
        useState({});

    const [showMapping,
        setShowMapping] =
        useState(false);

    // ====================================
    // SETTINGS
    // ====================================

    const [platform,
        setPlatform] =
        useState("meesho");

    const [importType,
        setImportType] =
        useState("orders");


    const location = useLocation();

    const historyId =
        new URLSearchParams(
            location.search
        ).get("history");


    const loadHistory = async () => {

        try {

            const historyDoc =
                await getDoc(
                    doc(
                        db,
                        "order_import_history",
                        historyId
                    )
                );

            if (
                !historyDoc.exists()
            ) {

                return;
            }

            const data =
                historyDoc.data();

            setFieldMapping(
                data.fieldMapping || {}
            );

            setPlatform(
                data.platform ||
                "meesho"
            );

            setImportType(
                data.importType ||
                "orders"
            );

            setFileName(
                data.fileName || ""
            );

            // setParsedRows(data.parsedRows || []);
            // setReadyToImport(data.readyToImport || []);
            setCsvHeaders(data.csvHeaders || []);
            setPreviewReady(false);

            setShowMapping(true);

        } catch (err) {

            console.error(err);
        }
    };

    // setShowMapping(true);
    useEffect(() => {
        if (!historyId) return;

        loadHistory();
    }, [historyId]);

    // ====================================
    // HANDLE UPLOAD
    // ====================================

    const handleUpload =
        async (file) => {

            if (!canCreateOrder) {

                alert(
                    orderValidation?.reason ||
                    "Order limit reached"
                );

                navigate("/upgrade-plan");

                return;
            }

            try {

                if (!file) return;

                setUploadedFile(file);

                setPreviewReady(false);

                setImportResult(null);

                setReadyToImport([]);

                setLoading(true);

                setFileName(
                    file.name
                );

                // ====================================
                // RESET
                // ====================================

                setParsedRows([]);

                // setPreviewRows([]);

                setValidRows([]);

                setInvalidRows([]);

                setDuplicateRows([]);

                setMatchedRows([]);

                setUnmatchedRows([]);

                setImportResult(null);

                // ====================================
                // START IMPORT
                // ====================================


                await MarketplaceImportEngine({

                    file,

                    user,

                    userData,

                    platform,

                    importType,

                    previewOnly: true,

                    fieldMapping,

                    // ====================================
                    // PARSED
                    // ====================================

                    onParsed: (
                        rows
                    ) => {

                        if (rows?.length) {

                            const headers =
                                Object.keys(rows[0]);

                            setCsvHeaders(headers);

                            // AUTO DEFAULT MAP
                            const autoMap = {};

                            headers.forEach((header) => {

                                const lower =
                                    header.toLowerCase();

                                if (
                                    lower.includes("sku")
                                ) {

                                    autoMap[header] =
                                        "parentSKU";
                                }

                                else if (
                                    lower.includes("order")
                                ) {

                                    autoMap[header] =
                                        "platformOrderId";
                                }

                                else if (
                                    lower.includes("qty")
                                ) {

                                    autoMap[header] =
                                        "qty";
                                }

                                else if (
                                    lower.includes("price")
                                ) {

                                    autoMap[header] =
                                        "sellingPrice";
                                }
                            });

                            setFieldMapping((prev) => {

                                // preserve manual mapping
                                if (
                                    Object.keys(prev)
                                        .length > 0
                                ) {

                                    return prev;
                                }

                                return autoMap;
                            });

                            setShowMapping(true);
                        }

                        setParsedRows(
                            rows
                        );

                        // setPreviewRows(
                        //     rows.slice(0, 10)
                        // );
                    },

                    // ====================================
                    // VALIDATED
                    // ====================================

                    onValidated: (
                        result
                    ) => {

                        setValidRows(
                            result.validRows || []
                        );

                        setInvalidRows(
                            result.invalidRows || []
                        );

                        setDuplicateRows(
                            result.duplicateRows || []
                        );
                    },

                    // ====================================
                    // MATCHED
                    // ====================================

                    onMatched: (
                        result
                    ) => {

                        setMatchedRows(
                            result.matched || []
                        );

                        setUnmatchedRows(
                            result.unmatched || []
                        );
                    },

                    // ====================================
                    // DUPLICATES
                    // ====================================

                    onDuplicates: (
                        result
                    ) => {

                        setDuplicateRows(
                            prev => [

                                ...prev,

                                ...(result.duplicateOrders || []),
                            ]
                        );
                    },

                    // ====================================
                    // PROGRESS
                    // ====================================

                    onProgress: ({
                        progress,
                        text,
                    }) => {

                        setProgress(
                            progress
                        );

                        setProgressText(
                            text
                        );
                    },

                    // ====================================
                    // COMPLETE
                    // ====================================

                    onComplete: (
                        result
                    ) => {

                        setReadyToImport(
                            result.readyToImport || []
                        );

                        setPreviewReady(true);

                        setLoading(false);
                    },

                    // ====================================
                    // ERROR
                    // ====================================

                    onError: (
                        err
                    ) => {

                        console.error(
                            err
                        );

                        setLoading(false);

                        alert(
                            "Import failed"
                        );
                    },
                });


            } catch (err) {

                console.error(err);

                setLoading(false);
            }
        };


    // ====================================
    // APPLY FIELD MAPPING
    // ====================================

    const applyFieldMapping =
        async () => {

            try {

                if (
                    !uploadedFile
                ) {

                    return;
                }

                setLoading(true);

                await MarketplaceImportEngine({

                    file:
                        uploadedFile,

                    user,

                    platform,

                    importType,

                    previewOnly: true,

                    fieldMapping,

                    onValidated: (
                        result
                    ) => {

                        setValidRows(
                            result.validRows || []
                        );

                        setInvalidRows(
                            result.invalidRows || []
                        );

                        setDuplicateRows(
                            result.duplicateRows || []
                        );
                    },

                    onMatched: (
                        result
                    ) => {

                        setMatchedRows(
                            result.matched || []
                        );

                        setUnmatchedRows(
                            result.unmatched || []
                        );
                    },

                    onDuplicates: (
                        result
                    ) => {

                        setDuplicateRows(
                            result.duplicateOrders || []
                        );
                    },

                    onComplete: (
                        result
                    ) => {

                        setReadyToImport(
                            result.readyToImport || []
                        );

                        setPreviewReady(true);

                        setLoading(false);
                    },

                    onError: (
                        err
                    ) => {

                        console.error(err);

                        setLoading(false);
                    },
                });

            } catch (err) {

                console.error(err);

                setLoading(false);
            }
        };

    // ====================================
    // CONFIRM IMPORT
    // ====================================

    const handleConfirmImport =
        async () => {

            const startTime = Date.now();

            if (!canCreateOrder) {

                alert(
                    orderValidation?.reason ||
                    "Order limit reached"
                );

                navigate("/upgrade-plan");

                return;
            }

            try {

                if (
                    !readyToImport.length
                ) {

                    return;
                }

                setImporting(true);

                setProgress(5);

                setProgressText(
                    "Preparing import..."
                );

                const executeOrdersImport =
                    (
                        await import(
                            "@/utils/import/executeOrdersImport"
                        )
                    ).default;

                // ====================================
                // REVALIDATE MATCHING
                // ====================================

                setProgress(15);
                setProgressText(
                    "Matching products..."
                );

                const reMatched =
                    await matchProductVariants({

                        rows:
                            readyToImport.map(
                                item => item.row
                            ),

                        user,
                    });

                // ====================================
                // RECHECK DUPLICATES
                // ====================================

                setProgress(35);
                setProgressText(
                    "Checking duplicate orders..."
                );

                const duplicateCheck =
                    await checkDuplicateOrders({

                        rows:
                            reMatched.matched,

                        user,
                    });

                const finalOrders =
                    duplicateCheck.newOrders || [];

                const importBatchId =
                    `IMPORT_${Date.now()}`;

                setProgress(50);
                setProgressText(
                    `Importing ${finalOrders.length} orders...`
                );

                const result =
                    await executeOrdersImport({

                        importBatchId,

                        matchedOrders:
                            finalOrders,

                        user,
                        sellerId:
                            user.uid,

                        userData,

                        platform,

                        onProgress: ({
                            progress,
                            text,
                        }) => {

                            setProgress(
                                progress
                            );

                            setProgressText(
                                text
                            );
                        },
                    });

                setImportResult(
                    result
                );

                setProgress(90);
                setProgressText(
                    "Saving import history..."
                );
                // ====================================
                // SAVE IMPORT HISTORY
                // ====================================

                // await addDoc(
                //     collection(
                //         db,
                //         "order_import_history"
                //     ),
                //     {

                //         importBatchId,

                //         sellerId:
                //             user.uid,

                //         fileName,

                //         platform,

                //         importType,

                //         // parsedRows,
                //         // readyToImport,
                //         csvHeaders,
                //         fieldMapping,

                //         importedOrderIds:
                //             result.orderIds || [],

                //         totalRows:
                //             parsedRows.length,

                //         importedCount:
                //             result.imported || 0,

                //         failedCount:
                //             result.failed || 0,

                //         duplicateCount:
                //             duplicateRows.length,

                //         unmatchedCount:
                //             unmatchedRows.length,

                //         status:
                //             "completed",

                //         uploadedAt:
                //             serverTimestamp(),
                //     }
                // );

                const historyPayload = {
                    importBatchId,

                    sellerId: user.uid,

                    fileName,

                    platform,

                    importType,

                    csvHeaders,

                    fieldMapping,

                    importedOrderIds:
                        result.orderIds || [],

                    totalRows:
                        parsedRows.length,

                    importedCount:
                        result.imported || 0,

                    failedCount:
                        result.failed || 0,

                    duplicateCount:
                        duplicateRows.length,

                    unmatchedCount:
                        unmatchedRows.length,

                    status: "completed",

                    uploadedAt:
                        serverTimestamp(),
                };

                if (historyId) {

                    await updateDoc(
                        doc(
                            db,
                            "order_import_history",
                            historyId
                        ),
                        historyPayload
                    );

                } else {

                    await addDoc(
                        collection(
                            db,
                            "order_import_history"
                        ),
                        historyPayload
                    );
                }

                alert(
                    "Orders imported successfully"
                );

                const duration =
                    Math.round(
                        (Date.now() - startTime) / 1000
                    );

                setProgressText(
                    `Import completed in ${duration}s`
                );
                setProgress(100);
                setProgressText(
                    "Import completed successfully"
                );
                setPreviewReady(false);

                setImporting(false);
            } catch (err) {

                console.error(err);

                setImporting(false);

                alert(
                    "Import failed"
                );
            }
        };

    // ====================================
    // DROP
    // ====================================

    const handleDrop = (
        e
    ) => {

        e.preventDefault();

        const file =
            e.dataTransfer.files[0];

        handleUpload(file);
    };

    // ====================================
    // RENDER
    // ====================================
    const canImport =
        readyToImport.length > 0 &&
        Object.keys(fieldMapping).length > 0;


    return (

        <div className="p-4 md:p-6">
            <button
                onClick={() =>
                    navigate(-1)
                }
                className="w-10 h-10 rounded-xl border border-gray-300 bg-zinc-800 flex items-center justify-center"
            >

                <ArrowLeft size={18} />

            </button>
            {/* ====================================
            HEADER
            ==================================== */}

            <div className="mb-6">


                <h1 className="text-2xl font-bold text-white">

                    Order Import

                    {historyId && (

                        <div
                            className="
            mt-4
            p-4
            rounded-xl
            border
            bg-yellow-500/10
border-yellow-500/30
        "
                        >

                            <div className="font-medium">

                                Re-import Mode

                            </div>

                            <div className="text-sm text-zinc-400 mt-1">

                                Previous field mapping loaded.
                                Upload the same file again to continue.

                            </div>

                        </div>
                    )}

                </h1>

                <p className="text-zinc-400 mt-1">

                    Import marketplace orders using CSV or Excel

                </p>

                <div className="mt-2">

                    <span
                        className="
        inline-flex
        px-3
        py-1
        rounded-lg
        bg-zinc-800 text-zinc-300
        text-sm
        "
                    >

                        Remaining Orders:
                        <strong className="ml-2">
                            {remainingOrders}
                        </strong>

                    </span>

                </div>

                {/* <OrderImportHistory /> */}


            </div>

            {/* ====================================
            SUMMARY
            ==================================== */}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">

                <SummaryCard
                    title="Parsed"
                    value={parsedRows.length}
                    icon={
                        <FileSpreadsheet size={18} />
                    }
                />

                <SummaryCard
                    title="Valid"
                    value={validRows.length}
                    icon={
                        <CheckCircle2 size={18} />
                    }
                />

                <SummaryCard
                    title="Invalid"
                    value={invalidRows.length}
                    icon={
                        <ShieldAlert size={18} />
                    }
                />

                <SummaryCard
                    title="Matched"
                    value={matchedRows.length}
                    icon={
                        <CheckCircle2 size={18} />
                    }
                />

                <SummaryCard
                    title="Unmatched"
                    value={unmatchedRows.length}
                    icon={
                        <AlertTriangle size={18} />
                    }
                />

                <SummaryCard
                    title="Duplicates"
                    value={duplicateRows.length}
                    icon={
                        <CopyCheck size={18} />
                    }
                />

            </div>

            {/* ====================================
            UPLOAD
            ==================================== */}

            <div
                onDrop={
                    handleDrop
                }

                onDragOver={(e) =>
                    e.preventDefault()
                }

                className="border-2 border-dashed border-zinc-700 rounded-3xl bg-zinc-900 p-10 text-center"
            >

                <div className="flex justify-center mb-4">

                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">

                        <Upload size={28} />

                    </div>

                </div>

                <h2 className="text-lg font-semibold text-white mb-2">

                    Drag & Drop CSV / Excel

                </h2>

                <p className="text-sm text-zinc-400 mb-4">

                    Upload Meesho, Amazon or Flipkart orders

                </p>

                {/* ====================================
                PLATFORM
                ==================================== */}

                <div className="flex justify-center mb-4">

                    <select
                        value={platform}
                        onChange={(e) =>
                            setPlatform(
                                e.target.value
                            )
                        }
                        className="px-4 py-2 bg-zinc-800 text-white rounded-xl border border-zinc-700"
                    >

                        <option value="meesho">

                            Meesho

                        </option>

                    </select>

                </div>

                {/* ====================================
                BUTTON
                ==================================== */}

                <button
                    onClick={() =>
                        fileInputRef.current.click()
                    }
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
                >

                    Choose File

                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    hidden
                    onChange={(e) =>
                        handleUpload(
                            e.target.files[0]
                        )
                    }
                    className="border border-gray-300 bg-white text-white"
                />

                {/* ====================================
                FILE
                ==================================== */}

                {fileName && (

                    <div className="mt-4 text-sm font-medium text-zinc-300">

                        {fileName}

                    </div>
                )}

            </div>

            {/* ====================================
PROGRESS OVERLAY
==================================== */}

            {(loading || importing) && (
                <div
                    className="
            fixed inset-0
            z-[9999]
            bg-black/70
            backdrop-blur-sm
            flex items-center justify-center
        "
                >
                    <div
                        className="
                w-full max-w-md
                mx-4
                bg-zinc-900
                border border-zinc-800
                rounded-2xl
                p-6
                shadow-2xl
            "
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Loader2
                                size={20}
                                className="animate-spin text-white"
                            />

                            <div>
                                <div className="text-sm font-medium text-white">
                                    {progressText}
                                </div>

                                <div className="text-xs text-zinc-400 mt-1">
                                    {progress}% Complete
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-3 rounded-full bg-zinc-700 overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-300"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ====================================
            CONFIRM IMPORT
            ==================================== */}

            {previewReady && (

                <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                            <h2 className="text-lg font-semibold text-white">

                                Import Preview Ready

                            </h2>

                            <p className="text-sm text-zinc-400 mt-1">

                                Review validation, duplicates and unmatched rows before importing.

                            </p>

                        </div>

                        <button
                            onClick={
                                handleConfirmImport
                            }

                            disabled={
                                importing ||
                                !canImport
                            }

                            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium disabled:opacity-50"
                        >

                            {importing
                                ? "Importing..."
                                : `Confirm Import (${readyToImport.length})`
                            }

                        </button>

                    </div>

                </div>
            )}

            {/* ====================================
            IMPORT RESULT
            ==================================== */}

            {importResult && (

                <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">

                    <h2 className="font-semibold text-white mb-4">

                        Import Result

                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                        <SummaryCard
                            title="Imported"
                            value={
                                importResult.imported || 0
                            }
                        />

                        <SummaryCard
                            title="Failed"
                            value={
                                importResult.failed || 0
                            }
                        />

                    </div>

                </div>
            )}

            {/* ====================================
            Manual Field Mapping
            ==================================== */}

            {showMapping && (

    <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

        <div className="flex items-center justify-between mb-5">

            <div>

                <h2 className="text-lg font-semibold text-white">

                    Field Mapping

                </h2>

                <p className="text-sm text-zinc-400 mt-1">

                    Match spreadsheet columns with order fields

                </p>

            </div>

            <div className="text-xs px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400">

                {csvHeaders.length} Columns

            </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {csvHeaders.map((header) => (

                <div
                    key={header}
                    className="
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-950
                        p-4
                    "
                >

                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">

                        Spreadsheet Column

                    </label>

                    <div className="text-white font-medium mb-4 break-all">

                        {header}

                    </div>

                    <select
                        value={fieldMapping[header] || ""}
                        onChange={(e) =>
                            setFieldMapping(prev => ({
                                ...prev,
                                [header]: e.target.value,
                            }))
                        }
                        className="
                            w-full
                            px-4
                            py-2.5
                            rounded-xl
                            border
                            border-zinc-700
                            bg-zinc-800
                            text-white
                            outline-none
                            focus:border-blue-500
                        "
                    >
                        <option value="">Ignore</option>
                        <option value="parentSKU">SKU ID</option>
                        <option value="productName">Product Name</option>
                        <option value="orderDate">Order Date</option>
                        <option value="platformOrderId">Order ID</option>
                        <option value="productId">Product ID</option>
                        <option value="variantSize">Variant Size</option>
                        <option value="qty">Quantity</option>
                        <option value="sellingPrice">Selling Price</option>
                        <option value="customerName">Customer Name</option>
                        <option value="awb">Courier Tracking ID</option>
                        <option value="orderStatus">Order Status</option>
                    </select>

                </div>
            ))}

        </div>

        <div className="mt-6 flex justify-end">

            <button
                onClick={applyFieldMapping}
                className="
                    px-6
                    py-2.5
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    font-medium
                    transition-colors
                "
            >
                Apply Mapping
            </button>

        </div>

    </div>
)}

            {/* ====================================
            PREVIEW
            ==================================== */}

            {validRows.length > 0 && (

                <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

                    <div className="p-4 border-b border-zinc-800">

                        <h2 className="font-semibold text-white">

                            File Preview

                        </h2>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1200px]">

                            <thead className="bg-zinc-800">

                                <tr>

                                    {Object.keys(
                                        validRows[0]
                                    ).map((key) => (

                                        <th
                                            key={key}
                                            className="px-4 py-3 text-left text-sm font-semibold text-white"
                                        >

                                            {key}

                                        </th>
                                    ))}

                                </tr>

                            </thead>

                            <tbody>

                                {validRows
                                    .slice(0, 10)
                                    .map(
                                        (
                                            row,
                                            index
                                        ) => (

                                            <tr
                                                key={index}
                                                className="border-t border-zinc-800 hover:bg-zinc-800/40"
                                            >

                                                {Object.values(
                                                    row
                                                ).map(
                                                    (
                                                        value,
                                                        i
                                                    ) => (

                                                        <td
                                                            key={i}
                                                            className="px-4 py-3 text-sm text-white"
                                                        >

                                                            {String(value)}

                                                        </td>
                                                    )
                                                )}

                                            </tr>
                                        )
                                    )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}

        </div>
    );
};

// ====================================
// SUMMARY CARD
// ====================================

const SummaryCard = ({
    title,
    value,
    icon,
}) => {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-zinc-400">
                    {title}
                </div>

                <div className="text-zinc-500">
                    {icon}
                </div>
            </div>

            <div className="text-2xl font-bold text-white">
                {value || 0}
            </div>
        </div>
    );
};

export default OrderImport;