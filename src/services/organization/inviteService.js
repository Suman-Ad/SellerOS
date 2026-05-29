import {

  addDoc,

  collection,

  doc,

  getDoc,

  getDocs,

  query,

  serverTimestamp,

  updateDoc,

  where,

} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  ORGANIZATION_ROLES,
} from "@/services/rbac/roleServices";

/* =========================================================
   COLLECTIONS
========================================================= */

const INVITATIONS_COLLECTION =
  "organization_invitations";

const MEMBERS_COLLECTION =
  "organization_members";

/* =========================================================
   GENERATE TOKEN
========================================================= */

export const generateInviteToken =
  () => {

    return crypto.randomUUID();
  };

/* =========================================================
   CREATE INVITATION
========================================================= */

export const createOrganizationInvitation =
  async ({

    organizationId,

    organizationName,

    invitedBy,

    invitedByName,

    invitedEmail,

    organizationRole =
    ORGANIZATION_ROLES.STAFF,

    permissions = [],

    expiresInDays = 7,
  }) => {

    try {

      /* =============================================
         DUPLICATE INVITATION CHECK
      ============================================= */

      if (!organizationId) {

        throw new Error(
          "organizationId is undefined"
        );
      }

      if (!invitedEmail) {

        throw new Error(
          "invitedEmail is undefined"
        );
      }

      const existingQuery =
        query(

          collection(
            db,
            INVITATIONS_COLLECTION
          ),

          where(
            "organizationId",
            "==",
            organizationId
          ),

          where(
            "invitedEmail",
            "==",
            invitedEmail
          ),

          where(
            "status",
            "==",
            "pending"
          )
        );

      const existingSnapshot =
        await getDocs(
          existingQuery
        );

      if (
        !existingSnapshot.empty
      ) {

        throw new Error(
          "Pending invitation already exists for this email"
        );
      }

      /* =============================================
         TOKEN
      ============================================= */

      const token =
        generateInviteToken();

      /* =============================================
         EXPIRATION
      ============================================= */

      const expiresAt =
        new Date();

      expiresAt.setDate(
        expiresAt.getDate() +
        expiresInDays
      );

      /* =============================================
         CREATE INVITATION
      ============================================= */

      const invitationRef =
        await addDoc(

          collection(
            db,
            INVITATIONS_COLLECTION
          ),

          {

            organizationId,

            organizationName,

            invitedBy,

            invitedByName,

            invitedEmail:
              invitedEmail.toLowerCase(),

            organizationRole,

            permissions,

            token,

            status:
              "pending",

            expiresAt,

            acceptedAt:
              null,

            rejectedAt:
              null,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

      return {

        success: true,

        invitationId:
          invitationRef.id,

        token,
      };

    } catch (error) {

      console.error(
        "Create invitation error:",
        error
      );

      throw error;
    }
  };

/* =========================================================
   GET INVITATION BY TOKEN
========================================================= */

export const getInvitationByToken =
  async (token) => {

    try {

      const invitationQuery =
        query(

          collection(
            db,
            INVITATIONS_COLLECTION
          ),

          where(
            "token",
            "==",
            token
          )
        );

      const snapshot =
        await getDocs(
          invitationQuery
        );

      if (
        snapshot.empty
      ) {

        return null;
      }

      const invitation =
        snapshot.docs[0];

      return {

        id:
          invitation.id,

        ...invitation.data(),
      };

    } catch (error) {

      console.error(
        "Get invitation error:",
        error
      );

      throw error;
    }
  };

/* =========================================================
   ACCEPT INVITATION
========================================================= */

export const acceptInvitation =
  async ({

    invitationId,

    uid,

    fullName,

    email,
  }) => {

    try {

      /* =============================================
         GET INVITATION
      ============================================= */

      const invitationRef =
        doc(
          db,
          INVITATIONS_COLLECTION,
          invitationId
        );

      const invitationSnapshot =
        await getDoc(
          invitationRef
        );

      if (
        !invitationSnapshot.exists()
      ) {

        throw new Error(
          "Invitation not found"
        );
      }

      const invitation =
        invitationSnapshot.data();

      /* =============================================
         VALIDATE STATUS
      ============================================= */

      if (
        invitation.status !==
        "pending"
      ) {

        throw new Error(
          "Invitation already used"
        );
      }

      /* =============================================
         VALIDATE EMAIL
      ============================================= */

      if (
        invitation.invitedEmail !==
        email.toLowerCase()
      ) {

        throw new Error(
          "Invitation email mismatch"
        );
      }

      /* =============================================
         VALIDATE EXPIRATION
      ============================================= */

      const now =
        new Date();

      const expiresAt =
        invitation.expiresAt
          ?.toDate?.() ||
        invitation.expiresAt;

      if (
        expiresAt &&
        now > expiresAt
      ) {

        throw new Error(
          "Invitation expired"
        );
      }

      /* =============================================
         CHECK MEMBERSHIP
      ============================================= */

      const memberQuery =
        query(

          collection(
            db,
            MEMBERS_COLLECTION
          ),

          where(
            "organizationId",
            "==",
            invitation.organizationId
          ),

          where(
            "uid",
            "==",
            uid
          )
        );

      const memberSnapshot =
        await getDocs(
          memberQuery
        );

      if (
        !memberSnapshot.empty
      ) {

        throw new Error(
          "User already belongs to organization"
        );
      }

      /* =============================================
         CREATE MEMBERSHIP
      ============================================= */

      await addDoc(

        collection(
          db,
          MEMBERS_COLLECTION
        ),

        {

          uid,

          fullName,

          email,

          organizationId:
            invitation.organizationId,

          organizationName:
            invitation.organizationName,

          organizationRole:
            invitation.organizationRole,

          permissions:
            invitation.permissions || [],

          status:
            "active",

          joinedAt:
            serverTimestamp(),

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      /* =============================================
         UPDATE USER PROFILE
      ============================================= */

      const userRef =
        doc(
          db,
          "users",
          uid
        );

      await updateDoc(
        userRef,
        {

          organizationId:
            invitation.organizationId,

          organizationName:
            invitation.organizationName,

          organizationRole:
            invitation.organizationRole,

          updatedAt:
            serverTimestamp(),
        }
      );

      /* =============================================
         MARK INVITATION ACCEPTED
      ============================================= */

      await updateDoc(
        invitationRef,
        {

          status:
            "accepted",

          acceptedAt:
            serverTimestamp(),

          acceptedBy:
            uid,

          updatedAt:
            serverTimestamp(),
        }
      );

      return {

        success: true,

        organizationId:
          invitation.organizationId,
      };

    } catch (error) {

      console.error(
        "Accept invitation error:",
        error
      );

      throw error;
    }
  };

/* =========================================================
   REJECT INVITATION
========================================================= */

export const rejectInvitation =
  async ({
    invitationId,
  }) => {

    try {

      const invitationRef =
        doc(
          db,
          INVITATIONS_COLLECTION,
          invitationId
        );

      await updateDoc(
        invitationRef,
        {

          status:
            "rejected",

          rejectedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      return {
        success: true,
      };

    } catch (error) {

      console.error(
        "Reject invitation error:",
        error
      );

      throw error;
    }
  };

/* =========================================================
   GET ORGANIZATION INVITATIONS
========================================================= */

export const getOrganizationInvitations =
  async (
    organizationId
  ) => {

    try {

      const invitationsQuery =
        query(

          collection(
            db,
            INVITATIONS_COLLECTION
          ),

          where(
            "organizationId",
            "==",
            organizationId
          )
        );

      const snapshot =
        await getDocs(
          invitationsQuery
        );

      return snapshot.docs.map(
        (doc) => ({

          id:
            doc.id,

          ...doc.data(),
        })
      );

    } catch (error) {

      console.error(
        "Get invitations error:",
        error
      );

      throw error;
    }
  };