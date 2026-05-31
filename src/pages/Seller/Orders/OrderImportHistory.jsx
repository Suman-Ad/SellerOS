import React, {
    useEffect,
    useState,
} from "react";

import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc,
    getDocs,
    writeBatch,
} from "firebase/firestore";

import {
    ArrowLeft,
    FileSpreadsheet,
    Trash2,
    RotateCcw,
    CheckCircle2,
    Clock3,
    AlertTriangle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { db } from "@/firebase/config";


const OrderImportHistory = () => {

    const navigate =
        useNavigate();

    const { user } =
        useAuth();

    const [history,
        setHistory] =
        useState([]);

    const [loading,
        setLoading] =
        useState(true);

    // ====================================
    // FETCH HISTORY
    // ====================================

    useEffect(() => {

        if (!user?.uid) {

            setLoading(false);

            return;
        }

        const q = query(

            collection(
                db,
                "order_import_history"
            ),

            where(
                "sellerId",
                "==",
                user.uid
            ),

            orderBy(
                "uploadedAt",
                "desc"
            )
        );

        const unsubscribe =
            onSnapshot(

                q,

                (snapshot) => {

                    console.log(
                        "Docs:",
                        snapshot.docs.length
                    );

                    const list =
                        snapshot.docs.map(
                            (docItem) => ({

                                id:
                                    docItem.id,

                                ...docItem.data(),
                            })
                        );

                    console.log(
                        "Import History:",
                        list
                    );

                    setHistory(list);

                    setLoading(false);
                },

                (error) => {

                    console.error(
                        "History Fetch Error:",
                        error
                    );

                    setLoading(false);
                }
            );

        return () =>
            unsubscribe();

    }, [user?.uid]);

    // ====================================
    // DELETE HISTORY
    // ====================================

    const handleDelete =
        async (item) => {

            try {

                const confirmDelete =
                    window.confirm(
                        "Delete this import and all imported orders?"
                    );

                if (!confirmDelete) {

                    return;
                }

                // ====================================
                // FIND IMPORTED ORDERS
                // ====================================



                const batch = writeBatch(db);

                for (const orderId of item.importedOrderIds || []) {

                    batch.delete(
                        doc(db, "orders", orderId)
                    );

                }

                batch.delete(
                    doc(
                        db,
                        "order_import_history",
                        item.id
                    )
                );

                // batch.update(
                //     doc(db, "order_import_history", item.id),
                //     {
                //         status: "ready_for_remap",
                //         resetAt: new Date()
                //     }
                // );

                await batch.commit();

                alert(
                    "Import deleted successfully"
                );

            } catch (err) {

                console.error(err);

                alert(
                    "Delete failed"
                );
            }
        };

    // ====================================
    // RESET STATUS
    // ====================================

    const handleReset =
        async (item) => {

            try {

                const confirmReset =
                    window.confirm(
                        "Reset this import and allow remapping again?"
                    );

                if (!confirmReset) {

                    return;
                }

                // ====================================
                // FIND IMPORTED ORDERS
                // ====================================

                for (const orderId of item.importedOrderIds || []) {
                    batch.delete(
                        doc(db, "orders", orderId)
                    );
                }

                const batch =
                    writeBatch(db);

                batch.update(
                    doc(db, "order_import_history", item.id),
                    {
                        status: "ready_for_remap",
                        resetAt: new Date()
                    }
                );

                // ====================================
                // UPDATE HISTORY
                // ====================================

                // batch.update(
                //     doc(
                //         db,
                //         "order_import_history",
                //         item.id
                //     ),
                //     {
                //         status:
                //             "reset",

                //         resetAt:
                //             new Date(),
                //     }
                // );

                await batch.commit();

                alert(
                    "Import reset successfully"
                );

            } catch (err) {

                console.error(err);

                alert(
                    "Reset failed"
                );
            }
        };
    // ====================================
    // STATUS STYLE
    // ====================================

    const getStatusStyle =
        (status) => {

            switch (status) {

                case "completed":

                    return "bg-green-100 text-green-700";

                case "reset":

                    return "bg-yellow-100 text-yellow-700";

                case "deleted":

                    return "bg-red-100 text-red-700";

                default:

                    return "bg-gray-100 text-gray-700";
            }
        };

    return (

        <div className="p-4 md:p-6">

            {/* ====================================
            BACK
            ==================================== */}

            {/* <button
                onClick={() =>
                    navigate(-1)
                }
                className="w-10 h-10 rounded-xl border border-gray-300 bg-zinc-800 flex items-center justify-center mb-4"
            >

                <ArrowLeft size={18} />

            </button> */}

            {/* ====================================
            HEADER
            ==================================== */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-gray-900">

                    Order Import History

                </h1>

                <p className="text-sm text-gray-500 mt-1">

                    Track imported files, reset imports and manage history

                </p>

                <div className="flex items-center gap-2 mt-3">

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {history.length} Records
                    </span>
                    {loading && (

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 animate-pulse">
                            Loading...
                        </span>
                    )}
                </div>

            </div>

            {/* ====================================
            SUMMARY
            ==================================== */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                <SummaryCard
                    title="Total Files"
                    value={history.length}
                    icon={
                        <FileSpreadsheet size={18} />
                    }
                />

                <SummaryCard
                    title="Completed"
                    value={
                        history.filter(
                            item =>
                                item.status ===
                                "completed"
                        ).length
                    }
                    icon={
                        <CheckCircle2 size={18} />
                    }
                />

                <SummaryCard
                    title="Reset"
                    value={
                        history.filter(
                            item =>
                                item.status ===
                                "reset"
                        ).length
                    }
                    icon={
                        <RotateCcw size={18} />
                    }
                />

                <SummaryCard
                    title="Pending"
                    value={
                        history.filter(
                            item =>
                                item.status ===
                                "pending"
                        ).length
                    }
                    icon={
                        <Clock3 size={18} />
                    }
                />

            </div>

            {/* ====================================
            TABLE
            ==================================== */}

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1200px]">

                        <thead className="bg-gray-100 border-b border-gray-200">

                            <tr>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    File Name

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    Platform

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    Total Rows

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    Imported

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    Duplicate

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    Unmatched

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    Uploaded

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    Status

                                </th>

                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">

                                    Actions

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="text-center py-10 text-gray-500"
                                    >

                                        Loading history...

                                    </td>

                                </tr>

                            ) : history.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="text-center py-10 text-gray-500"
                                    >

                                        No import history found.
                                        Try importing a file first.

                                    </td>

                                </tr>

                            ) : (

                                history.map(
                                    (item) => (

                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >

                                            {/* FILE */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">

                                                        <FileSpreadsheet size={18} />

                                                    </div>

                                                    <div>

                                                        <div className="font-medium text-gray-900">

                                                            {item.fileName || "-"}

                                                        </div>

                                                        <div className="text-xs text-gray-500 mt-1">

                                                            {item.importType || "-"}

                                                        </div>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* PLATFORM */}

                                            <td className="px-4 py-4 text-sm text-gray-700">

                                                {item.platform || "-"}

                                            </td>

                                            {/* TOTAL */}

                                            <td className="px-4 py-4 text-sm text-gray-700">

                                                {item.totalRows || 0}

                                            </td>

                                            {/* IMPORTED */}

                                            <td className="px-4 py-4 text-sm font-semibold text-green-600">

                                                {item.importedCount || 0}

                                            </td>

                                            {/* DUPLICATES */}

                                            <td className="px-4 py-4 text-sm font-semibold text-yellow-600">

                                                {item.duplicateCount || 0}

                                            </td>

                                            {/* UNMATCHED */}

                                            <td className="px-4 py-4 text-sm font-semibold text-red-600">

                                                {item.unmatchedCount || 0}

                                            </td>

                                            {/* DATE */}

                                            <td className="px-4 py-4 text-sm text-gray-700">

                                                {item.uploadedAt?.toDate
                                                    ? item.uploadedAt
                                                        .toDate()
                                                        .toLocaleString()
                                                    : "-"}

                                            </td>

                                            {/* STATUS */}

                                            <td className="px-4 py-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                                        item.status
                                                    )}`}
                                                >

                                                    {item.status || "-"}

                                                </span>

                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center justify-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/seller/orders/import?history=${item.id}`
                                                            )
                                                        }
                                                    >
                                                        Re-import
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(item)
                                                        }
                                                        className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center hover:scale-105 transition"
                                                    >

                                                        <Trash2 size={16} />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

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

export default OrderImportHistory;