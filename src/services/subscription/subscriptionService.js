import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* =========================================================
   GET ORGANIZATION SUBSCRIPTION
========================================================= */

export async function getSubscription(
  organizationId
) {
  try {

    if (!organizationId) {
      throw new Error(
        "Organization ID required"
      );
    }

    const orgRef = doc(
      db,
      "organizations",
      organizationId
    );

    const snapshot =
      await getDoc(orgRef);

    if (!snapshot.exists()) {
      throw new Error(
        "Organization not found"
      );
    }

    const orgData =
      snapshot.data();

    return {
      success: true,
      subscription:
        orgData.subscription || {},
      usage:
        orgData.usage || {},
      organization:
        orgData,
    };

  } catch (error) {

    console.error(
      "GET SUBSCRIPTION ERROR:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
}

/* =========================================================
   EXPIRY CHECK
========================================================= */

export function isSubscriptionExpired(
  subscription
) {

  if (!subscription?.expiresAt) {
    return true;
  }

  try {

    const expiryDate =
      subscription.expiresAt.toDate
        ? subscription.expiresAt.toDate()
        : new Date(
            subscription.expiresAt
          );

    return (
      expiryDate.getTime() <
      Date.now()
    );

  } catch {

    return true;
  }
}

/* =========================================================
   ACTIVE CHECK
========================================================= */

export function isSubscriptionActive(
  subscription
) {

  if (
    !subscription ||
    !subscription.isActive
  ) {
    return false;
  }

  return !isSubscriptionExpired(
    subscription
  );
}

/* =========================================================
   FEATURE ACCESS
========================================================= */

export function canAccessFeature(
  subscription,
  feature
) {

  if (
    !isSubscriptionActive(
      subscription
    )
  ) {

    return {
      allowed: false,
      reason:
        "Subscription inactive",
    };
  }

  const features =
    subscription.features || [];

  if (
    !features.includes(feature)
  ) {

    return {
      allowed: false,
      reason:
        "Feature not available in current plan",
    };
  }

  return {
    allowed: true,
  };
}

/* =========================================================
   PRODUCTS
========================================================= */

export function canCreateProduct({
  subscription,
  usage,
}) {

  if (
    !isSubscriptionActive(
      subscription
    )
  ) {

    return {
      allowed: false,
      reason:
        "Subscription expired",
    };
  }

  const limit =
    subscription?.limits
      ?.maxProducts ?? 0;

  const used =
    usage?.products ?? 0;

  if (
    limit > 0 &&
    used >= limit
  ) {

    return {
      allowed: false,
      reason:
        `Product limit reached (${limit})`,
    };
  }

  return {
    allowed: true,
    remaining:
      limit === 0
        ? Infinity
        : limit - used,
  };
}

/* =========================================================
   ORDERS
========================================================= */

export function canCreateOrder({
  subscription,
  usage,
}) {

  if (
    !isSubscriptionActive(
      subscription
    )
  ) {

    return {
      allowed: false,
      reason:
        "Subscription expired",
    };
  }

  const limit =
    subscription?.limits
      ?.maxOrdersPerMonth ?? 0;

  const used =
    usage?.orders ?? 0;

  if (
    limit > 0 &&
    used >= limit
  ) {

    return {
      allowed: false,
      reason:
        `Monthly order limit reached (${limit})`,
    };
  }

  return {
    allowed: true,
    remaining:
      limit === 0
        ? Infinity
        : limit - used,
  };
}

/* =========================================================
   STAFF
========================================================= */

export function canCreateStaff({
  subscription,
  usage,
}) {

  if (
    !isSubscriptionActive(
      subscription
    )
  ) {

    return {
      allowed: false,
      reason:
        "Subscription expired",
    };
  }

  const limit =
    subscription?.limits
      ?.maxStaffAccounts ?? 0;

  const used =
    usage?.staff ?? 0;

  if (
    limit > 0 &&
    used >= limit
  ) {

    return {
      allowed: false,
      reason:
        `Staff account limit reached (${limit})`,
    };
  }

  return {
    allowed: true,
    remaining:
      limit === 0
        ? Infinity
        : limit - used,
  };
}

/* =========================================================
   STORAGE
========================================================= */

export function canUseStorage({
  subscription,
  usage,
  additionalMB = 0,
}) {

  const limit =
    subscription?.limits
      ?.storageMB ?? 0;

  const used =
    usage?.storageMB ?? 0;

  if (
    limit > 0 &&
    used + additionalMB > limit
  ) {

    return {
      allowed: false,
      reason:
        "Storage limit exceeded",
    };
  }

  return {
    allowed: true,
  };
}

/* =========================================================
   SUBSCRIPTION SUMMARY
========================================================= */

export function getSubscriptionSummary({
  subscription,
  usage,
}) {

  return {

    active:
      isSubscriptionActive(
        subscription
      ),

    expired:
      isSubscriptionExpired(
        subscription
      ),

    planName:
      subscription?.planName ||
      "Free",

    status:
      subscription?.status ||
      "inactive",

    limits:
      subscription?.limits || {},

    usage:
      usage || {},
  };
}