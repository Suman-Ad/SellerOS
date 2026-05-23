import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "@/context/AuthContext";

import {

  hasPermission,

  hasAnyPermission,

  hasAllPermissions,

} from "@/services/rbac/permissionService";

/* =========================================================
   COMPONENT
========================================================= */

export default function PermissionRoute({

  children,

  /* =====================================================
     SINGLE PERMISSION
  ===================================================== */

  permission = null,

  /* =====================================================
     MULTIPLE PERMISSIONS
  ===================================================== */

  anyPermissions = [],

  allPermissions = [],

  /* =====================================================
     CONFIG
  ===================================================== */

  redirectTo =
    "/unauthorized",
}) {

  const location =
    useLocation();

  const {

    loading,

    user,

    permissions,

    isSuperAdmin,
  } = useAuth();

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex items-center
        justify-center
        text-white
      ">

        Loading permissions...

      </div>
    );
  }

  /* =====================================================
     AUTH CHECK
  ===================================================== */

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

  /* =====================================================
     SUPER ADMIN OVERRIDE
  ===================================================== */

  if (isSuperAdmin) {

    return children;
  }

  /* =====================================================
     SINGLE PERMISSION
  ===================================================== */

  if (permission) {

    const allowed =
      hasPermission({

        permissions,

        permission,
      });

    if (!allowed) {

      return (
        <Navigate
          to={redirectTo}
          replace
        />
      );
    }
  }

  /* =====================================================
     ANY PERMISSIONS
  ===================================================== */

  if (
    anyPermissions.length >
    0
  ) {

    const allowed =
      hasAnyPermission({

        permissions,

        requiredPermissions:
          anyPermissions,
      });

    if (!allowed) {

      return (
        <Navigate
          to={redirectTo}
          replace
        />
      );
    }
  }

  /* =====================================================
     ALL PERMISSIONS
  ===================================================== */

  if (
    allPermissions.length >
    0
  ) {

    const allowed =
      hasAllPermissions({

        permissions,

        requiredPermissions:
          allPermissions,
      });

    if (!allowed) {

      return (
        <Navigate
          to={redirectTo}
          replace
        />
      );
    }
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  return children;
}