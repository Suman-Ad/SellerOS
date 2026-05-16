import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import AppRouter from "@/routes/AppRouter";
import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <AuthProvider>
      <AppRouter />
      <Toaster richColors />
    </AuthProvider>

  </React.StrictMode>
);