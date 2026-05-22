import { useAuth } from "@/context/AuthContext";

import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function HomeRoute() {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Logged in → DashboardLayout
  if (userData) {
    return <DashboardLayout />;
  }

  // Logged out → PublicLayout
  return <PublicLayout />;
}