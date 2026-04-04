import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../components/Layout/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import RoleRoute from "../components/RoleRoute/RoleRoute";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import AdminAnalyticsPage from "../pages/AdminAnalytics/AdminAnalyticsPage";
import AdminCategoriesPage from "../pages/AdminCategories/AdminCategoriesPage";
import AdminCustomersPage from "../pages/AdminCustomers/AdminCustomersPage";
import AdminOrdersPage from "../pages/AdminOrders/AdminOrdersPage";
import AdminProductsPage from "../pages/AdminProducts/AdminProductsPage";
import AdminSettingsPage from "../pages/AdminSettings/AdminSettingsPage";
import AdminVendorListPage from "../pages/AdminVendors/AdminVendorListPage";
import AdminVendorApprovalPage from "../pages/AdminVendors/AdminVendorApprovalPage";
import CartPage from "../pages/CartPage/CartPage";
import Checkout from "../pages/Checkout/Checkout";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import OrdersPage from "../pages/Orders/OrdersPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import ProductListing from "../pages/ProductListing/ProductListing";
import KidsCollectionPage from "../pages/KidsCollection/KidsCollectionPage";
import Register from "../pages/Register/Register";
import TryOnPage from "../pages/TryOnPage/TryOnPage";
import VirtualTrialRoomPage from "../pages/VirtualTrialRoomPage/VirtualTrialRoomPage";
import PoseVirtualTryOnPage from "../pages/PoseVirtualTryOnPage/PoseVirtualTryOnPage";
import VendorDashboard from "../pages/VendorDashboard/VendorDashboard";
import VendorOrdersPage from "../pages/VendorOrders/VendorOrdersPage";
import VendorProductsPage from "../pages/VendorProducts/VendorProductsPage";

const PublicPage = ({ children }) => <AppLayout>{children}</AppLayout>;

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <PublicPage>
          <Home />
        </PublicPage>
      }
    />
    <Route
      path="/products"
      element={
        <PublicPage>
          <ProductListing />
        </PublicPage>
      }
    />
    <Route
      path="/kids"
      element={
        <PublicPage>
          <KidsCollectionPage />
        </PublicPage>
      }
    />
    <Route
      path="/products/:productId"
      element={
        <PublicPage>
          <ProductDetails />
        </PublicPage>
      }
    />
    <Route
      path="/cart"
      element={
        <PublicPage>
          <CartPage />
        </PublicPage>
      }
    />
    <Route
      path="/login"
      element={
        <PublicPage>
          <Login />
        </PublicPage>
      }
    />
    <Route
      path="/register"
      element={
        <PublicPage>
          <Register />
        </PublicPage>
      }
    />
    <Route
      path="/try-on/:productId"
      element={
        <PublicPage>
          <TryOnPage />
        </PublicPage>
      }
    />
    <Route
      path="/virtual-trial-room"
      element={
        <PublicPage>
          <VirtualTrialRoomPage />
        </PublicPage>
      }
    />
    <Route
      path="/pose-virtual-try-on"
      element={
        <PublicPage>
          <PoseVirtualTryOnPage />
        </PublicPage>
      }
    />

    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <PublicPage>
            <ProfilePage />
          </PublicPage>
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["customer"]}>
            <PublicPage>
              <Checkout />
            </PublicPage>
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["customer"]}>
            <PublicPage>
              <OrdersPage />
            </PublicPage>
          </RoleRoute>
        </ProtectedRoute>
      }
    />

    <Route
      path="/vendor/dashboard"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["vendor"]}>
            <VendorDashboard />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/vendor/products"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["vendor"]}>
            <Navigate to="/vendor/products/list" replace />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/vendor/products/add"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["vendor"]}>
            <VendorProductsPage mode="add" />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/vendor/products/list"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["vendor"]}>
            <VendorProductsPage mode="list" />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/vendor/orders"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["vendor"]}>
            <VendorOrdersPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminDashboard />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/orders"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminOrdersPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/vendors/list"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminVendorListPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/vendors"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminVendorApprovalPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/categories"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminCategoriesPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/customers"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminCustomersPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/analytics"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminAnalyticsPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/settings"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminSettingsPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/products"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <Navigate to="/admin/products/list" replace />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/products/add"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminProductsPage mode="add" />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/products/list"
      element={
        <ProtectedRoute>
          <RoleRoute roles={["admin"]}>
            <AdminProductsPage mode="list" />
          </RoleRoute>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
