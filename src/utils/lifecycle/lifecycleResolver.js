import {
  GOVERNANCE_STATUS,
  ONBOARDING_STEPS,
  REKYC_STATUS,
} from "@/constants/userLifecycle";

export const isEmailVerified = (userData) => {
  return userData?.authStatus?.emailVerified === true;
};

export const isSellerApproved = (userData) => {
  return (
    userData?.governance?.sellerStatus ===
    GOVERNANCE_STATUS.APPROVED
  );
};

export const isSellerSuspended = (userData) => {
  return (
    userData?.governance?.sellerStatus ===
    GOVERNANCE_STATUS.SUSPENDED
  );
};

export const isSellerRejected = (userData) => {
  return (
    userData?.governance?.sellerStatus ===
    GOVERNANCE_STATUS.REJECTED
  );
};

export const requiresReKyc = (userData) => {
  return (
    userData?.reKyc?.status ===
      REKYC_STATUS.REQUESTED ||

    userData?.reKyc?.required === true
  );
};

export const resolveOnboardingStep = (
  userData
) => {
  const onboarding =
    userData?.onboarding || {};

  if (!onboarding.profileCompleted) {
    return ONBOARDING_STEPS.PROFILE;
  }

  if (
    !onboarding.organizationSetupCompleted
  ) {
    return ONBOARDING_STEPS.ORGANIZATION;
  }

  if (!onboarding.documentsUploaded) {
    return ONBOARDING_STEPS.DOCUMENTS;
  }

  if (
    !onboarding.complianceSubmitted
  ) {
    return ONBOARDING_STEPS.COMPLIANCE;
  }

  return ONBOARDING_STEPS.REVIEW;
};

export const isOnboardingCompleted = (
  userData
) => {
  return (
    userData?.onboarding
      ?.onboardingCompleted === true
  );
};

export const canAccessDashboard = (
  userData
) => {
  if (!isEmailVerified(userData)) {
    return false;
  }

  if (
    !isOnboardingCompleted(userData)
  ) {
    return false;
  }

  if (!isSellerApproved(userData)) {
    return false;
  }

  if (isSellerSuspended(userData)) {
    return false;
  }

  return true;
};

export const resolveRedirectPath = (
  userData
) => {
  /* =========================================
     EMAIL VERIFICATION
  ========================================= */

  if (!isEmailVerified(userData)) {
    return "/verify-email";
  }

  /* =========================================
     REJECTED
  ========================================= */

  if (isSellerRejected(userData)) {
    return "/application-rejected";
  }

  /* =========================================
     SUSPENDED
  ========================================= */

  if (isSellerSuspended(userData)) {
    return "/account-suspended";
  }

  /* =========================================
     ONBOARDING
  ========================================= */

  if (
    !isOnboardingCompleted(userData)
  ) {
    const step =
      resolveOnboardingStep(userData);

    switch (step) {
      case ONBOARDING_STEPS.PROFILE:
        return "/complete-profile";

      case ONBOARDING_STEPS.ORGANIZATION:
        return "/organization-setup";

      case ONBOARDING_STEPS.DOCUMENTS:
        return "/compliance-upload";

      case ONBOARDING_STEPS.COMPLIANCE:
        return "/compliance-review";

      default:
        return "/pending-approval";
    }
  }

  /* =========================================
     GOVERNANCE REVIEW
  ========================================= */

  if (!isSellerApproved(userData)) {
    return "/pending-approval";
  }

  /* =========================================
     RE-KYC
  ========================================= */

  if (requiresReKyc(userData)) {
    return "/compliance-upload";
  }

  /* =========================================
     SUCCESS
  ========================================= */

  return "/";
};

