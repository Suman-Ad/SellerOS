import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  observeAuthState,
  logoutUser,
  createSessionRecord,
} from "@/services/auth/authService";

import {
  getOrganization,
} from "@/services/auth/organizationService";

import {
  buildUserPermissions,
} from "@/services/rbac/permissionService";

import {
  buildRBACFlags,
} from "@/services/rbac/roleServices";

import {

  isSellerApproved,

  canAccessDashboard,

  requiresReKyc,

} from "@/utils/lifecycle/lifecycleResolver";

/* =========================================================
   CONTEXT
========================================================= */

const AuthContext =
  createContext(null);

/* =========================================================
   PROVIDER
========================================================= */

export function AuthProvider({
  children,
}) {

  /* =====================================================
     CORE STATE
  ===================================================== */

  const [user, setUser] =
    useState(null);

  const [userData, setUserData] =
    useState(null);

  const [organization, setOrganization] =
    useState(null);

  const [permissions, setPermissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [authInitialized,
    setAuthInitialized] =
    useState(false);

  /* =====================================================
     FETCH USER PROFILE
  ===================================================== */

  const fetchUserProfile =
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

          setUserData(null);

          return null;
        }

        const profile =
          snapshot.data();

        const normalizedProfile = {

          ...profile,

          access:
            profile.access || {},

          organization:
            profile.organization || {},

          governance:
            profile.governance || {},

          onboarding:
            profile.onboarding || {},

          compliance:
            profile.compliance || {},

          reKyc:
            profile.reKyc || {},
        };

        setUserData(normalizedProfile);

        const hydratedPermissions =
          buildUserPermissions({

            role:
              profile?.access?.role,

            organizationRole:
              profile?.organization
                ?.organizationRole,

            customPermissions:
              profile?.access
                ?.permissions || [],
          });

        setPermissions(
          hydratedPermissions
        );

        return profile;

      } catch (error) {

        console.error(
          "FETCH USER PROFILE ERROR:",
          error
        );

        return null;
      }
    };

  /* =====================================================
     FETCH ORGANIZATION
  ===================================================== */

  const fetchOrganization =
    async (organizationId) => {

      try {

        if (!organizationId) {

          setOrganization(null);

          return null;
        }

        const response =
          await getOrganization(
            organizationId
          );

        if (response.success) {

          setOrganization(
            response.data
          );

          return response.data;
        }

        setOrganization(null);

        return null;

      } catch (error) {

        console.error(
          "FETCH ORGANIZATION ERROR:",
          error
        );

        return null;
      }
    };

  /* =====================================================
     REFRESH USER
  ===================================================== */

  const refreshUser =
    async () => {

      try {

        if (!auth.currentUser)
          return;

        const profile =
          await fetchUserProfile(
            auth.currentUser.uid
          );

        if (
          profile?.organization
            ?.organizationId
        ) {

          await fetchOrganization(
            profile?.organization
              ?.organizationId
          );
        }

      } catch (error) {

        console.error(
          "REFRESH USER ERROR:",
          error
        );
      }
    };

  /* =====================================================
     REFRESH ORGANIZATION
  ===================================================== */

  const refreshOrganization =
    async () => {

      try {

        if (
          !userData?.organization?.organizationId
        ) {
          return;
        }

        await fetchOrganization(
          userData?.organization?.organizationId
        );

      } catch (error) {

        console.error(
          "REFRESH ORG ERROR:",
          error
        );
      }
    };

  /* =====================================================
     AUTH OBSERVER
  ===================================================== */

  useEffect(() => {

    const unsubscribe =
      observeAuthState(
        async (firebaseUser) => {

          try {

            setLoading(true);

            /* =====================
               USER LOGGED IN
            ===================== */

            if (firebaseUser) {

              setUser(firebaseUser);

              /* =====================
                 CREATE SESSION
              ===================== */

              await createSessionRecord({
                uid: firebaseUser.uid,
              });

              /* =====================
                 FETCH USER PROFILE
              ===================== */

              const profile =
                await fetchUserProfile(
                  firebaseUser.uid
                );

              /* =====================
                 FETCH ORGANIZATION
              ===================== */

              if (
                profile?.organization
                  ?.organizationId
              ) {

                await fetchOrganization(
                  profile?.organization
                    ?.organizationId
                );
              }

            }

            /* =====================
               USER LOGGED OUT
            ===================== */

            else {

              setUser(null);

              setUserData(null);

              setOrganization(
                null
              );

              setPermissions([]);

            }

          } catch (error) {

            console.error(
              "AUTH CONTEXT ERROR:",
              error
            );

          } finally {

            setLoading(false);

            setAuthInitialized(
              true
            );
          }
        }
      );

    return () => unsubscribe();

  }, []);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout =
    async () => {

      try {

        await logoutUser();

        setUser(null);

        setUserData(null);

        setOrganization(null);

        setPermissions([]);

      } catch (error) {

        console.error(
          "LOGOUT ERROR:",
          error
        );
      }
    };

  /* =====================================================
     ENTERPRISE FLAGS
  ===================================================== */

  const isAuthenticated =
    !!user;


  const rbac =
    buildRBACFlags({

      role:
        userData?.access?.role,

      organizationRole:
        userData?.organization?.organizationRole,
    });

  const isApproved =
    isSellerApproved(
      userData
    );

  const isProfileComplete =
    userData?.onboarding
      ?.profileCompleted;


  const isSuperAdmin =
    userData?.access?.role ===
    "super_admin";

  const isAdmin =
    [
      "admin",
      "super_admin",
    ].includes(
      userData?.access?.role
    );

  const isSeller =
    [
      "seller",
    ].includes(
      userData?.userType
    );

  const hasOrganization =
    !!userData?.organization
      ?.organizationId;

  const reKycRequired =
    requiresReKyc(
      userData
    );

  const dashboardAccess =
    canAccessDashboard(
      userData
    );

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = useMemo(
    () => ({
      /* =====================
         CORE
      ===================== */

      // user,
      // currentUser: user,

      // userData,

      // organization,

      // permissions,

      // loading,

      // authInitialized,

      // /* =====================
      //    FLAGS
      // ===================== */

      // isAuthenticated,

      // isApproved,

      // isProfileComplete,

      // hasOrganization,

      // ...rbac,

      // dashboardAccess,

      // reKycRequired,

      // rbac,

      // isSuperAdmin,

      // /* =====================
      //    METHODS
      // ===================== */

      // refreshUser,

      // refreshOrganization,

      // logout,

      user,

      currentUser: user,

      userData,

      organization,

      permissions,

      loading,

      authInitialized,

      /* FLAGS */

      isAuthenticated,

      isAdmin,

      isSuperAdmin,

      isSeller,

      hasOrganization,

      dashboardAccess,

      reKycRequired,

      rbac,

      /* METHODS */

      refreshUser,

      refreshOrganization,

      logout,

    }),

    [
      user,
      userData,
      organization,
      permissions,
      loading,
      authInitialized,
      isAuthenticated,
      isApproved,
      isProfileComplete,
      hasOrganization,
      rbac,
      dashboardAccess,
      reKycRequired,
      isSuperAdmin,
      isAdmin,
      isSeller,
    ]
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <AuthContext.Provider
      value={value}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}