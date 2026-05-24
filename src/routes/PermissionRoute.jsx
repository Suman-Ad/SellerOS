// import {
//   Navigate,
//   useLocation,
// } from "react-router-dom";

// import {
//   useAuth,
// } from "@/context/AuthContext";

// import {

//   hasPermission,

//   hasAnyPermission,

//   hasAllPermissions,

// } from "@/services/rbac/permissionService";

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function PermissionRoute({

//   children,

//   /* =====================================================
//      SINGLE PERMISSION
//   ===================================================== */

//   permission = null,

//   /* =====================================================
//      MULTIPLE PERMISSIONS
//   ===================================================== */

//   anyPermissions = [],

//   allPermissions = [],

//   /* =====================================================
//      CONFIG
//   ===================================================== */

//   redirectTo =
//     "/unauthorized",
// }) {

//   const location =
//     useLocation();

//   const {

//     loading,

//     user,

//     permissions,

//     isSuperAdmin,
//   } = useAuth();

//   /* =====================================================
//      LOADING
//   ===================================================== */

//   if (loading) {

//     return (

//       <div className="
//         min-h-screen
//         bg-black
//         flex items-center
//         justify-center
//         text-white
//       ">

//         Loading permissions...

//       </div>
//     );
//   }

//   /* =====================================================
//      AUTH CHECK
//   ===================================================== */

//   if (!user) {

//     return (
//       <Navigate
//         to="/login"
//         state={{
//           from: location,
//         }}
//         replace
//       />
//     );
//   }

//   /* =====================================================
//      SUPER ADMIN OVERRIDE
//   ===================================================== */

//   if (isSuperAdmin) {

//     return children;
//   }

//   /* =====================================================
//      SINGLE PERMISSION
//   ===================================================== */

//   if (permission) {

//     const allowed =
//       hasPermission({

//         permissions,

//         permission,
//       });

//     if (!allowed) {

//       return (
//         <Navigate
//           to={redirectTo}
//           replace
//         />
//       );
//     }
//   }

//   /* =====================================================
//      ANY PERMISSIONS
//   ===================================================== */

//   if (
//     anyPermissions.length >
//     0
//   ) {

//     const allowed =
//       hasAnyPermission({

//         permissions,

//         requiredPermissions:
//           anyPermissions,
//       });

//     if (!allowed) {

//       return (
//         <Navigate
//           to={redirectTo}
//           replace
//         />
//       );
//     }
//   }

//   /* =====================================================
//      ALL PERMISSIONS
//   ===================================================== */

//   if (
//     allPermissions.length >
//     0
//   ) {

//     const allowed =
//       hasAllPermissions({

//         permissions,

//         requiredPermissions:
//           allPermissions,
//       });

//     if (!allowed) {

//       return (
//         <Navigate
//           to={redirectTo}
//           replace
//         />
//       );
//     }
//   }

//   /* =====================================================
//      SUCCESS
//   ===================================================== */

//   return children;
// }

import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/context/AuthContext";

/* =========================================================
   ENTERPRISE PERMISSION ROUTE
========================================================= */

export default function PermissionRoute({

  children,

  requiredPermissions = [],

  requireAll = false,

  redirectTo = "/unauthorized",

  fallback = null,

  allowSuperAdminOverride = true,
}) {

  const {

    user,

    userData,

    permissions,

    loading,
  } = useAuth();

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      fallback || (

        <div className="
          min-h-screen
          bg-black
          flex items-center
          justify-center
          text-white
          text-xl
        ">

          Loading permissions...

        </div>
      )
    );
  }

  /* =====================================================
     NOT AUTHENTICATED
  ===================================================== */

  if (!user || !userData) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =====================================================
     NO PERMISSIONS REQUIRED
  ===================================================== */

  if (
    requiredPermissions.length === 0
  ) {

    return children;
  }

  /* =====================================================
     SUPER ADMIN OVERRIDE
  ===================================================== */

  if (

    allowSuperAdminOverride &&

    userData?.access?.role ===
      "super_admin"
  ) {

    return children;
  }

  /* =====================================================
     USER PERMISSIONS
  ===================================================== */

  const userPermissions =
    permissions || [];

  /* =====================================================
     REQUIRE ALL
  ===================================================== */

  if (requireAll) {

    const hasAllPermissions =

      requiredPermissions.every(
        (permission) =>

          userPermissions.includes(
            permission
          )
      );

    if (!hasAllPermissions) {

      return (
        <Navigate
          to={redirectTo}
          replace
        />
      );
    }
  }

  /* =====================================================
     REQUIRE ANY
  ===================================================== */

  else {

    const hasPermission =

      requiredPermissions.some(
        (permission) =>

          userPermissions.includes(
            permission
          )
      );

    if (!hasPermission) {

      return (
        <Navigate
          to={redirectTo}
          replace
        />
      );
    }
  }

  /* =====================================================
     ACCESS GRANTED
  ===================================================== */

  return children;
}