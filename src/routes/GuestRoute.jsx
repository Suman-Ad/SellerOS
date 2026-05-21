import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function GuestRoute({ children }) {

  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (currentUser) {
    return <Navigate to="/app" replace />;
  }

  return children;
}