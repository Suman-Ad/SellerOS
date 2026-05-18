import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "@/pages/Dashboard/Dashboard";

import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminAnalytics from "@/pages/Admin/AdminAnalytics";

import RoleRoute from "./RoleRoute";
import SellerApprovals from "@/pages/Admin/SellerApprovals";
import AdminLayout from "@/layouts/AdminLayout";

import SellerLayout from "@/layouts/SellerLayout";
import SellerDashboard from "@/pages/Seller/SellerDashboard";
import ProductList from "@/pages/Seller/Products/ProductList";
import AddProduct from "@/pages/Seller/Products/AddProduct";
import EditProduct from "@/pages/Seller/Products/EditProduct";
import Inventory from "@/pages/Seller/Inventory/Inventory";
import Orders from "@/pages/Seller/Orders/Orders";
import OrderImport from "@/pages/Seller/Orders/Orderimport";
import OrderDetails from "@/pages/Seller/Orders/OrderDetails";

export default function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            <ProtectedRoute>

              <Dashboard />
            </ProtectedRoute>
          }
        />

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

        </Route>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

      </Routes>

    </BrowserRouter>
  );
}