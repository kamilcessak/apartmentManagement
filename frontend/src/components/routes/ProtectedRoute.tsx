import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
}) => (!isAuthenticated ? <Navigate to="/404" replace /> : children);
