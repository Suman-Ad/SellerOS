import React from "react";

import {
    Printer,
} from "lucide-react";

// ====================================
// COMPONENT
// ====================================

const OrderInvoice = ({
    order,
}) => {

    // ====================================
    // TOTALS
    // ====================================

    const qty =
        Number(
            order?.qty || 0
        );

    const sellingPrice =
        Number(
            order?.sellingPrice || 0
        );

    const total =
        Number(
            order?.totalSelling || 0
        );

    // ====================================
    // RENDER
    // ====================================

    return (

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

            {/* ====================================
            HEADER
            ==================================== */}

            <div className="p-5 border-b border-gray-200 flex items-center justify-between">

                <div>

                    <h2 className="text-xl font-bold text-gray-900">

                        Tax Invoice

                    </h2>

                    <p className="text-sm text-gray-500 mt-1">

                        Order Invoice Preview

                    </p>

                </div>

                <button
                    onClick={() =>
                        window.print()
                    }
                    className="px-4 py-2 rounded-xl bg-black text-white flex items-center gap-2 text-sm font-medium"
                >

                    <Printer size={16} />

                    Print

                </button>

            </div>

            {/* ====================================
            BODY
            ==================================== */}

            <div className="p-5 space-y-6">

                {/* ====================================
                TOP GRID
                ==================================== */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ====================================
                    SELLER
                    ==================================== */}

                    <div>

                        <h3 className="font-semibold text-gray-900 mb-3">

                            Seller Details

                        </h3>

                        <div className="space-y-1 text-sm text-gray-700">

                            <div>

                                SellerOS Demo Store

                            </div>

                            <div>

                                Siliguri, West Bengal

                            </div>

                            <div>

                                GSTIN:
                                {" "}
                                00ABCDE1234F1Z5

                            </div>

                        </div>

                    </div>

                    {/* ====================================
                    CUSTOMER
                    ==================================== */}

                    <div>

                        <h3 className="font-semibold text-gray-900 mb-3">

                            Customer Details

                        </h3>

                        <div className="space-y-1 text-sm text-gray-700">

                            <div>

                                {order?.customer?.name || "-"}

                            </div>

                            <div>

                                {order?.customer?.phone || "-"}

                            </div>

                        </div>

                    </div>

                </div>

                {/* ====================================
                ORDER INFO
                ==================================== */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <InfoCard
                        label="Order ID"
                        value={
                            order?.platformOrderId
                        }
                    />

                    <InfoCard
                        label="Platform"
                        value={
                            order?.platform
                        }
                    />

                    <InfoCard
                        label="AWB"
                        value={
                            order?.shipment?.awb
                        }
                    />

                    <InfoCard
                        label="Courier"
                        value={
                            order?.shipment?.courier
                        }
                    />

                </div>

                {/* ====================================
                PRODUCTS TABLE
                ==================================== */}

                <div className="border border-gray-200 rounded-2xl overflow-hidden">

                    <table className="w-full">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    Product

                                </th>

                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">

                                    SKU

                                </th>

                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">

                                    Qty

                                </th>

                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">

                                    Price

                                </th>

                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">

                                    Total

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr className="border-t border-gray-200">

                                {/* PRODUCT */}

                                <td className="px-4 py-4">

                                    <div className="flex items-center gap-3">

                                        <img
                                            src={
                                                order?.image ||

                                                "https://placehold.co/60x60"
                                            }
                                            alt="product"
                                            className="w-14 h-14 rounded-xl object-cover border"
                                        />

                                        <div>

                                            <div className="font-medium text-sm text-gray-900">

                                                {order?.productName || "-"}

                                            </div>

                                            <div className="text-xs text-gray-500 mt-1">

                                                Size:
                                                {" "}
                                                {order?.variantSize || "-"}

                                            </div>

                                        </div>

                                    </div>

                                </td>

                                {/* SKU */}

                                <td className="px-4 py-4 text-sm text-gray-700">

                                    {order?.variantSku || "-"}

                                </td>

                                {/* QTY */}

                                <td className="px-4 py-4 text-center text-sm text-gray-700">

                                    {qty}

                                </td>

                                {/* PRICE */}

                                <td className="px-4 py-4 text-right text-sm text-gray-700">

                                    ₹{sellingPrice}

                                </td>

                                {/* TOTAL */}

                                <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">

                                    ₹{total}

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

                {/* ====================================
                TOTALS
                ==================================== */}

                <div className="flex justify-end">

                    <div className="w-full md:w-[320px] border border-gray-200 rounded-2xl p-4 space-y-3">

                        <div className="flex items-center justify-between text-sm">

                            <span className="text-gray-500">

                                Subtotal

                            </span>

                            <span className="font-medium text-gray-900">

                                ₹{total}

                            </span>

                        </div>

                        <div className="flex items-center justify-between text-sm">

                            <span className="text-gray-500">

                                Shipping

                            </span>

                            <span className="font-medium text-gray-900">

                                ₹0

                            </span>

                        </div>

                        <div className="border-t border-gray-200 pt-3 flex items-center justify-between">

                            <span className="font-semibold text-gray-900">

                                Grand Total

                            </span>

                            <span className="text-lg font-bold text-gray-900">

                                ₹{total}

                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

// ====================================
// INFO CARD
// ====================================

const InfoCard = ({
    label,
    value,
}) => {

    return (

        <div className="border border-gray-200 rounded-xl p-4">

            <div className="text-xs text-gray-500 mb-1">

                {label}

            </div>

            <div className="text-sm font-medium text-gray-900 break-all">

                {value || "-"}

            </div>

        </div>
    );
};

export default OrderInvoice;