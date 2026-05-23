/* =========================================================
   PLATFORM ROLES
========================================================= */

export const PLATFORM_ROLES = {

  SUPER_ADMIN:
    "super_admin",

  ADMIN:
    "admin",

  SUPPORT_AGENT:
    "support_agent",

  COMPLIANCE_OFFICER:
    "compliance_officer",

  USER:
    "user",
};

/* =========================================================
   ORGANIZATION ROLES
========================================================= */

export const ORGANIZATION_ROLES = {

  OWNER:
    "owner",

  SELLER_ADMIN:
    "seller_admin",

  INVENTORY_MANAGER:
    "inventory_manager",

  ORDER_MANAGER:
    "order_manager",

  FINANCE_MANAGER:
    "finance_manager",

  WAREHOUSE_MANAGER:
    "warehouse_manager",

  STAFF:
    "staff",

  VIEWER:
    "viewer",
};

/* =========================================================
   PLATFORM ROLE HIERARCHY
========================================================= */

export const PLATFORM_ROLE_HIERARCHY = {

  super_admin: 100,

  admin: 90,

  compliance_officer: 70,

  support_agent: 60,

  user: 1,
};

/* =========================================================
   ORGANIZATION ROLE HIERARCHY
========================================================= */

export const ORGANIZATION_ROLE_HIERARCHY = {

  owner: 100,

  seller_admin: 90,

  finance_manager: 70,

  inventory_manager: 60,

  order_manager: 55,

  warehouse_manager: 50,

  staff: 10,

  viewer: 1,
};

/* =========================================================
   PLATFORM ROLE HELPERS
========================================================= */

export const isSuperAdmin =
  (role) => {

    return (
      role ===
      PLATFORM_ROLES.SUPER_ADMIN
    );
  };

export const isAdmin =
  (role) => {

    return [
      PLATFORM_ROLES.ADMIN,
      PLATFORM_ROLES.SUPER_ADMIN,
    ].includes(role);
  };

export const isSupportAgent =
  (role) => {

    return (
      role ===
      PLATFORM_ROLES.SUPPORT_AGENT
    );
  };

export const isComplianceOfficer =
  (role) => {

    return (
      role ===
      PLATFORM_ROLES.COMPLIANCE_OFFICER
    );
  };

export const isPlatformUser =
  (role) => {

    return (
      role ===
      PLATFORM_ROLES.USER
    );
  };

/* =========================================================
   ORGANIZATION ROLE HELPERS
========================================================= */

export const isOrganizationOwner =
  (organizationRole) => {

    return (
      organizationRole ===
      ORGANIZATION_ROLES.OWNER
    );
  };

export const isSellerAdmin =
  (organizationRole) => {

    return [
      ORGANIZATION_ROLES.OWNER,
      ORGANIZATION_ROLES.SELLER_ADMIN,
    ].includes(
      organizationRole
    );
  };

export const canManageInventory =
  (organizationRole) => {

    return [
      ORGANIZATION_ROLES.OWNER,

      ORGANIZATION_ROLES.SELLER_ADMIN,

      ORGANIZATION_ROLES.INVENTORY_MANAGER,
    ].includes(
      organizationRole
    );
  };

export const canManageOrders =
  (organizationRole) => {

    return [
      ORGANIZATION_ROLES.OWNER,

      ORGANIZATION_ROLES.SELLER_ADMIN,

      ORGANIZATION_ROLES.ORDER_MANAGER,
    ].includes(
      organizationRole
    );
  };

export const canManageFinance =
  (organizationRole) => {

    return [
      ORGANIZATION_ROLES.OWNER,

      ORGANIZATION_ROLES.SELLER_ADMIN,

      ORGANIZATION_ROLES.FINANCE_MANAGER,
    ].includes(
      organizationRole
    );
  };

export const canManageWarehouse =
  (organizationRole) => {

    return [
      ORGANIZATION_ROLES.OWNER,

      ORGANIZATION_ROLES.SELLER_ADMIN,

      ORGANIZATION_ROLES.WAREHOUSE_MANAGER,
    ].includes(
      organizationRole
    );
  };

export const canManageTeam =
  (organizationRole) => {

    return [
      ORGANIZATION_ROLES.OWNER,

      ORGANIZATION_ROLES.SELLER_ADMIN,
    ].includes(
      organizationRole
    );
  };

/* =========================================================
   ROLE LEVEL CHECK
========================================================= */

export const hasMinimumPlatformRole =
  ({
    currentRole,

    requiredRole,
  }) => {

    const currentLevel =
      PLATFORM_ROLE_HIERARCHY[
      currentRole
      ] || 0;

    const requiredLevel =
      PLATFORM_ROLE_HIERARCHY[
      requiredRole
      ] || 0;

    return (
      currentLevel >=
      requiredLevel
    );
  };

export const hasMinimumOrganizationRole =
  ({
    currentRole,

    requiredRole,
  }) => {

    const currentLevel =
      ORGANIZATION_ROLE_HIERARCHY[
      currentRole
      ] || 0;

    const requiredLevel =
      ORGANIZATION_ROLE_HIERARCHY[
      requiredRole
      ] || 0;

    return (
      currentLevel >=
      requiredLevel
    );
  };

/* =========================================================
   GENERIC ROLE CHECKERS
========================================================= */

export const hasPlatformRole =
  ({
    currentRole,

    allowedRoles = [],
  }) => {

    return allowedRoles.includes(
      currentRole
    );
  };

export const hasOrganizationRole =
  ({
    currentRole,

    allowedRoles = [],
  }) => {

    return allowedRoles.includes(
      currentRole
    );
  };

/* =========================================================
   RBAC FLAGS
========================================================= */

export const buildRBACFlags =
  ({
    role,

    organizationRole,
  }) => {

    return {

      /* =====================
         PLATFORM
      ===================== */

      isSuperAdmin:
        isSuperAdmin(role),

      isAdmin:
        isAdmin(role),

      isSupportAgent:
        isSupportAgent(role),

      isComplianceOfficer:
        isComplianceOfficer(role),

      /* =====================
         ORGANIZATION
      ===================== */

      isOrganizationOwner:
        isOrganizationOwner(
          organizationRole
        ),

      isSellerAdmin:
        isSellerAdmin(
          organizationRole
        ),

      canManageInventory:
        canManageInventory(
          organizationRole
        ),

      canManageOrders:
        canManageOrders(
          organizationRole
        ),

      canManageFinance:
        canManageFinance(
          organizationRole
        ),

      canManageWarehouse:
        canManageWarehouse(
          organizationRole
        ),

      canManageTeam:
        canManageTeam(
          organizationRole
        ),
    };
  };