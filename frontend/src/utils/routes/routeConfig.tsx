import { getApartmentsRoutes } from "./apartmentsRoutes";
import { getTenantsRoutes } from "./tenantsRoutes";
import { getRentalsRoutes } from "./rentalsRoutes";
import {
  LoginScreen,
  RegisterScreen,
  RegisterSuccessful,
  UnauthenticatedScreen,
  VerifyEmailScreen,
} from "../../screens/auth";
import { HomeScreen, SettingsScreen, WelcomeScreen } from "../../screens";

import { ProtectedRoute } from "@components/routes/ProtectedRoute";

export const getRoutes = (isLoggedIn: boolean) => [
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
  ...getTenantsRoutes(isLoggedIn),
  ...getApartmentsRoutes(isLoggedIn),
  ...getRentalsRoutes(isLoggedIn),
];
