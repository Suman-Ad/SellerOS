// src/pages/seller/Orders/Orders.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
    Package,
    Truck,
    CheckCircle2,
    RotateCcw,
    Clock3,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const navigate = useNavigate();

    // ============================
    // Fetch Orders
    // ============================

    useEffect(() => {
        const q = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setOrders(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ============================
    // Status Update
    // ============================

    const updateOrderStatus = async (id, status) => {
        try {
            await updateDoc(doc(db, "orders", id), {
                orderStatus: status,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

    // ============================
    // Toggle Packed
    // ============================

    const togglePacked = async (id, value) => {
        try {
            await updateDoc(doc(db, "orders", id), {
                packed: value,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error(error);
        }
    };

    // ============================
    // Get Status Style
    // ============================

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            case "Packed":
                return "bg-blue-100 text-blue-700";

            case "Shipped":
                return "bg-purple-100 text-purple-700";

            case "Delivered":
                return "bg-green-100 text-green-700";

            case "RTO":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ============================
    // Filters
    // ============================

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                order.platformOrderId?.toLowerCase().includes(searchValue) ||
                order.variantSku?.toLowerCase().includes(searchValue) ||
                order.productName?.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "All" ||
                order.orderStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    // ============================
    // Summary
    // ============================

    const summary = useMemo(() => {
        return {
            total: orders.length,
            pending: orders.filter((o) => o.orderStatus === "Pending").length,
            packed: orders.filter((o) => o.orderStatus === "Packed").length,
            shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
            delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
            rto: orders.filter((o) => o.orderStatus === "RTO").length,
        };
    }, [orders]);

    // ============================
    // Profit
    // ============================

    const calculateProfit = (order) => {
        const settlement = Number(order.settlementAmount || 0);
        const cost = Number(order.productCost || 0);
        const shipping = Number(order.shippingCost || 0);
        const extra = Number(order.extraCost || 0);

        return settlement - cost - shipping - extra;
    };

    return (
        <div className="p-4 md:p-6">
            {/* ====================================
          Header
      ==================================== */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Orders Management
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage marketplace orders and fulfillment
                    </p>
                    <Button
                            onClick={() =>
                                navigate(
                                    "/seller/orders/import"
                                )
                            }
                        >
                            Import Orders
                        </Button>
                </div>
            </div>

            {/* ====================================
          Summary Cards
      ==================================== */}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <SummaryCard
                    title="Total"
                    value={summary.total}
                    icon={<Package size={18} />}
                />

                <SummaryCard
                    title="Pending"
                    value={summary.pending}
                    icon={<Clock3 size={18} />}
                />

                <SummaryCard
                    title="Packed"
                    value={summary.packed}
                    icon={<Package size={18} />}
                />

                <SummaryCard
                    title="Shipped"
                    value={summary.shipped}
                    icon={<Truck size={18} />}
                />

                <SummaryCard
                    title="Delivered"
                    value={summary.delivered}
                    icon={<CheckCircle2 size={18} />}
                />

                <SummaryCard
                    title="RTO"
                    value={summary.rto}
                    icon={<RotateCcw size={18} />}
                />
            </div>

            {/* ====================================
          Filters
      ==================================== */}

            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}

                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search order, SKU, product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    {/* Status Filter */}

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="RTO">RTO</option>
                    </select>
                </div>
            </div>

            {/* ====================================
          Orders Table
      ==================================== */}

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr className="text-left text-sm text-gray-700">
                                <th className="px-4 py-3 font-semibold">Order ID</th>
                                <th className="px-4 py-3 font-semibold">Marketplace</th>
                                <th className="px-4 py-3 font-semibold">Product</th>
                                <th className="px-4 py-3 font-semibold">SKU</th>
                                <th className="px-4 py-3 font-semibold">Qty</th>
                                <th className="px-4 py-3 font-semibold">Selling</th>
                                <th className="px-4 py-3 font-semibold">Settlement</th>
                                <th className="px-4 py-3 font-semibold">Profit</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">
                                    Packed
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
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="text-center py-10 text-gray-500"
                                    >
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const profit = calculateProfit(order);

                                    return (
                                        <tr
                                            key={order.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                                        >
                                            {/* Order ID */}

                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {order.platformOrderId || "-"}
                                                </div>

                                                <div className="text-xs text-gray-500 mt-1">
                                                    {order.createdAt?.toDate
                                                        ? order.createdAt
                                                            .toDate()
                                                            .toLocaleDateString()
                                                        : "-"}
                                                </div>
                                            </td>

                                            {/* Marketplace */}

                                            <td className="px-4 py-4">
                                                <MarketplaceBadge
                                                    marketplace={order.platform}
                                                />
                                            </td>

                                            {/* Product */}

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={
                                                            order.image ||
                                                            "https://placehold.co/60x60"
                                                        }
                                                        alt="product"
                                                        className="w-12 h-12 rounded-lg object-cover border"
                                                    />

                                                    <div>
                                                        <div className="font-medium text-sm text-gray-900 line-clamp-1">
                                                            {order.productName || "-"}
                                                        </div>

                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {order.variantSize || "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* SKU */}

                                            <td className="px-4 py-4 text-sm font-medium">
                                                {order.variantSku || "-"}
                                            </td>

                                            {/* Qty */}

                                            <td className="px-4 py-4 text-sm">
                                                {order.qty || 0}
                                            </td>

                                            {/* Selling */}

                                            <td className="px-4 py-4 text-sm font-semibold">
                                                ₹{order.sellingPrice || 0}
                                            </td>

                                            {/* Settlement */}

                                            <td className="px-4 py-4 text-sm font-semibold">
                                                ₹{order.settlementAmount || 0}
                                            </td>

                                            {/* Profit */}

                                            <td
                                                className={`px-4 py-4 text-sm font-bold ${profit >= 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                    }`}
                                            >
                                                ₹{profit}
                                            </td>

                                            {/* Status */}

                                            <td className="px-4 py-4">
                                                <div
                                                    className={`rounded-xl px-2 py-1 ${getStatusStyle(
                                                        order.orderStatus
                                                    )}`}
                                                >
                                                    <select
                                                        value={order.orderStatus || "Pending"}
                                                        onChange={(e) =>
                                                            updateOrderStatus(
                                                                order.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Packed">Packed</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">
                                                            Delivered
                                                        </option>
                                                        <option value="RTO">RTO</option>
                                                        <option value="Cancelled">
                                                            Cancelled
                                                        </option>
                                                    </select>
                                                </div>

                                            </td>

                                            {/* Packeted */}

                                            <td className="px-4 py-4">
                                                <label className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={order.packed || false}
                                                        onChange={(e) =>
                                                            togglePacked(order.id, e.target.checked)
                                                        }
                                                        className="w-4 h-4 cursor-pointer"
                                                    />
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ====================================
// Summary Card
// ====================================

const SummaryCard = ({ title, value, icon }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="text-gray-500 text-sm font-medium">
                    {title}
                </div>

                <div className="text-gray-700">{icon}</div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
                {value}
            </h2>
        </div>
    );
};

// ====================================
// Marketplace Badge
// ====================================

const MarketplaceBadge = ({ marketplace }) => {
    const colors = {
        Meesho: "bg-pink-100 text-pink-700",
        Amazon: "bg-yellow-100 text-yellow-700",
        Flipkart: "bg-blue-100 text-blue-700",
        Shopify: "bg-green-100 text-green-700",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[marketplace] ||
                "bg-gray-100 text-gray-700"
                }`}
        >
            {marketplace || "Unknown"}
        </span>
    );
};

export default Orders;