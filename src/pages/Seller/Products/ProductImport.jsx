import {
    useState,
} from "react";

import {
    Upload,
    CheckCircle2,
    AlertTriangle,
    Boxes,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import parseCSV from "@/utils/import/parseCSV";

import normalizeImportRows from "@/utils/import/normalizeImportRows";

import groupInventoryProducts from "@/utils/import/groupInventoryProducts";

import checkDuplicateProducts from "@/utils/import/checkDuplicateProducts";

import executeInventoryImport from "@/utils/import/executeInventoryImport";

// ====================================
// PAGE
// ====================================

const ProductImport = () => {

    const { user } =
        useAuth();

    // ====================================
    // STATE
    // ====================================

    const [loading,
        setLoading] =
        useState(false);

    const [progress,
        setProgress] =
        useState(0);

    const [progressText,
        setProgressText] =
        useState("");

    const [products,
        setProducts] =
        useState([]);

    const [duplicateProducts,
        setDuplicateProducts] =
        useState([]);

    const [readyProducts,
        setReadyProducts] =
        useState([]);

    const [importResult,
        setImportResult] =
        useState(null);

    const [uploadedFile,
        setUploadedFile] =
        useState(null);

    const [csvHeaders,
        setCsvHeaders] =
        useState([]);

    const [fieldMapping,
        setFieldMapping] =
        useState({});

    const [showMapping,
        setShowMapping] =
        useState(false);

    const [parsedRows,
        setParsedRows] =
        useState([]);



    // ====================================
    // HANDLE FILE
    // ====================================

    const handleUpload =
        async (file) => {

            try {

                if (!file) return;

                setUploadedFile(file);

                setLoading(true);

                // ====================================
                // PARSE CSV
                // ====================================

                const rows =
                    await parseCSV(file);

                setParsedRows(rows);

                // ====================================
                // CSV HEADERS
                // ====================================

                if (rows?.length) {

                    const headers =
                        Object.keys(rows[0]);

                    setCsvHeaders(headers);

                    // ====================================
                    // AUTO MAP
                    // ====================================

                    const autoMap = {};

                    headers.forEach((header) => {

                        const lower =
                            header.toLowerCase();

                        if (
                            lower.includes("variant")
                        ) {

                            autoMap[header] =
                                "variantSku";
                        }

                        else if (
                            lower.includes("sku")
                        ) {

                            autoMap[header] =
                                "parentSKU";
                        }

                        else if (
                            lower.includes("size")
                        ) {

                            autoMap[header] =
                                "size";
                        }

                        else if (
                            lower.includes("qty")
                        ) {

                            autoMap[header] =
                                "qty";
                        }

                        else if (
                            lower.includes("buy")
                        ) {

                            autoMap[header] =
                                "buyingPrice";
                        }

                        else if (
                            lower.includes("sell")
                        ) {

                            autoMap[header] =
                                "sellingPrice";
                        }

                        else if (
                            lower.includes("name")
                        ) {

                            autoMap[header] =
                                "productName";
                        }

                        else if (
                            lower.includes("brand")
                        ) {

                            autoMap[header] =
                                "brand";
                        }
                    });

                    setFieldMapping(autoMap);

                    setShowMapping(true);

                    // ====================================
                    // AUTO PROCESS FIRST TIME
                    // ====================================

                    await processImport(
                        rows,
                        autoMap
                    );
                }

                setLoading(false);

            } catch (err) {

                console.error(err);

                setLoading(false);
            }
        };

    const processImport =
        async (
            rows,
            mapping
        ) => {

            try {

                setLoading(true);

                // ====================================
                // NORMALIZE
                // ====================================

                const normalizedRows =
                    normalizeImportRows({

                        rows,

                        platform:
                            "meesho",

                        importType:
                            "inventory",

                        fieldMapping:
                            mapping,
                    });

                // ====================================
                // GROUP PRODUCTS
                // ====================================

                const groupedProducts =
                    groupInventoryProducts({

                        rows:
                            normalizedRows,
                    });

                setProducts(
                    groupedProducts
                );

                // ====================================
                // CHECK DUPLICATES
                // ====================================

                const duplicateCheck =
                    await checkDuplicateProducts({

                        products:
                            groupedProducts,

                        user,
                    });

                setReadyProducts(

                    duplicateCheck
                        .uniqueProducts || []
                );

                setDuplicateProducts(

                    duplicateCheck
                        .duplicateProducts || []
                );

                setLoading(false);

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
                    !parsedRows.length
                ) {

                    return;
                }

                setLoading(true);

                // ====================================
                // FORCE LATEST STATE COPY
                // ====================================

                const latestMapping =
                    JSON.parse(
                        JSON.stringify(
                            fieldMapping
                        )
                    );

                // ====================================
                // NORMALIZE
                // ====================================

                const normalizedRows =
                    normalizeImportRows({

                        rows:
                            parsedRows,

                        platform:
                            "meesho",

                        importType:
                            "inventory",

                        fieldMapping:
                            latestMapping,
                    });

                console.log(
                    "FIELD MAPPING",
                    latestMapping
                );

                console.log(
                    "NORMALIZED ROWS",
                    normalizedRows
                );

                // ====================================
                // GROUP PRODUCTS
                // ====================================

                const groupedProducts =
                    groupInventoryProducts({

                        rows:
                            normalizedRows,
                    });

                console.log(
                    "GROUPED PRODUCTS",
                    groupedProducts
                );

                setProducts(
                    [...groupedProducts]
                );

                // ====================================
                // CHECK DUPLICATES
                // ====================================

                const duplicateCheck =
                    await checkDuplicateProducts({

                        products:
                            groupedProducts,

                        user,
                    });

                setReadyProducts(

                    [
                        ...(
                            duplicateCheck
                                .uniqueProducts || []
                        )
                    ]
                );

                setDuplicateProducts(

                    [
                        ...(
                            duplicateCheck
                                .duplicateProducts || []
                        )
                    ]
                );

                setLoading(false);

            } catch (err) {

                console.error(err);

                setLoading(false);
            }
        };
    // ====================================
    // IMPORT
    // ====================================

    const handleImport =
        async () => {

            try {

                setLoading(true);

                const result =
                    await executeInventoryImport({

                        products:
                            readyProducts,

                        user,

                        onProgress:
                            ({
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

                setLoading(false);

            } catch (err) {

                console.error(err);

                setLoading(false);
            }
        };

    // ====================================
    // RENDER
    // ====================================

    return (

        <div className="p-4 md:p-6">

            {/* ====================================
            HEADER
            ==================================== */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-gray-900">

                    Product Import

                </h1>

                <p className="text-sm text-gray-500 mt-1">

                    Import marketplace-ready product catalog

                </p>

            </div>

            {/* ====================================
            UPLOAD
            ==================================== */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6">

                <label className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">

                    <Upload
                        size={40}
                        className="text-gray-400 mb-4"
                    />

                    <div className="text-lg font-semibold text-gray-900">

                        Upload Product CSV

                    </div>

                    <div className="text-sm text-gray-500 mt-1">

                        CSV / Excel export supported

                    </div>

                    <input
                        type="file"
                        accept=".csv"

                        className="hidden"

                        onChange={(e) =>
                            handleUpload(
                                e.target.files[0]
                            )
                        }
                    />

                </label>

            </div>

            {/* ====================================
            PROGRESS
            ==================================== */}

            {loading && (

                <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">

                    <div className="flex items-center justify-between mb-3">

                        <span className="text-sm font-medium text-gray-900">

                            {progressText || "Processing..."}

                        </span>

                        <span className="text-sm text-gray-500">

                            {progress}%

                        </span>

                    </div>

                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                        <div
                            className="h-full bg-black transition-all"
                            style={{
                                width:
                                    `${progress}%`,
                            }}
                        />

                    </div>

                </div>
            )}

            {showMapping && (

                <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">

                    <h2 className="text-lg font-semibold text-gray-900 mb-5">

                        Field Mapping

                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {csvHeaders.map(
                            (header) => (

                                <div
                                    key={header}
                                    className="border border-gray-200 rounded-xl p-4"
                                >

                                    <div className="text-sm font-medium text-gray-900 mb-2">

                                        {header}

                                    </div>

                                    <select
                                        value={
                                            fieldMapping[
                                            header
                                            ] || ""
                                        }

                                        onChange={(e) => {

                                            const value =
                                                e.target.value;

                                            setFieldMapping(
                                                prev => ({

                                                    ...prev,

                                                    [header]:
                                                        value,
                                                })
                                            );
                                        }}

                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none"
                                    >

                                        <option value="">
                                            Ignore
                                        </option>

                                        <option value="parentSKU">
                                            Parent SKU
                                        </option>

                                        <option value="variantSku">
                                            Variant SKU
                                        </option>

                                        <option value="productName">
                                            Product Name
                                        </option>

                                        <option value="category">
                                            Category
                                        </option>

                                        <option value="subCategory">
                                            Sub Category
                                        </option>

                                        <option value="brand">
                                            Brand
                                        </option>

                                        <option value="color">
                                            Color
                                        </option>

                                        <option value="size">
                                            Size
                                        </option>

                                        <option value="qty">
                                            Quantity
                                        </option>

                                        <option value="buyingPrice">
                                            Buying Price
                                        </option>

                                        <option value="sellingPrice">
                                            Selling Price
                                        </option>

                                    </select>

                                </div>
                            )
                        )}

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
            SUMMARY
            ==================================== */}

            {(products.length > 0 ||
                duplicateProducts.length > 0) && (

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

                        <SummaryCard
                            title="Detected Products"
                            value={
                                products.length
                            }
                            icon={
                                <Boxes size={18} />
                            }
                        />

                        <SummaryCard
                            title="Ready To Import"
                            value={
                                readyProducts.length
                            }
                            icon={
                                <CheckCircle2 size={18} />
                            }
                        />

                        <SummaryCard
                            title="Duplicates"
                            value={
                                duplicateProducts.length
                            }
                            icon={
                                <AlertTriangle size={18} />
                            }
                        />

                    </div>
                )}

            {/* ====================================
PRODUCT PREVIEW
==================================== */}

            {products.length > 0 && (

                <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    {/* HEADER */}

                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">

                        <div>

                            <h2 className="text-lg font-semibold text-gray-900">

                                Product Preview

                            </h2>

                            <p className="text-sm text-gray-500 mt-1">

                                Review grouped products before import

                            </p>

                        </div>

                        <div className="text-sm text-gray-500">

                            Total:
                            {" "}
                            {products.length}
                        </div>

                    </div>

                    {/* TABLE */}

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px]">

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                        Parent SKU

                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                        Product

                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                        Brand

                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                        Category

                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">

                                        Variants

                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">

                                        Total Qty

                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">

                                        Status

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {products.map(
                                    (
                                        product,
                                        index
                                    ) => {

                                        // ====================================
                                        // VARIANTS
                                        // ====================================

                                        const variants =
                                            Object.values(
                                                product.variants || {}
                                            );

                                        // ====================================
                                        // TOTAL QTY
                                        // ====================================

                                        const totalQty =
                                            variants.reduce(

                                                (
                                                    total,
                                                    variant
                                                ) => {

                                                    return (

                                                        total +

                                                        Number(
                                                            variant.qty || 0
                                                        )
                                                    );
                                                },

                                                0
                                            );

                                        // ====================================
                                        // DUPLICATE
                                        // ====================================

                                        const isDuplicate =
                                            duplicateProducts.some(

                                                (
                                                    duplicate
                                                ) =>

                                                    duplicate.parentSKU ===
                                                    product.parentSKU
                                            );

                                        return (

                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition"
                                            >

                                                {/* SKU */}

                                                <td className="px-4 py-4">

                                                    <div className="font-semibold text-gray-900">

                                                        {product.parentSKU}

                                                    </div>

                                                </td>

                                                {/* PRODUCT */}

                                                <td className="px-4 py-4">

                                                    <div>

                                                        <div className="font-medium text-gray-900">

                                                            {product.productName || "-"}

                                                        </div>

                                                        <div className="text-xs text-gray-500 mt-1">

                                                            {product.color || "-"}

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* BRAND */}

                                                <td className="px-4 py-4 text-sm text-gray-700">

                                                    {product.brand || "-"}

                                                </td>

                                                {/* CATEGORY */}

                                                <td className="px-4 py-4">

                                                    <div className="text-sm text-gray-900">

                                                        {product.category || "-"}

                                                    </div>

                                                    <div className="text-xs text-gray-500 mt-1">

                                                        {product.subCategory || "-"}

                                                    </div>

                                                </td>

                                                {/* VARIANTS */}

                                                <td className="px-4 py-4 text-center">

                                                    <div className="font-semibold text-gray-900">

                                                        {variants.length}

                                                    </div>

                                                </td>

                                                {/* TOTAL QTY */}

                                                <td className="px-4 py-4 text-center">

                                                    <div className="font-semibold text-gray-900">

                                                        {totalQty}

                                                    </div>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-4 py-4 text-center">

                                                    {isDuplicate ? (

                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">

                                                            Duplicate

                                                        </span>

                                                    ) : (

                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">

                                                            Ready

                                                        </span>

                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}

            {/* ====================================
            DUPLICATES
            ==================================== */}

            {duplicateProducts.length > 0 && (

                <div className="mt-6 bg-white border border-red-200 rounded-2xl overflow-hidden">

                    <div className="px-5 py-4 border-b border-red-100 bg-red-50">

                        <h2 className="font-semibold text-red-700">

                            Duplicate Products

                        </h2>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                        Parent SKU

                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                        Product Name

                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                        Reason

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {duplicateProducts.map(
                                    (
                                        product,
                                        index
                                    ) => (

                                        <tr
                                            key={index}
                                            className="border-t border-gray-100"
                                        >

                                            <td className="px-4 py-3 text-sm text-gray-900">

                                                {product.parentSKU}

                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700">

                                                {product.productName}

                                            </td>

                                            <td className="px-4 py-3 text-sm text-red-600 font-medium">

                                                {product.duplicateReason}

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}

            {/* ====================================
            IMPORT BUTTON
            ==================================== */}

            {readyProducts.length > 0 && (

                <div className="mt-6 flex justify-end">

                    <button
                        onClick={
                            handleImport
                        }

                        disabled={
                            loading
                        }

                        className="px-6 py-3 rounded-2xl bg-black text-white font-semibold disabled:opacity-50"
                    >

                        Import Products

                    </button>

                </div>
            )}

            {/* ====================================
            RESULT
            ==================================== */}

            {importResult && (

                <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">

                    <h2 className="font-semibold text-green-700 mb-2">

                        Import Completed

                    </h2>

                    <div className="text-sm text-green-700">

                        Imported:
                        {" "}
                        {importResult.imported || 0}
                        {" "}
                        products

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

        <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <div className="flex items-center justify-between mb-3">

                <div className="text-sm font-medium text-gray-500">

                    {title}

                </div>

                <div className="text-gray-700">

                    {icon}

                </div>

            </div>

            <div className="text-3xl font-bold text-gray-900">

                {value}

            </div>

        </div>
    );
};

export default ProductImport;