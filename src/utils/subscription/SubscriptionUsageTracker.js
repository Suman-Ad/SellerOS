// src/utils/subscription/SubscriptionUsageTracker.js
import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

// ========================================
// Generic Usage Updater
// ========================================

export async function updateUsage(
  uid,
  field,
  amount = 1
) {

  try {

    const userRef =
      doc(db, "users", uid);

    await updateDoc(userRef, {
      [`usage.${field}`]:
        increment(amount),

      usageUpdatedAt:
        serverTimestamp(),
    });

    return true;

  } catch (error) {

    console.error(
      "USAGE UPDATE ERROR:",
      error
    );

    return false;
  }
}

// ========================================
// Products
// ========================================

export async function incrementProducts(
  uid,
  amount = 1
) {

  return await updateUsage(
    uid,
    "products",
    amount
  );
}

export async function decrementProducts(
  uid,
  amount = 1
) {

  return await updateUsage(
    uid,
    "products",
    -amount
  );
}

// ========================================
// Orders
// ========================================

export async function incrementOrders(
  uid,
  amount = 1
) {

  return await updateUsage(
    uid,
    "orders",
    amount
  );
}

export async function decrementOrders(
  uid,
  amount = 1
) {

  return await updateUsage(
    uid,
    "orders",
    -amount
  );
}

// ========================================
// Staff Accounts
// ========================================

export async function incrementStaff(
  uid,
  amount = 1
) {

  return await updateUsage(
    uid,
    "staff",
    amount
  );
}

export async function decrementStaff(
  uid,
  amount = 1
) {

  return await updateUsage(
    uid,
    "staff",
    -amount
  );
}

// ========================================
// Storage Usage
// ========================================

export async function incrementStorage(
  uid,
  mb = 1
) {

  return await updateUsage(
    uid,
    "storageMB",
    mb
  );
}

export async function decrementStorage(
  uid,
  mb = 1
) {

  return await updateUsage(
    uid,
    "storageMB",
    -mb
  );
}

// ========================================
// API Usage
// ========================================

export async function incrementApiUsage(
  uid,
  amount = 1
) {

  return await updateUsage(
    uid,
    "apiRequests",
    amount
  );
}

// ========================================
// Reset Monthly Usage
// ========================================

export async function resetMonthlyUsage(
  uid
) {

  try {

    const userRef =
      doc(db, "users", uid);

    await updateDoc(userRef, {

      "usage.orders": 0,

      "usage.apiRequests": 0,

      usageResetAt:
        serverTimestamp(),
    });

    return true;

  } catch (error) {

    console.error(
      "RESET USAGE ERROR:",
      error
    );

    return false;
  }
}