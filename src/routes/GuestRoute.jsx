import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function GuestRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  // If logged in → allow page but inside DashboardLayout
  // So redirect to homepage "/"
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}