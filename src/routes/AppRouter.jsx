import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "@/pages/Dashboard/Dashboard";

import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminAnalytics from "@/pages/Admin/AdminAnalytics";

import RoleRoute from "./RoleRoute";
import SellerApprovals from "@/pages/Admin/SellerApprovals";
import AdminLayout from "@/layouts/AdminLayout";
import HomeRoute from "./HomeRoute";

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
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[
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
            path="sellers"
            element={<SellerApprovals />}
          />

          <Route
            path="analytics"
            element={<AdminAnalytics />}
          />

        </Route>

        <Route
          path="/seller"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[
                  "seller",
                  "admin",
                  "super_admin"
                ]}
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
            element={<SellerAnalytics />}
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
            element={<Inventory />}
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
            path="/seller/orders/manifest-import"
            element={<ManifestImport />}
          />

        </Route>



      </Routes>

    </BrowserRouter>
  );
}