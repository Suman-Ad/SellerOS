import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

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

    /* =====================================================
       BASIC INFO
    ===================================================== */

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

    avatar: firebaseUser.photoURL || "",

    banner: "",

    /* =====================================================
       AUTH INFO
    ===================================================== */

    authProvider: provider,

    emailVerified: firebaseUser.emailVerified,

    /* =====================================================
       USER TYPE
    ===================================================== */

    userType:
      additionalData.userType || "seller",

    /* =====================================================
       ORGANIZATION
    ===================================================== */

    organizationId: null,

    organizationRole: "owner",

    /* =====================================================
       ROLE SYSTEM
    ===================================================== */

    role: "user",

    permissions: [],

    /* =====================================================
       ACCOUNT STATUS
    ===================================================== */

    status: firebaseUser.emailVerified
      ? "email_verified"
      : "pending",

    /* =====================================================
       COMPLIANCE STATUS
    ===================================================== */

    complianceStatus: {
      kyc: "pending",
      gst: "pending",
      pan: "pending",
      bankVerification: "pending",
      addressVerification: "pending",
    },

    /* =====================================================
       SUBSCRIPTION
    ===================================================== */

    subscription: {
      plan: "free",
      status: "inactive",
      expiresAt: null,
    },

    /* =====================================================
       SECURITY
    ===================================================== */

    security: {
      lastLoginAt: serverTimestamp(),
      lastPasswordChange: null,
      failedAttempts: 0,
      mfaEnabled: false,
      lastDevice: "web",
    },

    /* =====================================================
       ONBOARDING
    ===================================================== */

    onboarding: {
      accountCreated: true,
      profileCompleted: false,
      organizationCreated: false,
      documentsUploaded: false,
      complianceSubmitted: false,
      approved: false,
    },

    /* =====================================================
       ANALYTICS
    ===================================================== */

    analytics: {
      totalLogins: 1,
      lastActiveAt: serverTimestamp(),
    },

    /* =====================================================
       SYSTEM
    ===================================================== */

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
      emailVerified: firebaseUser.emailVerified,

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

export const updateUserStatus = async ({
  uid,
  status,
}) => {
  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update status error:", error);

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
      role,
      permissions,
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

    await updateDoc(userRef, {
      organizationId,
      organizationRole,

      onboarding: {
        organizationCreated: true,
      },

      updatedAt: serverTimestamp(),
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