import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  attachOrganizationToUser,
} from "./userSync";

import {
  ORGANIZATION_ROLES,
} from "@/constants/userLifecycle";

import {
  ONBOARDING_STEPS,
} from "@/constants/userLifecycle";
/* =========================================================
   HELPERS
========================================================= */

const generateOrganizationSlug = (name = "") => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

/* =========================================================
   DEFAULT ORGANIZATION MODEL
========================================================= */

const buildOrganizationModel = ({
  organizationId,
  ownerId,
  organizationName,
  organizationType = "seller_company",
  additionalData = {},
}) => {
  return {
    organizationId,

    type: organizationType,

    organizationName,

    organizationSlug:
      generateOrganizationSlug(organizationName),

    ownerId,

    /* =====================================================
       BRANDING
    ===================================================== */

    logo: "",
    banner: "",

    /* =====================================================
       CONTACT
    ===================================================== */

    businessEmail:
      additionalData.businessEmail || "",

    businessPhone:
      additionalData.businessPhone || "",

    website:
      additionalData.website || "",

    /* =====================================================
       ADDRESS
    ===================================================== */

    address: {
      country:
        additionalData.country || "",

      state:
        additionalData.state || "",

      city:
        additionalData.city || "",

      postalCode:
        additionalData.postalCode || "",

      addressLine:
        additionalData.addressLine || "",
    },

    /* =====================================================
       COMPLIANCE
    ===================================================== */

    compliance: {

      gst: {
        status: "pending",
        verifiedAt: null,
      },

      pan: {
        status: "pending",
        verifiedAt: null,
      },

      businessLicense: {
        status: "pending",
        verifiedAt: null,
      },

      bank: {
        status: "pending",
        verifiedAt: null,
      },
    },

    lifecycle: {

      onboardingCompleted: false,

      activated: false,

      activatedAt: null,
    },
    /* =====================================================
       SUBSCRIPTION
    ===================================================== */

    subscription: {
      plan: "starter",
      status: "active",
      expiresAt: null,
    },


    /* =====================================================
       SETTINGS
    ===================================================== */

    settings: {
      marketplaceEnabled: true,
      analyticsEnabled: true,
      inventoryEnabled: true,
      orderManagementEnabled: true,
      teamManagementEnabled: true,
    },

    /* =====================================================
       ANALYTICS
    ===================================================== */

    analytics: {
      totalMembers: 1,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },

    /* =====================================================
       STATUS
    ===================================================== */

    governance: {
      status: "active",

      verified: false,

      suspended: false,

      flagged: false,
    },

    /* =====================================================
       METADATA
    ===================================================== */

    metadata: {
      createdFrom: "web",
      environment: "production",
    },

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };
};

/* =========================================================
   CREATE ORGANIZATION
========================================================= */

export const createOrganization = async ({
  ownerId,
  organizationName,
  organizationType = "seller_company",
  additionalData = {},
}) => {
  try {
    const organizationRef = doc(
      collection(db, "organizations")
    );

    const organizationId = organizationRef.id;

    const organizationData =
      buildOrganizationModel({
        organizationId,
        ownerId,
        organizationName,
        organizationType,
        additionalData,
      });

    /* =====================================================
       CREATE ORGANIZATION DOCUMENT
    ===================================================== */

    await setDoc(
      organizationRef,
      organizationData
    );

    /* =====================================================
       CREATE OWNER MEMBERSHIP
    ===================================================== */

    const memberRef = doc(
      db,
      "organization_members",
      `${organizationId}_${ownerId}`
    );

    await setDoc(memberRef, {
      organizationId,
      userId: ownerId,

      organizationRole: ORGANIZATION_ROLES.OWNER,

      permissions: [
        "organization.manage",
        "users.manage",
        "products.manage",
        "orders.manage",
        "analytics.view",
        "compliance.manage",
      ],

      governance: {
        status: "active",

        verified: false,

        suspended: false,

        flagged: false,
      },

      joinedAt: serverTimestamp(),

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });

    /* =====================================================
       LINK USER TO ORGANIZATION
    ===================================================== */

    await attachOrganizationToUser({
      uid: ownerId,
      organizationId,
      organizationRole: ORGANIZATION_ROLES.OWNER,
    });

    const userRef = doc(
      db,
      "users",
      ownerId
    );

    // await updateDoc(userRef, {
    //   "onboarding.organizationCreated": true,
    //   updatedAt: serverTimestamp(),
    // });

    return {
      success: true,
      organizationId,
      data: organizationData,
    };
  } catch (error) {
    console.error(
      "Create organization error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   GET ORGANIZATION
========================================================= */

export const getOrganization = async (
  organizationId
) => {
  try {
    const organizationRef = doc(
      db,
      "organizations",
      organizationId
    );

    const snapshot = await getDoc(
      organizationRef
    );

    if (!snapshot.exists()) {
      return {
        success: false,
        error: "Organization not found.",
      };
    }

    return {
      success: true,
      data: snapshot.data(),
    };
  } catch (error) {
    console.error(
      "Get organization error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   UPDATE ORGANIZATION
========================================================= */

export const updateOrganization = async ({
  organizationId,
  data = {},
}) => {
  try {
    const organizationRef = doc(
      db,
      "organizations",
      organizationId
    );

    await updateDoc(organizationRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Update organization error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   DELETE ORGANIZATION
========================================================= */

export const deleteOrganization = async (
  organizationId
) => {
  try {
    const organizationRef = doc(
      db,
      "organizations",
      organizationId
    );

    await deleteDoc(organizationRef);

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Delete organization error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   ADD MEMBER
========================================================= */

export const addOrganizationMember = async ({
  organizationId,
  userId,
  role = "member",
  permissions = [],
}) => {
  try {
    const memberRef = doc(
      db,
      "organization_members",
      `${organizationId}_${userId}`
    );

    await setDoc(memberRef, {
      organizationId,
      userId,

      organizationRole: role,

      permissions,

      governance: {
        status: "active",

        verified: false,

        suspended: false,

        flagged: false,
      },

      joinedAt: serverTimestamp(),

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });

    await attachOrganizationToUser({
      uid: userId,
      organizationId,
      organizationRole: role,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Add organization member error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   REMOVE MEMBER
========================================================= */

export const removeOrganizationMember = async ({
  organizationId,
  userId,
}) => {
  try {
    const memberRef = doc(
      db,
      "organization_members",
      `${organizationId}_${userId}`
    );

    await deleteDoc(memberRef);

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Remove member error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   GET ORGANIZATION MEMBERS
========================================================= */

export const getOrganizationMembers = async (
  organizationId
) => {
  try {
    const membersRef = collection(
      db,
      "organization_members"
    );

    const q = query(
      membersRef,
      where(
        "organizationId",
        "==",
        organizationId
      )
    );

    const snapshot = await getDocs(q);

    const members = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error(
      "Get organization members error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   UPDATE MEMBER ROLE
========================================================= */

export const updateMemberRole = async ({
  organizationId,
  userId,
  role,
  permissions = [],
}) => {
  try {
    const memberRef = doc(
      db,
      "organization_members",
      `${organizationId}_${userId}`
    );

    await updateDoc(memberRef, {
      organizationRole: role,
      permissions,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Update member role error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   INVITE MEMBER
========================================================= */

export const inviteOrganizationMember =
  async ({
    organizationId,
    email,
    role = "member",
  }) => {
    try {
      const inviteRef = doc(
        collection(
          db,
          "organization_invitations"
        )
      );

      await setDoc(inviteRef, {
        organizationId,

        email,

        organizationRole: role,

        status: "pending",

        invitedAt: serverTimestamp(),

        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        inviteId: inviteRef.id,
      };
    } catch (error) {
      console.error(
        "Invite member error:",
        error
      );

      return {
        success: false,
        error: error.message,
      };
    }
  };

/* =========================================================
   GET USER ORGANIZATIONS
========================================================= */

export const getUserOrganizations =
  async (userId) => {
    try {
      const membersRef = collection(
        db,
        "organization_members"
      );

      const q = query(
        membersRef,
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);

      const organizations = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      return {
        success: true,
        data: organizations,
      };
    } catch (error) {
      console.error(
        "Get user organizations error:",
        error
      );

      return {
        success: false,
        error: error.message,
      };
    }
  };