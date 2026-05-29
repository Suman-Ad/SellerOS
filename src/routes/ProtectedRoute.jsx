// import {
//   Navigate,
//   useLocation,
// } from "react-router-dom";

// import {
//   useAuth,
// } from "@/context/AuthContext";

// import {
//   resolveRedirectPath,
//   canAccessDashboard,
// } from "@/utils/lifecycle/lifecycleResolver";

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function ProtectedRoute({
//   children,
// }) {

//   const location =
//     useLocation();

//   const {
//     user,
//     userData,
//     loading,
//   } = useAuth();

//   /* =====================================================
//      LOADING
//   ===================================================== */

//   if (loading) {

//     return (

//       <div className="
//         min-h-screen
//         bg-black
//         flex
//         items-center
//         justify-center
//         text-white
//         text-xl
//         font-semibold
//       ">

//         Loading SellerOS...

//       </div>
//     );
//   }

//   /* =====================================================
//      NOT AUTHENTICATED
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
//      USER PROFILE MISSING
//   ===================================================== */

//   if (!userData) {

//     return (
//       <Navigate
//         to="/complete-profile"
//         replace
//       />
//     );
//   }



//   /* =====================================================
//      LIFECYCLE RESOLVER-2
//   ===================================================== */

//   const redirectPath =
//     resolveRedirectPath(
//       userData
//     );

//   const currentPath =
//     location.pathname;

//   /* =====================================================
//      PUBLIC LIFECYCLE ROUTES
//   ===================================================== */

//   const publicLifecycleRoutes = [

//     "/verify-email",

//     "/complete-profile",

//     "/organization-setup",

//     "/compliance-upload",

//     "/compliance-review",

//     "/pending-approval",

//     "/account-suspended",

//     "/application-rejected",

//     "/account-restricted",

//     "/rekyc-required",
//   ];


//   /* =====================================================
//        LIFECYCLE RESOLVER-1
//     ===================================================== */
//   const complianceEditable =
//     userData?.reKyc?.required ||
//     userData?.governance?.sellerStatus === "rejected" ||
//     userData?.governance?.sellerStatus === "pending_review";

//   if (
//     complianceEditable &&
//     currentPath === "/compliance-upload"
//   ) {
//     return children;
//   }

//   /* =====================================================
//       REDIRECT TO REQUIRED LIFECYCLE STEP
//    ===================================================== */
//   if (
//     redirectPath !== "/" &&
//     currentPath !== redirectPath
//   ) {

//     return (
//       <Navigate
//         to={redirectPath}
//         replace
//       />
//     );
//   }

//   /* =====================================================
//      PREVENT ACCESS TO ONBOARDING
//      AFTER APPROVAL
//   ===================================================== */

//   if (
//     canAccessDashboard(
//       userData
//     ) &&
//     publicLifecycleRoutes.includes(
//       currentPath
//     )
//   ) {

//     return (
//       <Navigate
//         to="/seller"
//         replace
//       />
//     );
//   }

//   /* =====================================================
//      SUCCESS
//   ===================================================== */

//   return children;
// }

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  resolveRedirectPath,
} from "@/utils/lifecycle/lifecycleResolver";

/* =========================================================
   COMPONENT
========================================================= */

export default function ProtectedRoute({
  children,
}) {

  const location =
    useLocation();

  const {
    user,
    userData,
    loading,
  } = useAuth();

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        text-white
      ">

        Loading...

      </div>
    );
  }

  /* =====================================================
     NOT LOGGED IN
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
     EMAIL NOT VERIFIED
  ===================================================== */

  if (!user.emailVerified) {

    return (
      <Navigate
        to="/verify-email"
        replace
      />
    );
  }

  /* =====================================================
     USER DOC NOT READY
  ===================================================== */

  if (!userData) {

    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }

  /* =====================================================
     ACCOUNT RESTRICTED
  ===================================================== */

  const restrictedStatuses = [

    "blocked",

    "suspended",

    "flagged",
  ];

  const sellerStatus =
    userData?.governance
      ?.sellerStatus;

  if (
    restrictedStatuses.includes(
      sellerStatus
    ) &&
    location.pathname !==
    "/account-restricted"
  ) {

    return (
      <Navigate
        to="/account-restricted"
        replace
      />
    );
  }

  /* =====================================================
     RE-KYC / RE-UPLOAD ALLOW
  ===================================================== */

  const complianceEditable =

    userData?.reKyc?.required ||

    sellerStatus ===
    "rejected" ||

    sellerStatus ===
    "pending_review" ||

    sellerStatus ===
    "under_review";

  if (
    complianceEditable &&
    location.pathname ===
    "/compliance-upload"
  ) {

    return children;
  }

  /* =====================================================
     LIFECYCLE REDIRECT
  ===================================================== */

  const redirectPath =
    resolveRedirectPath(
      userData
    );

  if (
    redirectPath &&
    redirectPath !== "/" &&
    location.pathname !==
    redirectPath
  ) {

    return (
      <Navigate
        to={redirectPath}
        replace
      />
    );
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  return children;
}