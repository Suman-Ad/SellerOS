import { useState }
    from "react";


import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { Button }
    from "@/components/ui/button";

import { toast }
    from "sonner";

import {
    parseInternalFile,
} from "@/utils/import/internal/parseInternalFile";

import {
    validateInternalRows,
} from "@/utils/import/internal/validateInternalRows";

import { useAuth }
    from "@/context/AuthContext";

import {
    groupInternalProducts,
} from "@/utils/import/internal/groupInternalProducts";

import {
    importInternalProducts,
} from "@/utils/import/internal/importInternalProducts";

import { useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

export default function InternalProductImport() {
    const { user } =
        useAuth();
    const navigate =
        useNavigate();

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        rows,
        setRows,
    ] = useState([]);

    const [
        errors,
        setErrors,
    ] = useState([]);

    const handleFileUpload =
        async (e) => {

            const file =
                e.target.files[0];

            if (!file)
                return;

            try {

                setLoading(true);

                const parsedRows =
                    await parseInternalFile(
                        file
                    );

                setRows(
                    parsedRows
                );

                const validationErrors =
                    validateInternalRows(
                        parsedRows
                    );

                setErrors(
                    validationErrors
                );

                const grouped =
                    groupInternalProducts(
                        parsedRows
                    );

                setGroupedProducts(
                    grouped
                );

                toast.success(
                    `${parsedRows.length} rows loaded`
                );

            } catch (error) {

                console.error(
                    error
                );

                toast.error(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        };

    const [
        groupedProducts,
        setGroupedProducts,
    ] = useState([]);

    const handleImport =
        async () => {

            try {

                setLoading(true);

                await importInternalProducts(
                    groupedProducts,
                    user.uid
                );

                toast.success(
                    `${groupedProducts.length} products imported`
                );

                setRows([]);

                setErrors([]);

                setGroupedProducts([]);

            } catch (error) {

                console.error(
                    error
                );

                toast.error(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        };

    return (

        <div className="max-w-7xl mx-auto">
            <button
                            onClick={() =>
                                navigate(-1)
                            }
                            className="w-10 h-10 rounded-xl border border-gray-300 bg-zinc-800 flex items-center justify-center"
                        >
            
                            <ArrowLeft size={18} />
            
                        </button>

            <div className="mb-6">

                <h1 className="text-3xl font-bold text-white">
                    Internal Bulk Product Upload
                </h1>

                <p className="text-zinc-400 mt-2">
                    Upload products using SellerOS template
                </p>

            </div>

            <Card className="bg-zinc-900 border-zinc-800">

                <CardContent className="p-6 space-y-6">

                    {/* Upload */}

                    <div className="border-2 border-dashed border-zinc-700 rounded-xl p-10 text-center">

                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={
                                handleFileUpload
                            }
                            className="text-white"
                        />

                    </div>

                    {/* Summary */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="bg-zinc-800 rounded-xl p-4">

                            <p className="text-zinc-400 text-sm">
                                Total Rows
                            </p>

                            <h2 className="text-2xl font-bold text-white">
                                {rows.length}
                            </h2>

                        </div>

                        <div className="bg-zinc-800 rounded-xl p-4">

                            <p className="text-zinc-400 text-sm">
                                Validation Errors
                            </p>

                            <h2 className="text-2xl font-bold text-red-500">
                                {errors.length}
                            </h2>

                        </div>

                    </div>

                    {/* Errors */}

                    {errors.length > 0 && (

                        <div className="bg-red-950 border border-red-800 rounded-xl p-4">

                            <h2 className="text-red-400 font-semibold mb-3">
                                Validation Errors
                            </h2>

                            <div className="space-y-2">

                                {errors.map(
                                    (
                                        error,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                index
                                            }
                                            className="text-sm text-red-300"
                                        >

                                            Row {
                                                error.row
                                            }
                                            :
                                            {" "}
                                            {
                                                error.message
                                            }

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-zinc-800 rounded-xl p-4">

                    <p className="text-zinc-400 text-sm">
                        Grouped Products
                    </p>

                    <h2 className="text-2xl font-bold text-white">
                        {groupedProducts.length}
                    </h2>

                </div>

                <div className="bg-zinc-800 rounded-xl p-4">

                    <p className="text-zinc-400 text-sm">
                        Total Variants
                    </p>

                    <h2 className="text-2xl font-bold text-white">

                        {groupedProducts.reduce(
                            (
                                total,
                                product
                            ) =>
                                total +
                                Object.keys(
                                    product.variants
                                ).length,
                            0
                        )}

                    </h2>

                </div>

            </div>


                    {/* Preview */}

                    {rows.length > 0 && (

                        <div className="overflow-auto rounded-xl border border-zinc-800">

                            <table className="w-full text-sm">

                                <thead className="bg-zinc-800 text-zinc-300">

                                    <tr>

                                        {Object.keys(
                                            rows[0]
                                        ).map(
                                            (
                                                key
                                            ) => (

                                                <th
                                                    key={
                                                        key
                                                    }
                                                    className="p-3 text-left"
                                                >
                                                    {key}
                                                </th>

                                            )
                                        )}

                                    </tr>

                                </thead>

                                <tbody>

                                    {rows
                                        .slice(
                                            0,
                                            10
                                        )
                                        .map(
                                            (
                                                row,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        index
                                                    }
                                                    className="border-t border-zinc-800"
                                                >

                                                    {Object.values(
                                                        row
                                                    ).map(
                                                        (
                                                            value,
                                                            i
                                                        ) => (

                                                            <td
                                                                key={
                                                                    i
                                                                }
                                                                className="p-3 text-zinc-300"
                                                            >
                                                                {
                                                                    value
                                                                }
                                                            </td>

                                                        )
                                                    )}

                                                </tr>

                                            )
                                        )}

                                </tbody>

                            </table>

                        </div>

                    )}

                    <Button
                        onClick={handleImport}
                        disabled={
                            loading ||
                            errors.length > 0 ||
                            groupedProducts.length === 0
                        }
                        className="w-full"
                    >

                        {loading
                            ? "Importing..."
                            : `Import ${groupedProducts.length} Products`}

                    </Button>

                </CardContent>

            </Card>

            
        </div>
    );
}