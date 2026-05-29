// src/routes/SubscriptionRoute.js

import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";

export default function SubscriptionRoute({
  children,

  requiredPlans = [],

  feature = null,
}) {

  const { userData } = useAuth();

  // =========================
  // Not Logged In
  // =========================

  if (!userData) {

    return <Navigate to="/login" />;
  }

  // =========================
  // Subscription Exists
  // =========================

  const subscription =
    userData.subscription || {};

  // =========================
  // Subscription Active
  // =========================

  if (!subscription.isActive) {

    toast.error(
      "Your subscription is inactive"
    );

    return (
      <Navigate to="/billing" />
    );
  }

  // =========================
  // Plan Validation
  // =========================

  if (
    requiredPlans.length > 0 &&
    !requiredPlans.includes(
      subscription.planName?.toLowerCase()
    )
  ) {

    toast.error(
      "Your current plan does not support this feature"
    );

    return (
      <Navigate to="/seller" />
    );
  }

  // =========================
  // Feature Access Validation
  // =========================

  if (feature) {

    const features =
      subscription.features || [];

    if (!features.includes(feature)) {

      toast.error(
        "Feature locked for your subscription"
      );

      return (
        <Navigate to="/upgrade-plan" />
      );
    }
  }

  return children;
}