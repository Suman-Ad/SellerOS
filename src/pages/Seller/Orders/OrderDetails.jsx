import React, {
    useEffect,
    useState,
} from "react";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    Package,
    Truck,
    User,
    IndianRupee,
} from "lucide-react";

import { db } from "@/firebase/config";

import OrderInvoice from "./OrderInvoice";

// ====================================
// PAGE
// ====================================

const OrderDetails = () => {

    const { orderId } =
        useParams();

    const navigate =
        useNavigate();

    const [order,
        setOrder] =
        useState(null);

    const [loading,
        setLoading] =
        useState(true);

    const [timeline,
        setTimeline] =
        useState([]);

    const [saving,
        setSaving] =
        useState(false);

    const [shipmentForm,
        setShipmentForm] =
        useState({

            awb: "",

            courier: "",

            trackingUrl: "",

            shipmentDate: "",
        });

    // ====================================
    // FETCH ORDER
    // ====================================

    useEffect(() => {

        const fetchOrder =
            async () => {

                try {

                    const ref =
                        doc(
                            db,
                            "orders",
                            orderId
                        );

                    const snap =
                        await getDoc(
                            ref
                        );

                    if (
                        snap.exists()
                    ) {

                        // ====================================
                        // INVENTORY TRANSACTIONS
                        // ====================================

                        const inventoryQuery =
                            query(

                                collection(
                                    db,
                                    "inventoryTransactions"
                                ),

                                where(
                                    "orderId",
                                    "==",
                                    snap.data()
                                        ?.platformOrderId
                                )
                            );

                        const inventorySnap =
                            await getDocs(
                                inventoryQuery
                            );

                        setTimeline(

                            inventorySnap.docs.map(
                                (doc) => ({

                                    id:
                                        doc.id,

                                    ...doc.data(),
                                })
                            )
                        );

                        setOrder({

                            id:
                                snap.id,

                            ...snap.data(),
                        });

                        setShipmentForm({

                            awb:
                                snap.data()
                                    ?.shipment?.awb || "",

                            courier:
                                snap.data()
                                    ?.shipment?.courier || "",

                            trackingUrl:
                                snap.data()
                                    ?.shipment?.trackingUrl || "",

                            shipmentDate:
                                snap.data()
                                    ?.shipment?.shipmentDate || "",
                        });
                    }



                    setLoading(false);

                } catch (err) {

                    console.error(err);

                    setLoading(false);
                }
            };

        fetchOrder();

    }, [orderId]);

    // ====================================
    // UPDATE STATUS
    // ====================================

    const updateStatus =
        async (
            status
        ) => {

            try {

                setSaving(true);

                const orderRef =
                    doc(
                        db,
                        "orders",
                        orderId
                    );

                await updateDoc(
                    orderRef,

                    {

                        orderStatus:
                            status,

                        updatedAt:
                            serverTimestamp(),
                    }
                );

                setOrder(
                    prev => ({

                        ...prev,

                        orderStatus:
                            status,
                    })
                );

                setSaving(false);

            } catch (err) {

                console.error(err);

                setSaving(false);
            }
        };

    // ====================================
    // SAVE SHIPMENT
    // ====================================

    const saveShipment =
        async () => {

            try {

                setSaving(true);

                const orderRef =
                    doc(
                        db,
                        "orders",
                        orderId
                    );

                await updateDoc(
                    orderRef,

                    {

                        shipment:
                            shipmentForm,

                        updatedAt:
                            serverTimestamp(),
                    }
                );

                setOrder(
                    prev => ({

                        ...prev,

                        shipment:
                            shipmentForm,
                    })
                );

                setSaving(false);

            } catch (err) {

                console.error(err);

                setSaving(false);
            }
        };

    // ====================================
    // LOADING
    // ====================================

    if (loading) {

        return (

            <div className="p-6">

                Loading order...

            </div>
        );
    }

    // ====================================
    // EMPTY
    // ====================================

    if (!order) {

        return (

            <div className="p-6">

                Order not found

            </div>
        );
    }

    // ====================================
    // RENDER
    // ====================================

    return (

        <div className="p-4 md:p-6">

            {/* ====================================
            HEADER
            ==================================== */}

            <div className="flex items-center justify-between mb-6">

                <div className="flex items-center gap-4">

                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="w-10 h-10 rounded-xl border border-gray-300 bg-zinc-800 flex items-center justify-center"
                    >

                        <ArrowLeft size={18} />

                    </button>

                    <div>

                        <h1 className="text-2xl font-bold text-gray-900">

                            {order.platformOrderId}

                        </h1>

                        <p className="text-sm text-gray-500 mt-1">

                            {order.platform} Order

                        </p>

                    </div>

                </div>

                <div className="flex flex-wrap gap-2">

                    {[
                        "Pending",
                        "Packed",
                        "Shipped",
                        "Delivered",
                        "Cancelled",
                        "RTO",
                    ].map((status) => (

                        <button
                            key={status}

                            disabled={saving}

                            onClick={() =>
                                updateStatus(
                                    status
                                )
                            }

                            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${order.orderStatus === status

                                ? "bg-black text-white"

                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >

                            {status}

                        </button>
                    ))}
                </div>

            </div>

            {/* ====================================
            GRID
            ==================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ====================================
                LEFT
                ==================================== */}

                <div className="xl:col-span-2 space-y-6">

                    {/* ====================================
                    PRODUCT
                    ==================================== */}

                    <SectionCard
                        title="Product"
                        icon={
                            <Package size={18} />
                        }
                    >

                        <div className="flex gap-4">

                            <img
                                src={
                                    order.image ||
                                    "https://placehold.co/100x100"
                                }
                                alt="product"
                                className="w-24 h-24 rounded-2xl object-cover border"
                            />

                            <div className="space-y-2">

                                <h2 className="text-lg font-semibold text-gray-900">

                                    {order.productName || "-"}

                                </h2>

                                <InfoRow
                                    label="Parent SKU"
                                    value={
                                        order.parentSKU
                                    }
                                />

                                <InfoRow
                                    label="Variant SKU"
                                    value={
                                        order.variantSku
                                    }
                                />

                                <InfoRow
                                    label="Variant Size"
                                    value={
                                        order.variantSize
                                    }
                                />

                                <InfoRow
                                    label="Quantity"
                                    value={
                                        order.qty
                                    }
                                />

                            </div>

                        </div>

                    </SectionCard>

                    {/* ====================================
                    CUSTOMER
                    ==================================== */}

                    <SectionCard
                        title="Customer"
                        icon={
                            <User size={18} />
                        }
                    >

                        <div className="space-y-3">

                            <InfoRow
                                label="Customer Name"
                                value={
                                    order.customer?.name
                                }
                            />

                            <InfoRow
                                label="Phone"
                                value={
                                    order.customer?.phone
                                }
                            />

                        </div>

                    </SectionCard>

                    {/* ====================================
                    SHIPMENT
                    ==================================== */}

                    <SectionCard
                        title="Shipment"
                        icon={
                            <Truck size={18} />
                        }
                    >

                        <div className="space-y-4">

                            {/* AWB */}

                            <div>

                                <label className="text-sm text-gray-500 mb-1 block">

                                    AWB Number

                                </label>

                                <input
                                    type="text"

                                    value={
                                        shipmentForm.awb
                                    }

                                    onChange={(e) =>
                                        setShipmentForm(
                                            prev => ({

                                                ...prev,

                                                awb:
                                                    e.target.value,
                                            })
                                        )
                                    }

                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                                />

                            </div>

                            {/* COURIER */}

                            <div>

                                <label className="text-sm text-gray-500 mb-1 block">

                                    Courier

                                </label>

                                <input
                                    type="text"

                                    value={
                                        shipmentForm.courier
                                    }

                                    onChange={(e) =>
                                        setShipmentForm(
                                            prev => ({

                                                ...prev,

                                                courier:
                                                    e.target.value,
                                            })
                                        )
                                    }

                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                                />

                            </div>

                            {/* TRACKING URL */}

                            <div>

                                <label className="text-sm text-gray-500 mb-1 block">

                                    Tracking URL

                                </label>

                                <input
                                    type="text"

                                    value={
                                        shipmentForm.trackingUrl
                                    }

                                    onChange={(e) =>
                                        setShipmentForm(
                                            prev => ({

                                                ...prev,

                                                trackingUrl:
                                                    e.target.value,
                                            })
                                        )
                                    }

                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                                />

                            </div>

                            {/* SHIPMENT DATE */}

                            <div>

                                <label className="text-sm text-gray-500 mb-1 block">

                                    Shipment Date

                                </label>

                                <input
                                    type="date"

                                    value={
                                        shipmentForm.shipmentDate
                                    }

                                    onChange={(e) =>
                                        setShipmentForm(
                                            prev => ({

                                                ...prev,

                                                shipmentDate:
                                                    e.target.value,
                                            })
                                        )
                                    }

                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                                />

                            </div>

                            {/* SAVE */}

                            <button
                                onClick={
                                    saveShipment
                                }

                                disabled={saving}

                                className="w-full px-4 py-3 rounded-xl bg-black text-white font-medium disabled:opacity-50"
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Shipment"}
                            </button>

                        </div>

                    </SectionCard>

                </div>

                {/* ====================================
                TIMELINE
==================================== */}

                <SectionCard
                    title="Inventory Timeline"
                    icon={
                        <Package size={18} />
                    }
                >

                    <div className="space-y-4">

                        {timeline.length === 0 ? (

                            <div className="text-sm text-gray-500">

                                No inventory logs found

                            </div>

                        ) : (

                            timeline.map(
                                (item) => (

                                    <div
                                        key={item.id}
                                        className="border border-gray-200 rounded-xl p-4"
                                    >

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <div className="font-medium text-gray-900">

                                                    {item.type || "-"}

                                                </div>

                                                <div className="text-xs text-gray-500 mt-1">

                                                    Before:
                                                    {" "}
                                                    {item.beforeQty || 0}

                                                    {" → "}

                                                    After:
                                                    {" "}
                                                    {item.afterQty || 0}

                                                </div>

                                            </div>

                                            <div className="text-sm font-semibold text-gray-900">

                                                Qty:
                                                {" "}
                                                {item.qty || 0}

                                            </div>

                                        </div>

                                    </div>
                                )
                            )
                        )}

                    </div>

                </SectionCard>

                {/* ====================================
                RIGHT
                ==================================== */}

                <div className="space-y-6">

                    {/* ====================================
                    PRICING
                    ==================================== */}

                    <SectionCard
                        title="Pricing"
                        icon={
                            <IndianRupee size={18} />
                        }
                    >

                        <div className="space-y-3">

                            <InfoRow
                                label="Selling"
                                value={`₹${order.totalSelling || 0}`}
                            />

                            <InfoRow
                                label="Buying"
                                value={`₹${order.totalBuying || 0}`}
                            />

                            <InfoRow
                                label="Profit"
                                value={`₹${order.profit || 0}`}
                            />

                        </div>

                    </SectionCard>

                    {/* ====================================
                    INVOICE
                    ==================================== */}

                    <OrderInvoice
                        order={order}
                    />

                </div>

            </div>

        </div>
    );
};

// ====================================
// SECTION CARD
// ====================================

const SectionCard = ({
    title,
    icon,
    children,
}) => {

    return (

        <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-5">

                {icon}

                <h2 className="font-semibold text-gray-900">

                    {title}

                </h2>

            </div>

            {children}

        </div>
    );
};

// ====================================
// INFO ROW
// ====================================

const InfoRow = ({
    label,
    value,
}) => {

    return (

        <div className="flex items-center justify-between gap-4">

            <div className="text-sm text-gray-500">

                {label}

            </div>

            <div className="text-sm font-medium text-gray-900 text-right">

                {value || "-"}

            </div>

        </div>
    );
};

export default OrderDetails;