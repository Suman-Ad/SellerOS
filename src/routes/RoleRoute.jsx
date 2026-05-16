import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({
  children,
  allowedRoles = [],
}) {

  const { userData, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Not logged in
  if (!userData) {
    return <Navigate to="/login" />;
  }

  // Role not allowed
  if (
    !allowedRoles.includes(userData.role)
  ) {
    return <Navigate to="/" />;
  }

  return children;
}