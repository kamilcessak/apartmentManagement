import { getApartmentsRoutes } from "./apartmentsRoutes";
import { getTenantsRoutes } from "./tenantsRoutes";
import { getRentalsRoutes } from "./rentalsRoutes";
import { getInvoicesRoutes } from "./invoicesRoutes";
import { getTenantPortalRoutes } from "./tenantPortalRoutes";
import {
  LoginScreen,
  RegisterScreen,
  RegisterSuccessful,
  UnauthenticatedScreen,
  VerifyEmailScreen,
} from "../../screens/auth";
import { HomeScreen, SettingsScreen, WelcomeScreen } from "../../screens";

import { ProtectedRoute } from "@components/routes/ProtectedRoute";
import { UserRole } from "../../types";

export const getRoutes = (isLoggedIn: boolean, role?: UserRole) => {
  const baseRoutes = [
    { path: "/", element: <WelcomeScreen /> },
    { path: "/login", element: <LoginScreen /> },
    { path: "/register", element: <RegisterScreen /> },
    { path: "/verify-email", element: <VerifyEmailScreen /> },
    { path: "/registerSuccess", element: <RegisterSuccessful /> },
    { path: "/404", element: <UnauthenticatedScreen /> },
    {
      path: "/home",
      element: (
        <ProtectedRoute isAuthenticated={isLoggedIn}>
          <HomeScreen />
        </ProtectedRoute>
      ),
    },
    {
      path: "/settings",
      element: (
        <ProtectedRoute isAuthenticated={isLoggedIn}>
          <SettingsScreen />
        </ProtectedRoute>
      ),
    },
  ];

  if (role === "Tenant") {
    return [...baseRoutes, ...getTenantPortalRoutes(isLoggedIn)];
  }

  // Landlord (or unknown role — fall back to Landlord UI) sees full management
  return [
    ...baseRoutes,
    ...getTenantsRoutes(isLoggedIn),
    ...getApartmentsRoutes(isLoggedIn),
    ...getRentalsRoutes(isLoggedIn),
    ...getInvoicesRoutes(isLoggedIn),
  ];
};
