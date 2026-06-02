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
    serverTimestamp,
} from "firebase/firestore";

import {
    ArrowLeft,
    FileSpreadsheet,
    Trash2,
    RotateCcw,
    CheckCircle2,
    Clock3,
    AlertTriangle,
    Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { db } from "@/firebase/config";

import rollbackImportedOrders
    from "@/utils/import/rollbackImportedOrders";


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


    const [rollbacking, setRollbacking] =
        useState(false);

    const [rollbackText, setRollbackText] =
        useState("");

    const [rollbackProgress, setRollbackProgress] =
        useState(0);
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

            // orderBy(
            //     "uploadedAt",
            //     "desc"
            // )
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
                        "Delete this import and rollback inventory?"
                    );

                if (!confirmDelete) {
                    return;
                }

                if (
                    item.status !==
                    "ready_for_remap"
                ) {

                    await rollbackImportedOrders({
                        importedOrderIds:
                            item.importedOrderIds || [],
                        sellerId:
                            user.uid,
                    });
                }

                await deleteDoc(

                    doc(
                        db,
                        "order_import_history",
                        item.id
                    )
                );

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
                        "Reset this import and allow re-import?"
                    );

                if (!confirmReset) {
                    return;
                }

                setRollbacking(true);
                setRollbackProgress(10);
                setRollbackText(
                    "Preparing rollback..."
                );

                setRollbackProgress(30);
                setRollbackText(
                    "Removing imported orders..."
                );

                await rollbackImportedOrders({

                    importedOrderIds:
                        item.importedOrderIds || [],

                    sellerId:
                        user.uid,
                });

                setRollbackProgress(80);
                setRollbackText(
                    "Updating import history..."
                );

                await updateDoc(
                    doc(db, "order_import_history", item.id),
                    {
                        status: "ready_for_remap",
                        importedOrderIds: [],
                        importedCount: 0,
                        resetAt: serverTimestamp(),
                    }
                );

                setRollbackProgress(100);
                setRollbackText(
                    "Rollback completed"
                );

                alert(
                    "Import reset successfully"
                );
                setTimeout(() => {
                    setRollbacking(false);
                }, 800);
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
                    return "bg-green-500/20 text-green-400";

                case "ready_for_remap":
                    return "bg-yellow-500/20 text-yellow-400";

                case "deleted":
                    return "bg-red-500/20 text-red-400";

                default:
                    return "bg-zinc-800 text-zinc-300";
            }
        };

    return (

        <div className="p-4 md:p-6">

            {/* ====================================
            BACK
            ==================================== */}

            <button
                onClick={() =>
                    navigate(-1)
                }
                className="w-10 h-10 rounded-xl border border-gray-300 bg-zinc-800 flex items-center justify-center mb-4"
            >

                <ArrowLeft size={18} />

            </button>

            {/* ====================================
            HEADER
            ==================================== */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-white">

                    Order Import History

                </h1>

                <p className="text-sm text-zinc-400 mt-1">

                    Track imported files, reset imports and manage history

                </p>

                <div className="flex items-center gap-2 mt-3">

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
                        {history.length} Records
                    </span>
                    {loading && (

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 animate-pulse">
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
                                item.status === "ready_for_remap"
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

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1200px]">

                        <thead className="bg-zinc-800 border-b border-zinc-700">

                            <tr>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-200">

                                    File Name

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-200">

                                    Platform

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-200">

                                    Total Rows

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-200">

                                    Imported

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-200">

                                    Duplicate

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-200">

                                    Unmatched

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-200">

                                    Uploaded

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-200">

                                    Status

                                </th>

                                <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-200">

                                    Actions

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="text-center py-10 text-zinc-400"
                                    >

                                        Loading history...

                                    </td>

                                </tr>

                            ) : history.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="text-center py-10 text-zinc-400"
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
                                            className="border-b border-zinc-800 hover:bg-zinc-800/40"
                                        >

                                            {/* FILE */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">

                                                        <FileSpreadsheet size={18} />

                                                    </div>

                                                    <div>

                                                        <div className="font-medium text-zinc-200">

                                                            {item.fileName || "-"}

                                                        </div>

                                                        <div className="text-xs text-zinc-400 mt-1">

                                                            {item.importType || "-"}

                                                        </div>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* PLATFORM */}

                                            <td className="px-4 py-4 text-sm text-zinc-300">

                                                {item.platform || "-"}

                                            </td>

                                            {/* TOTAL */}

                                            <td className="px-4 py-4 text-sm text-zinc-300">

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

                                            <td className="px-4 py-4 text-sm text-zinc-300">

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
                                                            handleReset(item)
                                                        }
                                                        className={`
                                                                w-9 h-9
                                                                rounded-xl
                                                                flex
                                                                items-center
                                                                justify-center
                                                                transition
                                                                ${item.status ===
                                                                "ready_for_remap"
                                                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                                                : "bg-yellow-500/20 text-yellow-400 hover:scale-105"
                                                            }
                                                        `}
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>


                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/seller/orders/import?history=${item.id}`
                                                            )
                                                        }
                                                        disabled={
                                                            item.status !==
                                                            "ready_for_remap"
                                                        }
                                                        className={`
        px-3 py-2
        rounded-xl
        text-xs
        font-medium
        transition
        ${item.status ===
                                                                "ready_for_remap"
                                                                ? "bg-blue-500/20 text-blue-400"
                                                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                                            }
    `}
                                                    >
                                                        Re-import
                                                    </button>


                                                    <button
                                                        onClick={() =>
                                                            handleDelete(item)
                                                        }
                                                        className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center hover:scale-105 transition"
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

            {rollbacking && (

                <div
                    className="
            fixed
            inset-0
            z-[9999]
            bg-black/80
            backdrop-blur-sm
            flex
            items-center
            justify-center
        "
                >

                    <div
                        className="
                w-full
                max-w-lg
                bg-zinc-900
                border
                border-zinc-800
                rounded-3xl
                p-8
            "
                    >

                        <div className="flex items-center gap-3 mb-6">

                            <Loader2
                                size={22}
                                className="animate-spin"
                            />

                            <div>

                                <div className="text-white font-semibold">

                                    Rolling Back Import

                                </div>

                                <div className="text-zinc-400 text-sm">

                                    Please don't close this page

                                </div>

                            </div>

                        </div>

                        <div className="text-zinc-300 mb-3">

                            {rollbackText}

                        </div>

                        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">

                            <div
                                className="h-full bg-yellow-500 transition-all duration-300"
                                style={{
                                    width: `${rollbackProgress}%`,
                                }}
                            />

                        </div>

                        <div className="text-right text-xs text-zinc-500 mt-2">

                            {rollbackProgress}%

                        </div>

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

export default OrderImportHistory;