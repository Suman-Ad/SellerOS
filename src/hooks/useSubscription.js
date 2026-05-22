import { useMemo } from "react";

import { useAuth } from "@/context/AuthContext";

export default function useSubscription() {

    const { userData } = useAuth();

    const subscription =
        userData?.subscription || {};

    // =========================
    // Plan Info
    // =========================

    const planName =
        subscription.planName || "free";

    const features =
        subscription.features || [];

    // const limits =
    //     subscription.limits || {};

    // =========================
    // Product Limits
    // =========================

    const maxProducts =
        subscription.maxProducts || 0;

    const usedProducts =
        userData?.usage?.products || 0;

    const remainingProducts =
        Math.max(
            maxProducts - usedProducts,
            0
        );

    const canCreateProduct =
        remainingProducts > 0;

    // =========================
    // Order Limits
    // =========================

    const maxOrders =
        subscription.maxOrdersPerMonth || 0;

    const usedOrders =
        userData?.usage?.orders || 0;

    const remainingOrders =
        Math.max(
            maxOrders - usedOrders,
            0
        );

    const canCreateOrder =
        remainingOrders > 0;

    // =========================
    // Staff Limits
    // =========================

    const maxStaff =
        subscription.maxStaffAccounts || 0;

    const usedStaff =
        userData?.usage?.staff || 0;

    const remainingStaff =
        Math.max(
            maxStaff - usedStaff,
            0
        );

    const canAddStaff =
        remainingStaff > 0;

    // =========================
    // Feature Check
    // =========================

    const hasFeature = (feature) => {

        return features.includes(feature);
    };

    // =========================
    // Plan Checks
    // =========================

    const isEnterprise =
        planName.toLowerCase() ===
        "enterprise";

    const isGrowth =
        planName.toLowerCase() ===
        "growth";

    const isStarter =
        planName.toLowerCase() ===
        "starter";

    const isFree =
        planName.toLowerCase() ===
        "free";

    // =========================
    // Subscription Status
    // =========================

    const isActive =
        subscription.isActive || false;

    const status =
        subscription.status || "inactive";

    // =========================
    // Expiry Check
    // =========================

    const expiresAt =
        subscription.expiresAt?.toDate?.();

    const isExpired = expiresAt
        ? new Date() > expiresAt
        : false;

    // =========================
    // Remaining Days
    // =========================

    const remainingDays = expiresAt
        ? Math.max(
            Math.ceil(
                (
                    expiresAt -
                    new Date()
                ) /
                (1000 * 60 * 60 * 24)
            ),
            0
        )
        : 0;

    // =========================
    // Usage Percentages
    // =========================

    const productUsagePercent =
        maxProducts > 0
            ? Math.min(
                (
                    usedProducts /
                    maxProducts
                ) * 100,
                100
            )
            : 0;

    const orderUsagePercent =
        maxOrders > 0
            ? Math.min(
                (
                    usedOrders /
                    maxOrders
                ) * 100,
                100
            )
            : 0;

    const staffUsagePercent =
        maxStaff > 0
            ? Math.min(
                (
                    usedStaff /
                    maxStaff
                ) * 100,
                100
            )
            : 0;

    // =========================
    // Return
    // =========================

    return {

        // Plan
        planName,
        isEnterprise,
        isGrowth,
        isStarter,
        isFree,

        // Status
        isActive,
        status,
        isExpired,
        remainingDays,

        // Features
        features,
        hasFeature,

        // Product
        maxProducts,
        usedProducts,
        remainingProducts,
        canCreateProduct,
        productUsagePercent,

        // Orders
        maxOrders,
        usedOrders,
        remainingOrders,
        canCreateOrder,
        orderUsagePercent,

        // Staff
        maxStaff,
        usedStaff,
        remainingStaff,
        canAddStaff,
        staffUsagePercent,
    };
}