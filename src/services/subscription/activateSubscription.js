import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export async function activateSubscription({
  userId,
  plan,
  billingCycle = "monthly",

  paymentInfo = {
    method: "System",
    verified: false,
  },
}) {

  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  if (!plan) {
    throw new Error(
      "Plan is required"
    );
  }

  // ============================
  // Expiry
  // ============================

  const expiryDate =
    new Date();

  if (
    billingCycle === "monthly"
  ) {

    expiryDate.setMonth(
      expiryDate.getMonth() + 1
    );

  } else {

    expiryDate.setFullYear(
      expiryDate.getFullYear() + 1
    );
  }

  // ============================
  // Pricing
  // ============================

  const basePrice =
    billingCycle === "monthly"
      ? Number(
          plan.priceMonthly || 0
        )
      : Number(
          plan.priceYearly || 0
        );

  const gst =
    Math.round(basePrice * 0.18);

  const total =
    basePrice + gst;

  const invoiceId =
    `INV-${Date.now()}`;

  // ============================
  // Subscription Object
  // ============================

  const subscription = {

    planId:
      plan.id,

    planName:
      plan.name,

    status:
      "active",

    isActive:
      true,

    billingCycle,

    subscribedAt:
      serverTimestamp(),

    expiresAt:
      Timestamp.fromDate(
        expiryDate
      ),

    features:
      plan.features || [],

    limits: {

      maxProducts:
        plan.maxProducts || 0,

      maxOrdersPerMonth:
        plan.maxOrdersPerMonth || 0,

      maxStaffAccounts:
        plan.maxStaffAccounts || 0,
    },
  };

  // ============================
  // Update User
  // ============================

  await updateDoc(
    doc(
      db,
      "users",
      userId
    ),
    {

      subscription,

      updatedAt:
        serverTimestamp(),
    }
  );

  // ============================
  // Payment History
  // ============================

  await addDoc(
    collection(
      db,
      "paymentHistory"
    ),
    {

      uid:
        userId,

      planId:
        plan.id,

      planName:
        plan.name,

      billingCycle,

      paymentMethod:
        paymentInfo.method ||
        "System",

      razorpayOrderId:
        paymentInfo
          .razorpayOrderId ||
        null,

      razorpayPaymentId:
        paymentInfo
          .razorpayPaymentId ||
        null,

      verified:
        paymentInfo
          .verified ||
        false,

      invoiceId,

      basePrice,

      gst,

      total,

      status:
        "paid",

      createdAt:
        serverTimestamp(),
    }
  );

  return {

    success: true,

    invoiceId,

    expiresAt:
      expiryDate,
  };
}