import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "@/context/AuthContext";

/* =========================================================
   COMPONENT
========================================================= */

export default function ProtectedRoute({

  children,

  allowedRoles = [],

  requireProfile = false,

  requireOrganization = false,

  requireCompliance = false,

  requireApproval = false,
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
        flex items-center
        justify-center
        text-white
        text-xl
      ">

        Loading SellerOS...

      </div>
    );
  }

  /* =====================================================
     NOT AUTHENTICATED
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
     USER PROFILE MISSING
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
     EMAIL VERIFICATION
  ===================================================== */

  if (
    !user.emailVerified
  ) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =====================================================
     RESTRICTED STATES
  ===================================================== */
  const restrictedStatuses = [

    "blocked",

    "suspended",

    "flagged",

    "rejected",
  ];

  const isRestricted =
    restrictedStatuses.includes(
      userData?.status
    );

  /* =========================================
     RESTRICTED ACCOUNTS
  ========================================= */

  if (
    isRestricted &&
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

  /* =========================================
     RE-KYC FLOW
  ========================================= */

  if (
    userData?.status ===
    "rekyc_required" &&
    location.pathname !==
    "/compliance-upload"
  ) {

    return (
      <Navigate
        to="/compliance-upload"
        replace
      />
    );
  }
  
  /* =====================================================
     PROFILE COMPLETION
  ===================================================== */

  if (
    requireProfile &&
    !userData?.onboarding
      ?.profileCompleted
  ) {

    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }

  /* =====================================================
     ORGANIZATION SETUP
  ===================================================== */

  if (
    requireOrganization &&
    !userData?.organizationId
  ) {

    return (
      <Navigate
        to="/organization-setup"
        replace
      />
    );
  }

  /* =====================================================
     COMPLIANCE SUBMISSION
  ===================================================== */

  if (
    requireCompliance &&
    !userData?.onboarding
      ?.complianceSubmitted
  ) {

    return (
      <Navigate
        to="/compliance-upload"
        replace
      />
    );
  }

  /* =====================================================
     APPROVAL LIFECYCLE
  ===================================================== */

  if (
    requireApproval &&
    !userData?.isApproved
  ) {

    return (
      <Navigate
        to="/pending-approval"
        replace
      />
    );
  }

  /* =====================================================
     ROLE ACCESS
  ===================================================== */

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(
      userData?.role
    )
  ) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  return children;
}