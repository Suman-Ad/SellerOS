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

        setUserData(profile);

        const hydratedPermissions =
  buildUserPermissions({

    role:
      profile.role,

    organizationRole:
      profile.organizationRole,

    customPermissions:
      profile.permissions || [],
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
          profile?.organizationId
        ) {

          await fetchOrganization(
            profile.organizationId
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
          !userData?.organizationId
        ) {
          return;
        }

        await fetchOrganization(
          userData.organizationId
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
                profile?.organizationId
              ) {

                await fetchOrganization(
                  profile.organizationId
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
      userData?.role,

    organizationRole:
      userData?.organizationRole,
  });

  const isApproved =
    userData?.isApproved === true;

  const isProfileComplete =
    userData?.onboarding
      ?.profileCompleted;

  const hasOrganization =
    !!organization;

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = useMemo(
    () => ({
      /* =====================
         CORE
      ===================== */

      user,
      currentUser: user,

      userData,

      organization,

      permissions,

      loading,

      authInitialized,

      /* =====================
         FLAGS
      ===================== */

      isAuthenticated,

      isApproved,

      isProfileComplete,

      hasOrganization,

      ...rbac,

      /* =====================
         METHODS
      ===================== */

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