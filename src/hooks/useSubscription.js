import { useMemo } from "react";

import { useAuth } from "@/context/AuthContext";

import {

    canCreateProduct as validateProduct,

    canCreateOrder as validateOrder,

    canCreateStaff as validateStaff,

    isSubscriptionActive,

    isSubscriptionExpired,

} from "@/services/subscription/subscriptionService";

export default function useSubscription() {

    const { userData } = useAuth();

    const subscription =
        userData?.subscription || {};

    const usage =
        userData?.usage || {};

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
        subscription?.limits?.maxProducts || 0;
    

    const usedProducts =
        usage?.products || 0;

    const remainingProducts =
        Math.max(
            maxProducts - usedProducts,
            0
        );

    const productValidation =
        validateProduct({
            subscription,
            usage,
        });

    const canCreateProduct =
        productValidation.allowed;

    // =========================
    // Order Limits
    // =========================

    const maxOrders =
        subscription?.limits?.maxOrdersPerMonth || 0;

    const usedOrders =
        usage?.orders || 0;

    const remainingOrders =
        Math.max(
            maxOrders - usedOrders,
            0
        );

    const orderValidation =
        validateOrder({
            subscription,
            usage,
        });

    const canCreateOrder =
        orderValidation.allowed;

    // =========================
    // Staff Limits
    // =========================

    const maxStaff =
        subscription?.limits?.maxStaffAccounts || 0;

    const usedStaff =
        usage?.staff || 0;

    const remainingStaff =
        Math.max(
            maxStaff - usedStaff,
            0
        );

    const staffValidation =
        validateStaff({
            subscription,
            usage,
        });

    const canAddStaff =
        staffValidation.allowed;

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
    const expiresAt =
        subscription?.expiresAt?.toDate
            ? subscription.expiresAt.toDate()
            : subscription?.expiresAt
                ? new Date(subscription.expiresAt)
                : null;

    const isActive =
        isSubscriptionActive(
            subscription
        );

    const status =
        subscription.status || "inactive";

    // =========================
    // Expiry Check
    // =========================

    const isExpired =
        isSubscriptionExpired(
            subscription
        );

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
        productValidation,
        productUsagePercent,

        // Orders
        maxOrders,
        usedOrders,
        remainingOrders,
        canCreateOrder,
        orderValidation,
        orderUsagePercent,

        // Staff
        maxStaff,
        usedStaff,
        remainingStaff,
        canAddStaff,
        staffValidation,
        staffUsagePercent,


        subscription,
        usage,
    };
}