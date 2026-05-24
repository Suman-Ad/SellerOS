import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "@/context/AuthContext";

import {

  hasPlatformRole,

  hasOrganizationRole,

  hasMinimumPlatformRole,

  hasMinimumOrganizationRole,

} from "@/services/rbac/roleServices";

/* =========================================================
   COMPONENT
========================================================= */

export default function RoleRoute({

  children,

  /* =========================================
     PLATFORM ACCESS
  ========================================= */

  allowedPlatformRoles = [],

  minimumPlatformRole = null,

  /* =========================================
     ORGANIZATION ACCESS
  ========================================= */

  allowedOrganizationRoles = [],

  minimumOrganizationRole = null,

  /* =========================================
     OVERRIDES
  ========================================= */

  allowSuperAdminOverride = true,
}) {

  const location =
    useLocation();

  const {

    loading,

    user,

    userData,

    isSuperAdmin,
  } = useAuth();

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        text-white
        text-xl
        font-semibold
      ">

        Loading permissions...

      </div>
    );
  }

  /* =========================================
     AUTH CHECK
  ========================================= */

  if (!user) {

    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  /* =========================================
     PROFILE CHECK
  ========================================= */

  if (!userData) {

    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }

  /* =========================================
     SUPER ADMIN OVERRIDE
  ========================================= */

  if (
    allowSuperAdminOverride &&
    isSuperAdmin
  ) {

    return children;
  }

  /* =========================================
     CURRENT ROLES
  ========================================= */

  const platformRole =
    userData?.access?.role;

  const organizationRole =
    userData?.organization
      ?.organizationRole;

  /* =========================================
     PLATFORM ROLE CHECK
  ========================================= */

  if (
    allowedPlatformRoles.length >
    0
  ) {

    const hasAccess =
      hasPlatformRole({

        currentRole:
          platformRole,

        allowedRoles:
          allowedPlatformRoles,
      });

    if (!hasAccess) {

      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  /* =========================================
     PLATFORM MINIMUM ROLE
  ========================================= */

  if (
    minimumPlatformRole
  ) {

    const hasMinimum =
      hasMinimumPlatformRole({

        currentRole:
          platformRole,

        requiredRole:
          minimumPlatformRole,
      });

    if (!hasMinimum) {

      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  /* =========================================
     ORGANIZATION ROLE CHECK
  ========================================= */

  if (
    allowedOrganizationRoles.length >
    0
  ) {

    const hasAccess =
      hasOrganizationRole({

        currentRole:
          organizationRole,

        allowedRoles:
          allowedOrganizationRoles,
      });

    if (!hasAccess) {

      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  /* =========================================
     ORGANIZATION MINIMUM ROLE
  ========================================= */

  if (
    minimumOrganizationRole
  ) {

    const hasMinimum =
      hasMinimumOrganizationRole({

        currentRole:
          organizationRole,

        requiredRole:
          minimumOrganizationRole,
      });

    if (!hasMinimum) {

      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  /* =========================================
     SUCCESS
  ========================================= */

  return children;
}