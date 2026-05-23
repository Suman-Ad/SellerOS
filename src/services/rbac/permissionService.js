import {

  PLATFORM_ROLES,

  ORGANIZATION_ROLES,

  isSuperAdmin,

} from "./roleServices";

/* =========================================================
   PERMISSIONS
========================================================= */

export const PERMISSIONS = {

  /* =====================================================
     PRODUCTS
  ===================================================== */

  PRODUCTS_VIEW:
    "products.view",

  PRODUCTS_CREATE:
    "products.create",

  PRODUCTS_EDIT:
    "products.edit",

  PRODUCTS_DELETE:
    "products.delete",

  PRODUCTS_IMPORT:
    "products.import",

  /* =====================================================
     INVENTORY
  ===================================================== */

  INVENTORY_VIEW:
    "inventory.view",

  INVENTORY_MANAGE:
    "inventory.manage",

  /* =====================================================
     ORDERS
  ===================================================== */

  ORDERS_VIEW:
    "orders.view",

  ORDERS_MANAGE:
    "orders.manage",

  ORDERS_IMPORT:
    "orders.import",

  /* =====================================================
     ANALYTICS
  ===================================================== */

  ANALYTICS_VIEW:
    "analytics.view",

  /* =====================================================
     ORGANIZATION
  ===================================================== */

  ORGANIZATION_VIEW:
    "organization.view",

  ORGANIZATION_MANAGE:
    "organization.manage",

  TEAM_VIEW:
    "team.view",

  TEAM_MANAGE:
    "team.manage",

  /* =====================================================
     FINANCE
  ===================================================== */

  BILLING_VIEW:
    "billing.view",

  BILLING_MANAGE:
    "billing.manage",

  /* =====================================================
     COMPLIANCE
  ===================================================== */

  COMPLIANCE_VIEW:
    "compliance.view",

  COMPLIANCE_REVIEW:
    "compliance.review",

  /* =====================================================
     ADMIN
  ===================================================== */

  ADMIN_DASHBOARD:
    "admin.dashboard",

  ADMIN_USERS:
    "admin.users",

  ADMIN_ANALYTICS:
    "admin.analytics",

  SECURITY_CENTER:
    "security.center",
};

/* =========================================================
   PLATFORM ROLE PERMISSIONS
========================================================= */

export const PLATFORM_ROLE_PERMISSIONS = {

  [PLATFORM_ROLES.SUPER_ADMIN]:

    Object.values(
      PERMISSIONS
    ),

  [PLATFORM_ROLES.ADMIN]: [

    PERMISSIONS.ADMIN_DASHBOARD,

    PERMISSIONS.ADMIN_USERS,

    PERMISSIONS.ADMIN_ANALYTICS,

    PERMISSIONS.COMPLIANCE_REVIEW,

    PERMISSIONS.SECURITY_CENTER,
  ],

  [PLATFORM_ROLES.COMPLIANCE_OFFICER]: [

    PERMISSIONS.COMPLIANCE_VIEW,

    PERMISSIONS.COMPLIANCE_REVIEW,
  ],

  [PLATFORM_ROLES.SUPPORT_AGENT]: [

    PERMISSIONS.ADMIN_DASHBOARD,
  ],

  [PLATFORM_ROLES.USER]: [],
};

/* =========================================================
   ORGANIZATION ROLE PERMISSIONS
========================================================= */

export const ORGANIZATION_ROLE_PERMISSIONS = {

  [ORGANIZATION_ROLES.OWNER]: [

    /* PRODUCTS */
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_IMPORT,

    /* INVENTORY */
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,

    /* ORDERS */
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ORDERS_IMPORT,

    /* ANALYTICS */
    PERMISSIONS.ANALYTICS_VIEW,

    /* TEAM */
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_MANAGE,

    /* ORG */
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_MANAGE,

    /* BILLING */
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_MANAGE,
  ],

  [ORGANIZATION_ROLES.SELLER_ADMIN]: [

    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,

    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,

    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,

    PERMISSIONS.ANALYTICS_VIEW,

    PERMISSIONS.TEAM_VIEW,

    PERMISSIONS.ORGANIZATION_VIEW,
  ],

  [ORGANIZATION_ROLES.INVENTORY_MANAGER]: [

    PERMISSIONS.PRODUCTS_VIEW,

    PERMISSIONS.INVENTORY_VIEW,

    PERMISSIONS.INVENTORY_MANAGE,
  ],

  [ORGANIZATION_ROLES.ORDER_MANAGER]: [

    PERMISSIONS.ORDERS_VIEW,

    PERMISSIONS.ORDERS_MANAGE,
  ],

  [ORGANIZATION_ROLES.FINANCE_MANAGER]: [

    PERMISSIONS.BILLING_VIEW,

    PERMISSIONS.BILLING_MANAGE,
  ],

  [ORGANIZATION_ROLES.WAREHOUSE_MANAGER]: [

    PERMISSIONS.INVENTORY_VIEW,

    PERMISSIONS.INVENTORY_MANAGE,
  ],

  [ORGANIZATION_ROLES.STAFF]: [

    PERMISSIONS.PRODUCTS_VIEW,

    PERMISSIONS.ORDERS_VIEW,

    PERMISSIONS.INVENTORY_VIEW,
  ],

  [ORGANIZATION_ROLES.VIEWER]: [

    PERMISSIONS.PRODUCTS_VIEW,
  ],
};

/* =========================================================
   GET PLATFORM PERMISSIONS
========================================================= */

export const getPlatformPermissions =
  (role) => {

    return (
      PLATFORM_ROLE_PERMISSIONS[
      role
      ] || []
    );
  };

/* =========================================================
   GET ORGANIZATION PERMISSIONS
========================================================= */

export const getOrganizationPermissions =
  (
    organizationRole
  ) => {

    return (
      ORGANIZATION_ROLE_PERMISSIONS[
      organizationRole
      ] || []
    );
  };

/* =========================================================
   BUILD USER PERMISSIONS
========================================================= */

export const buildUserPermissions =
  ({
    role,

    organizationRole,

    customPermissions = [],
  }) => {

    const platformPermissions =
      getPlatformPermissions(
        role
      );

    const organizationPermissions =
      getOrganizationPermissions(
        organizationRole
      );

    return [

      ...new Set([

        ...platformPermissions,

        ...organizationPermissions,

        ...customPermissions,
      ]),
    ];
  };

/* =========================================================
   HAS PERMISSION
========================================================= */

export const hasPermission =
  ({
    permissions = [],

    permission,
  }) => {

    return permissions.includes(
      permission
    );
  };

/* =========================================================
   HAS ANY PERMISSION
========================================================= */

export const hasAnyPermission =
  ({
    permissions = [],

    requiredPermissions = [],
  }) => {

    return requiredPermissions.some(
      (permission) =>
        permissions.includes(
          permission
        )
    );
  };

/* =========================================================
   HAS ALL PERMISSIONS
========================================================= */

export const hasAllPermissions =
  ({
    permissions = [],

    requiredPermissions = [],
  }) => {

    return requiredPermissions.every(
      (permission) =>
        permissions.includes(
          permission
        )
    );
  };

/* =========================================================
   SUPER ADMIN OVERRIDE
========================================================= */

export const canAccessPermission =
  ({
    role,

    permissions = [],

    permission,
  }) => {

    if (
      isSuperAdmin(role)
    ) {

      return true;
    }

    return permissions.includes(
      permission
    );
  };