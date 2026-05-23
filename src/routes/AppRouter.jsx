import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "@/pages/Dashboard/Dashboard";

import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

import ProtectedRoute from "./ProtectedRoute";
import PermissionRoute from "./PermissionRoute";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminAnalytics from "@/pages/Admin/AdminAnalytics";

import RoleRoute from "./RoleRoute";
import SellerEncyclopedia from "@/pages/Admin/SellerEncyclopedia";
import AdminLayout from "@/layouts/AdminLayout";
import HomeRoute from "./HomeRoute";
import SubscriptionRoute from "./SubscriptionRoute";
import UpgradePlan
  from "@/pages/Subscription/UpgradePlan";
import Checkout
  from "@/pages/Subscription/Checkout";
import BillingHistory
  from "@/pages/Subscription/BillingHistory";

import SellerLayout from "@/layouts/SellerLayout";
import SellerDashboard from "@/pages/Seller/SellerDashboard";
import ProductList from "@/pages/Seller/Products/ProductList";
import AddProduct from "@/pages/Seller/Products/AddProduct";
import EditProduct from "@/pages/Seller/Products/EditProduct";
import Inventory from "@/pages/Seller/Inventory/Inventory";
import Orders from "@/pages/Seller/Orders/Orders";
import OrderImport from "@/pages/Seller/Orders/Orderimport";
import OrderDetails from "@/pages/Seller/Orders/OrderDetails";
import ProductImport from "@/pages/Seller/Products/ProductImport";
import InternalProductImport from "@/pages/Seller/Products/InternalProductImport";
import ManifestImport from "@/pages/Seller/Orders/ManifestImport";
import ContactUs from "@/pages/Auth/ContactUs";
import SellerAnalytics from "@/pages/Seller/Analytics";
import AdminSubscriptions from "@/pages/Admin/AdminSubscriptions";
import UserSubscriptionManager from "@/pages/Admin/UserSubscriptionManager";
import UserProfile
  from "@/pages/Profile/UserProfile";
import AdminAuditCenter
  from "@/pages/Admin/AdminAuditCenter";

import ThreatDetectionCenter
  from "@/pages/Security/ThreatDetectionCenter";

import SecurityCenter from "@/pages/Security/SecurityCenter";

import AdminContactMessages from "@/pages/Admin/AdminContactMessages";

import CompleteProfile
  from "@/pages/Auth/CompleteProfile";

import OrganizationSetup
  from "@/pages/Auth/OrganizationSetup";

import ComplianceUpload
  from "@/pages/Auth/ComplianceUpload";

import PendingApproval
  from "@/pages/Auth/PendingApproval";

import AccountRestricted
  from "@/pages/Auth/AccountRestricted";

import SellerGovernanceCenter from "@/pages/Admin/SellerGovernanceCenter";

import TeamManagement
  from "@/pages/Organization/TeamManagement";

export default function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
      PUBLIC ROUTES
  ========================== */}

        <Route
          path="/"
          element={<HomeRoute />}
        >
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="contact-us"
            element={<ContactUs />}
          />

          <Route
            path="login"
            element={<Login />}
          />

          <Route
            path="register"
            element={<Register />}
          />

          <Route
            path="/upgrade-plan"
            element={
              // <ProtectedRoute>
              <UpgradePlan />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing-history"
            element={
              <ProtectedRoute>
                <BillingHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/security-center"
            element={
              <ProtectedRoute>
                <SecurityCenter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organization-setup"
            element={
              <ProtectedRoute
                requireProfile
              >
                <OrganizationSetup />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compliance-upload"
            element={
              <ProtectedRoute
                requireProfile
                requireOrganization
              >
                <ComplianceUpload />
              </ProtectedRoute>
            }
          />


          <Route
            path="/pending-approval"
            element={
              <ProtectedRoute
                requireProfile
                requireOrganization
                requireCompliance
              >
                <PendingApproval />
              </ProtectedRoute>
            }
          />

        </Route>



        <Route
          path="/account-restricted"
          element={
            <ProtectedRoute>
              <AccountRestricted />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedPlatformRoles={[
                  "admin",
                  "super_admin",
                ]}
              >
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >

          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="seller/:sellerId"
            element={<SellerEncyclopedia />}
          />

          <Route
            path="analytics"
            element={<AdminAnalytics />}
          />

          <Route
            path="subscriptions"
            element={
              <RoleRoute
                allowedPlatformRoles={[
                  "super_admin",
                ]}
              >
                <AdminSubscriptions />
              </RoleRoute>
            }
          />

          <Route
            path="user-subscriptions"
            element={
              <RoleRoute
                allowedPlatformRoles={[
                  "super_admin",
                ]}
              >
                <UserSubscriptionManager />
              </RoleRoute>
            }
          />

          <Route
            path="audit-center"
            element={<AdminAuditCenter />}
          />

          <Route
            path="threat-center"
            element={

              <ThreatDetectionCenter />
            }
          />

          <Route
            path="profile-settings"
            element={<UserProfile />}
          />

          <Route
            path="contact-messages"
            element={<AdminContactMessages />}
          />

          <Route
            path="seller-governance-center"
            element={<SellerGovernanceCenter />}
          />

        </Route>

        <Route
          path="/seller"
          element={
            <ProtectedRoute
              requireProfile
              requireOrganization
              requireCompliance
              requireApproval
            >
              <RoleRoute
                // // allowedPlatformRoles={[
                // //   "admin",
                // //   "super_admin",
                // //   "compliance_officer",
                // //   "support_agent",
                // // ]}
                // allowedOrganizationRoles={[
                //   "owner",
                //   "seller_admin",
                // ]}
                minimumOrganizationRole="viewer"
              >
                <SellerLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >

          <Route
            index
            element={<SellerDashboard />}
          />

          <Route
            path="analytics"
            element={
              <SubscriptionRoute
                requiredPlans={[
                  "growth",
                  "enterprise",
                  "free",
                ]}
              // feature="AI Insights"
              >
                <SellerAnalytics />
              </SubscriptionRoute>
            }
          />

          <Route
            path="products"
            element={<ProductList />}
          />

          <Route
            path="products/add"
            element={<AddProduct />}
          />


          <Route
            path="products/edit/:productId"
            element={<EditProduct />}
          />

          <Route
            path="products/import-marketplace"
            element={<ProductImport />}
          />

          <Route
            path="products/import-internal"
            element={<InternalProductImport />}
          />

          <Route
            path="inventory"
            element={
              <PermissionRoute
                permission="inventory.manage"
              >
                <Inventory />
              </PermissionRoute>}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="orders/import"
            element={<OrderImport />}
          />

          <Route
            path="orders/:orderId"
            element={<OrderDetails />}
          />

          <Route
            path="orders/manifest-import"
            element={<ManifestImport />}
          />
          <Route
            path="profile-settings"
            element={<UserProfile />}
          />

          <Route
          path="organization-team"
          element={
            <ProtectedRoute
              requireProfile
              requireOrganization
              requireCompliance
              requireApproval
            >
              <RoleRoute
                allowedOrganizationRoles={[
                  "owner",
                  "seller_admin",
                ]}
              >
                <TeamManagement />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}