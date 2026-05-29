import {
  GoogleAuthProvider,

  createUserWithEmailAndPassword,

  signInWithEmailAndPassword,

  signInWithPopup,

  sendEmailVerification,

  sendPasswordResetEmail,

  signOut,

  updateProfile,

  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  syncUserProfile,
} from "./userSync";

import {
  createOrganization,
} from "./organizationService";

import logActivity
  from "@/utils/activity/logActivity";

import {
  resolveRedirectPath,
} from "@/utils/lifecycle/lifecycleResolver";

/* =========================================================
   PROVIDERS
========================================================= */

const googleProvider =
  new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

/* =========================================================
   ERROR FORMATTER
========================================================= */

const formatAuthError =
  (error) => {

    switch (error.code) {

      case "auth/email-already-in-use":
        return "Email already registered.";

      case "auth/invalid-email":
        return "Invalid email address.";

      case "auth/weak-password":
        return "Password too weak.";

      case "auth/user-not-found":
        return "User not found.";

      case "auth/wrong-password":

      case "auth/invalid-credential":
        return "Invalid email or password.";

      case "auth/too-many-requests":
        return "Too many requests. Try again later.";

      case "auth/popup-closed-by-user":
        return "Google login cancelled.";

      default:
        return (
          error.message ||
          "Authentication failed."
        );
    }
  };

/* =========================================================
   SESSION TRACKING
========================================================= */

export const createSessionRecord =
  async ({
    uid,
    device = "web",
  }) => {

    try {

      const sessionRef = doc(
        db,
        "user_sessions",
        uid
      );

      await setDoc(
        sessionRef,
        {
          uid,

          device,

          active: true,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
        { merge: true }
      );

      return true;

    } catch (error) {

      console.error(
        "SESSION ERROR:",
        error
      );

      return false;
    }
  };

/* =========================================================
   UPDATE LOGIN METADATA
========================================================= */

const updateLoginMetadata =
  async ({
    uid,
    emailVerified = false,
  }) => {

    try {

      const userRef = doc(
        db,
        "users",
        uid
      );

      await updateDoc(userRef, {

        "authStatus.emailVerified":
          emailVerified,

        "security.lastLoginAt":
          serverTimestamp(),

        "analytics.lastActiveAt":
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      });

    } catch (error) {

      console.error(
        "LOGIN METADATA ERROR:",
        error
      );
    }
  };

/* =========================================================
   LOAD USER PROFILE
========================================================= */

export const getUserProfile =
  async (uid) => {

    try {

      const userRef = doc(
        db,
        "users",
        uid
      );

      const snapshot =
        await getDoc(userRef);

      if (!snapshot.exists()) {

        return {
          success: false,
          error:
            "User profile not found.",
        };
      }

      return {
        success: true,
        data: snapshot.data(),
      };

    } catch (error) {

      return {
        success: false,
        error: error.message,
      };
    }
  };

/* =========================================================
   EMAIL REGISTER
========================================================= */

export const registerWithEmail =
  async ({
    email,
    password,

    fullName,
    username,
    phoneNumber,

    userType = "seller",

    organizationName,

    businessData = {},

    subscriptionData = {},
  }) => {

    let firebaseUser = null;

    try {

      /* =====================
         CREATE AUTH USER
      ===================== */

      const response =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      firebaseUser =
        response.user;

      /* =====================
         UPDATE PROFILE
      ===================== */

      await updateProfile(
        firebaseUser,
        {
          displayName:
            fullName,
        }
      );

      /* =====================
         VERIFY EMAIL
      ===================== */

      await sendEmailVerification(
        firebaseUser
      );

      /* =====================
         ENTERPRISE USER PROFILE
      ===================== */

      await syncUserProfile({
        firebaseUser,

        provider: "email",

        additionalData: {

          fullName,

          username,

          phoneNumber,

          userType,

          businessName:
            businessData.businessName,

          govId:
            businessData.govId,

          gstNo:
            businessData.gstNo,

          address:
            businessData.address,

          pin:
            businessData.pin,

          subscription: {

            planId:
              subscriptionData.planId,

            planName:
              subscriptionData.planName,

            status:
              "trial",

            isActive:
              true,

            subscribedAt:
              serverTimestamp(),
          },
        },
      });

      /* =====================
         CREATE ORGANIZATION
      ===================== */

      const organization =
        await createOrganization({
          ownerId:
            firebaseUser.uid,

          organizationName,

          additionalData:
            businessData,
        });

      /* =====================
         SESSION
      ===================== */

      await createSessionRecord({
        uid:
          firebaseUser.uid,
      });

      /* =====================
         ACTIVITY LOG
      ===================== */

      await logActivity({

        uid:
          firebaseUser.uid,

        type:
          "register",

        title:
          "Enterprise Registration",

        description:
          `${fullName} registered as ${userType}`,

        meta: {

          role:
            userType,

          organizationId:
            organization.organizationId,

          subscriptionPlan:
            subscriptionData.planName ||
            null,
        },
      });

      return {
        success: true,

        user:
          firebaseUser,

        organizationId:
          organization.organizationId,
      };

    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );

      /* =====================
         ROLLBACK
      ===================== */

      try {

        if (firebaseUser) {

          await firebaseUser.delete();
        }

      } catch (deleteError) {

        console.error(
          "ROLLBACK ERROR:",
          deleteError
        );
      }

      return {
        success: false,
        error:
          formatAuthError(error),
      };
    }
  };

/* =========================================================
   EMAIL LOGIN
========================================================= */

export const loginWithEmail =
  async ({
    email,
    password,
  }) => {

    try {

      /* =====================
         AUTH LOGIN
      ===================== */

      const response =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const firebaseUser =
        response.user;

      await firebaseUser.reload();

      /* =====================
         EMAIL VERIFIED
      ===================== */

      if (
        !firebaseUser.emailVerified
      ) {

        await signOut(auth);

        return {
          success: false,
          error:
            "Please verify your email before login.",
        };
      }

      /* =====================
         USER PROFILE
      ===================== */

      const profile =
        await getUserProfile(
          firebaseUser.uid
        );

      if (!profile.success) {

        await signOut(auth);

        return {
          success: false,
          error:
            "User profile not found.",
        };
      }

      const userData =
        profile.data;

      const redirectPath =
        resolveRedirectPath(
          userData
        );
      /* =====================
         APPROVAL VALIDATION
      ===================== */
      /* =====================
         BLOCK VALIDATION
      ===================== */

      if (
        [
          "blocked",
          "suspended",
          "rejected",
        ].includes(
          userData?.governance
            ?.sellerStatus
        )
      ) {

        await signOut(auth);

        return {
          success: false,
          error:
            "Account restricted.",
        };
      }

      /* =====================
         SESSION
      ===================== */

      await createSessionRecord({
        uid:
          firebaseUser.uid,
      });

      /* =====================
         LOGIN METADATA
      ===================== */

      await updateLoginMetadata({
        uid:
          firebaseUser.uid,

        emailVerified:
          true,
      });

      /* =====================
         ACTIVITY LOG
      ===================== */

      await logActivity({

        uid:
          firebaseUser.uid,

        type:
          "login",

        title:
          "Enterprise Login",

        description:
          "User logged into SellerOS",

        meta: {

          role:
            userData?.access?.role,

          fullName:
            userData.fullName,

          organizationId:
            userData?.organization
              ?.organizationId,
        },
      });

      return {
        success: true,

        user: firebaseUser,

        userData,

        redirectPath,
      };

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      return {
        success: false,
        error:
          formatAuthError(error),
      };
    }
  };

/* =========================================================
   GOOGLE LOGIN
========================================================= */

export const loginWithGoogle =
  async ({
    userType = "seller",
  } = {}) => {

    try {

      const response =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const firebaseUser =
        response.user;

      /* =====================
         ENTERPRISE SYNC
      ===================== */

      await syncUserProfile({

        firebaseUser,

        provider:
          "google",

        additionalData: {

          userType,
        },
      });

      /* =====================
         PROFILE
      ===================== */

      const profile =
        await getUserProfile(
          firebaseUser.uid
        );

      /* =====================
         SESSION
      ===================== */

      await createSessionRecord({
        uid:
          firebaseUser.uid,
      });

      const userData =
        profile.data;

      const redirectPath =
        resolveRedirectPath(
          userData
        );

      /* =====================
         LOGIN METADATA
      ===================== */

      await updateLoginMetadata({
        uid:
          firebaseUser.uid,

        emailVerified:
          true,
      });

      /* =====================
         ACTIVITY
      ===================== */

      await logActivity({

        uid:
          firebaseUser.uid,

        type:
          "google_login",

        title:
          `${firebaseUser.displayName || firebaseUser.email} - Google Authentication`,

        description:
          "User authenticated with Google",

        meta: {

          role:
            profile.data?.access?.role,
        },
      });

      return {
        success: true,

        user:
          firebaseUser,

        userData,

        redirectPath,
      };

    } catch (error) {

      console.error(
        "GOOGLE LOGIN ERROR:",
        error
      );

      return {
        success: false,
        error:
          formatAuthError(error),
      };
    }
  };

/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword =
  async (email) => {

    try {

      await sendPasswordResetEmail(
        auth,
        email
      );

      return {
        success: true,
        message:
          "Password reset email sent.",
      };

    } catch (error) {

      return {
        success: false,
        error:
          formatAuthError(error),
      };
    }
  };

/* =========================================================
   LOGOUT
========================================================= */

export const logoutUser =
  async () => {

    try {

      await signOut(auth);

      return {
        success: true,
      };

    } catch (error) {

      return {
        success: false,
        error:
          formatAuthError(error),
      };
    }
  };

/* =========================================================
   OBSERVER
========================================================= */

export const observeAuthState =
  (callback) => {

    return onAuthStateChanged(
      auth,
      callback
    );
  };