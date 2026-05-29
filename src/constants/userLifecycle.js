//***********************************//
//STEP 1A — Governance Status Constants//
// **********************************//

export const GOVERNANCE_STATUS = {
  PENDING_REVIEW: "pending_review",

  UNDER_REVIEW: "under_review",

  APPROVED: "approved",

  REJECTED: "rejected",

  SUSPENDED: "suspended",

  BLOCKED: "blocked",

  INACTIVE: "inactive",
};

//***********************************//
//STEP 1B — Onboarding Step Constants//
// **********************************//

export const ONBOARDING_STEPS = {
  PROFILE: "profile",

  ORGANIZATION: "organization",

  DOCUMENTS: "documents",

  COMPLIANCE: "compliance",

  REVIEW: "review",

  COMPLETED: "completed",
};

//*************************************//
//STEP 1C — Compliance Status Constants//
// ************************************//

export const COMPLIANCE_STATUS = {
  PENDING: "pending",

  UPLOADED: "uploaded",

  UNDER_REVIEW: "under_review",

  APPROVED: "approved",

  REJECTED: "rejected",

  EXPIRED: "expired",
};

//*********************************//
//STEP 1D — Re-KYC Status Constants//
// ********************************//

export const REKYC_STATUS = {
  NOT_REQUIRED: "not_required",

  REQUESTED: "requested",

  SUBMITTED: "submitted",

  UNDER_REVIEW: "under_review",

  APPROVED: "approved",

  FAILED: "failed",
};

//*****************************//
//STEP 1E — User Type Constants//
// ****************************//

export const USER_TYPES = {
  SELLER: "seller",

  STAFF: "staff",

  SUPPLIER: "supplier",

  PARTNER: "partner",
};

//****************************//
//STEP 1F — Organization Roles//
// ***************************//

export const ORGANIZATION_ROLES = {
  OWNER: "owner",

  ADMIN: "admin",

  MANAGER: "manager",

  STAFF: "staff",

  VIEWER: "viewer",
};

//************************//
//STEP 1G — Platform Roles//
// ***********************//

export const PLATFORM_ROLES = {
  USER: "user",

  SELLER: "seller",

  SUPPLIER: "supplier",

  PARTNER: "partner",

  ADMIN: "admin",

  SUPER_ADMIN: "super_admin",
};