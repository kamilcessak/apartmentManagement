import {
  TenantsScreen,
  NewTenantScreen,
  TenantDetailsScreen,
} from "@features/tenants/screens";
import { ProtectedRoute } from "@components/routes/ProtectedRoute";

export const getTenantsRoutes = (isLoggedIn: boolean) => [
  {
    path: "/tenants",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <TenantsScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tenants/add",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <NewTenantScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tenant/:id",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <TenantDetailsScreen />
      </ProtectedRoute>
    ),
  },
];
