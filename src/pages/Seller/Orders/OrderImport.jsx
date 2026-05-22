import React, {
    useRef,
    useState,
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

// ====================================
// PAGE
// ====================================

const OrderImport = () => {

    const { user, userData } =
        useAuth();

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

    // ====================================
    // HANDLE UPLOAD
    // ====================================

    const handleUpload =
        async (file) => {

            try {

                if (!file) return;

                setUploadedFile(file);

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

            try {

                if (
                    !readyToImport.length
                ) {

                    return;
                }

                setImporting(true);

                setProgress(0);

                setProgressText(
                    "Starting import..."
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

                const duplicateCheck =
                    await checkDuplicateOrders({

                        rows:
                            reMatched.matched,

                        user,
                    });

                const finalOrders =
                    duplicateCheck.newOrders || [];

                const result =
                    await executeOrdersImport({

                        matchedOrders:
                            finalOrders,

                        user,
                        sellerId:
                            user.uid,

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

                setPreviewReady(false);

                setImporting(false);

                alert(
                    "Orders imported successfully"
                );

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


                <h1 className="text-2xl font-bold text-gray-900">

                    Order Import

                </h1>

                <p className="text-gray-500 mt-1">

                    Import marketplace orders using CSV or Excel

                </p>

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

                className="border-2 border-dashed border-gray-300 rounded-3xl bg-white p-10 text-center"
            >

                <div className="flex justify-center mb-4">

                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">

                        <Upload size={28} />

                    </div>

                </div>

                <h2 className="text-lg font-semibold mb-2">

                    Drag & Drop CSV / Excel

                </h2>

                <p className="text-sm text-gray-500 mb-4">

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
                        className="px-4 py-2 bg-white text-gray-900 rounded-xl border border-gray-300"
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
                    className="px-5 py-2.5 rounded-xl bg-black text-white font-medium"
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
                    className="border border-gray-300 bg-white text-gray-900"
                />

                {/* ====================================
                FILE
                ==================================== */}

                {fileName && (

                    <div className="mt-4 text-sm font-medium text-gray-700">

                        {fileName}

                    </div>
                )}

            </div>

            {/* ====================================
            PROGRESS
            ==================================== */}

            {(loading || importing) && (

                <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-4">

                    <div className="flex items-center gap-3 mb-3">

                        <Loader2
                            size={18}
                            className="animate-spin"
                        />

                        <span className="text-sm font-medium text-gray-900">

                            {progressText}

                        </span>

                    </div>

                    <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">

                        <div
                            className="h-full bg-black transition-all"
                            style={{
                                width: `${progress}%`,
                            }}
                        />

                    </div>

                </div>
            )}

            {/* ====================================
            CONFIRM IMPORT
            ==================================== */}

            {previewReady && (

                <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                            <h2 className="text-lg font-semibold text-gray-900">

                                Import Preview Ready

                            </h2>

                            <p className="text-sm text-gray-500 mt-1">

                                Review validation, duplicates and unmatched rows before importing.

                            </p>

                        </div>

                        <button
                            onClick={
                                handleConfirmImport
                            }

                            disabled={
                                importing ||
                                !readyToImport.length
                            }

                            className="px-5 py-2.5 rounded-xl bg-black text-white font-medium disabled:opacity-50"
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

                <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-4">

                    <h2 className="font-semibold text-gray-900 mb-4">

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

                <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">

                    <h2 className="text-lg font-semibold text-gray-900 mb-4">

                        Field Mapping

                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {csvHeaders.map((header) => (

                            <div
                                key={header}
                                className="border border-gray-200 rounded-xl p-4"
                            >

                                <div className="text-sm font-medium text-gray-900 mb-2">

                                    {header}

                                </div>

                                <select
                                    value={
                                        fieldMapping[header] || ""
                                    }

                                    onChange={(e) =>
                                        setFieldMapping(
                                            prev => ({

                                                ...prev,

                                                [header]:
                                                    e.target.value,
                                            })
                                        )
                                    }

                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none"
                                >

                                    <option value="">

                                        Ignore

                                    </option>

                                    <option value="platformOrderId">

                                        Order ID

                                    </option>

                                    <option value="parentSKU">

                                        Parent SKU

                                    </option>

                                    <option value="variantSku">

                                        Variant SKU

                                    </option>

                                    <option value="qty">

                                        Quantity

                                    </option>

                                    <option value="sellingPrice">

                                        Selling Price

                                    </option>

                                    <option value="customerName">

                                        Customer Name

                                    </option>

                                </select>

                            </div>
                        ))}
                    </div>
                    <div className="mt-5 flex justify-end">

                        <button
                            onClick={
                                applyFieldMapping
                            }

                            className="px-5 py-2.5 rounded-xl bg-black text-white font-medium"
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

                <div className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    <div className="p-4 border-b border-gray-200">

                        <h2 className="font-semibold text-gray-900">

                            File Preview

                        </h2>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1200px]">

                            <thead className="bg-gray-100">

                                <tr>

                                    {Object.keys(
                                        validRows[0]
                                    ).map((key) => (

                                        <th
                                            key={key}
                                            className="px-4 py-3 text-left text-sm font-semibold text-gray-900"
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
                                                className="border-t border-gray-200 hover:bg-gray-50"
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
                                                            className="px-4 py-3 text-sm text-gray-900"
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

        <div className="bg-white border border-gray-200 rounded-2xl p-4">

            <div className="flex items-center justify-between mb-3">

                <div className="text-sm text-gray-500">

                    {title}

                </div>

                {icon}

            </div>

            <div className="text-2xl font-bold text-gray-900">

                {value || 0}

            </div>

        </div>
    );
};

export default OrderImport;