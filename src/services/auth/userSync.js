import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  GOVERNANCE_STATUS,
  ONBOARDING_STEPS,
  COMPLIANCE_STATUS,
  REKYC_STATUS,
  USER_TYPES,
  ORGANIZATION_ROLES,
  PLATFORM_ROLES,
} from "@/constants/userLifecycle";

/* =========================================================
   DEFAULT USER PROFILE
========================================================= */

const buildDefaultUserProfile = ({
  firebaseUser,
  provider,
  additionalData = {},
}) => {
  return {
    uid: firebaseUser.uid,

    /* =========================================
       BASIC INFO
    ========================================= */

    email: firebaseUser.email || "",

    fullName:
      additionalData.fullName ||
      firebaseUser.displayName ||
      "",

    username:
      additionalData.username ||
      firebaseUser.email?.split("@")[0] ||
      "",

    phoneNumber:
      additionalData.phoneNumber ||
      firebaseUser.phoneNumber ||
      "",

    avatar:
      firebaseUser.photoURL || "",

    banner: "",

    /* =========================================
       USER TYPE
    ========================================= */

    userType:
      additionalData.userType ||
      USER_TYPES.SELLER,

    /* =========================================
       AUTH STATUS
    ========================================= */

    authStatus: {
      emailVerified:
        firebaseUser.emailVerified || false,

      phoneVerified: false,

      mfaEnabled: false,

      accountLocked: false,
    },

    /* =========================================
       ORGANIZATION
    ========================================= */

    organization: {
      organizationId: null,

      organizationRole:
        ORGANIZATION_ROLES.OWNER,

      department: null,
    },

    /* =========================================
       ACCESS CONTROL
    ========================================= */

    access: {
      role: PLATFORM_ROLES.USER,

      permissions: [],
    },

    /* =========================================
       GOVERNANCE
    ========================================= */

    governance: {
      sellerStatus:
        GOVERNANCE_STATUS.PENDING_REVIEW,

      approvedAt: null,
      approvedBy: null,

      rejectedAt: null,
      rejectedBy: null,

      suspendedAt: null,
      suspendedBy: null,

      flagged: false,
    },

    /* =========================================
       COMPLIANCE
    ========================================= */

    compliance: {
      gst: {
        status:
          COMPLIANCE_STATUS.PENDING,

        verifiedAt: null,
      },

      pan: {
        status:
          COMPLIANCE_STATUS.PENDING,

        verifiedAt: null,
      },

      kyc: {
        status:
          COMPLIANCE_STATUS.PENDING,

        verifiedAt: null,
      },

      bank: {
        status:
          COMPLIANCE_STATUS.PENDING,

        verifiedAt: null,
      },

      address: {
        status:
          COMPLIANCE_STATUS.PENDING,

        verifiedAt: null,
      },
    },

    /* =========================================
       RE-KYC
    ========================================= */

    reKyc: {
      status:
        REKYC_STATUS.NOT_REQUIRED,

      required: false,

      reason: "",

      requestedAt: null,

      requestedBy: null,

      completed: false,

      completedAt: null,
    },

    /* =========================================
       ONBOARDING
    ========================================= */

    onboarding: {
      currentStep:
        ONBOARDING_STEPS.PROFILE,

      profileCompleted: false,

      organizationSetupCompleted: false,

      documentsUploaded: false,

      complianceSubmitted: false,

      onboardingCompleted: false,
    },

    /* =========================================
       SUBSCRIPTION
    ========================================= */

    subscription: {
      plan: "free",

      status: "inactive",

      expiresAt: null,
    },

    /* =========================================
       SECURITY
    ========================================= */

    security: {
      lastLoginAt: serverTimestamp(),

      lastPasswordChange: null,

      failedAttempts: 0,

      lastDevice: "web",
    },

    /* =========================================
       ANALYTICS
    ========================================= */

    analytics: {
      totalLogins: 1,

      lastActiveAt: serverTimestamp(),
    },

    /* =========================================
       SYSTEM
    ========================================= */

    metadata: {
      createdByProvider: provider,

      registrationSource: "web",
    },

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };
};

/* =========================================================
   CREATE ENTERPRISE USER PROFILE
========================================================= */

export const createUserProfile = async ({
  firebaseUser,
  provider,
  additionalData = {},
}) => {
  try {
    const userRef = doc(db, "users", firebaseUser.uid);

    const userProfile = buildDefaultUserProfile({
      firebaseUser,
      provider,
      additionalData,
    });

    await setDoc(userRef, userProfile);

    return {
      success: true,
      data: userProfile,
    };
  } catch (error) {
    console.error("Create user profile error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   UPDATE EXISTING USER PROFILE
========================================================= */

export const updateUserProfile = async ({
  uid,
  data = {},
}) => {
  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update user profile error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   GET USER PROFILE
========================================================= */

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: "User profile not found.",
      };
    }

    return {
      success: true,
      data: snapshot.data(),
    };
  } catch (error) {
    console.error("Get user profile error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   USER PROFILE SYNC ENGINE
========================================================= */

export const syncUserProfile = async ({
  firebaseUser,
  provider,
  additionalData = {},
}) => {
  try {
    const userRef = doc(db, "users", firebaseUser.uid);

    const existingUser = await getDoc(userRef);

    /* =====================================================
       NEW USER
    ===================================================== */

    if (!existingUser.exists()) {
      return await createUserProfile({
        firebaseUser,
        provider,
        additionalData,
      });
    }

    /* =====================================================
       EXISTING USER UPDATE
    ===================================================== */

    const existingData = existingUser.data();

    const updatePayload = {
      authStatus: {
        ...existingData.authStatus,

        emailVerified:
          firebaseUser.emailVerified,
      },

      fullName:
        existingData.fullName ||
        firebaseUser.displayName ||
        "",

      avatar:
        firebaseUser.photoURL ||
        existingData.avatar ||
        "",

      analytics: {
        ...existingData.analytics,
        totalLogins:
          (existingData.analytics?.totalLogins || 0) + 1,

        lastActiveAt: serverTimestamp(),
      },

      security: {
        ...existingData.security,
        lastLoginAt: serverTimestamp(),
      },

      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updatePayload);

    return {
      success: true,
      data: {
        ...existingData,
        ...updatePayload,
      },
    };
  } catch (error) {
    console.error("Sync user profile error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   UPDATE ONBOARDING STATUS
========================================================= */

export const updateOnboardingStep = async ({
  uid,
  onboardingData,
}) => {
  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      onboarding: onboardingData,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update onboarding error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   UPDATE USER STATUS
========================================================= */

// export const updateUserStatus = async ({
//   uid,
//   status,
// }) => {
//   try {
//     const userRef = doc(db, "users", uid);

//     await updateDoc(userRef, {
//       status,
//       updatedAt: serverTimestamp(),
//     });

//     return {
//       success: true,
//     };
//   } catch (error) {
//     console.error("Update status error:", error);

//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };

export const updateGovernanceStatus = async ({
  uid,
  sellerStatus,
}) => {
  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      governance: {
        sellerStatus,
      },

      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Update governance status error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};
/* =========================================================
   ASSIGN ROLE
========================================================= */

export const assignUserRole = async ({
  uid,
  role,
  permissions = [],
}) => {
  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      access: {
        role,
        permissions,
      },
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Assign role error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   ATTACH ORGANIZATION
========================================================= */

export const attachOrganizationToUser = async ({
  uid,
  organizationId,
  organizationRole = "member",
}) => {
  try {
    const userRef = doc(db, "users", uid);

    const existingSnapshot =
      await getDoc(userRef);

    const existingData =
      existingSnapshot.data();

    await updateDoc(userRef, {
      organization: {
        ...existingData.organization,

        organizationId,

        organizationRole,
      },
      onboarding: {
        ...existingData.onboarding,

        organizationSetupCompleted:
          true,

        currentStep:
          ONBOARDING_STEPS.DOCUMENTS,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Attach organization error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};