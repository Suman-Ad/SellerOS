import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function HomeRoute() {

  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  return currentUser
    ? <DashboardLayout />
    : <PublicLayout />;
}