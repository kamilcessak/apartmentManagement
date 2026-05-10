import { MyApartmentScreen, MyInvoicesScreen } from "@features/tenant-portal";
import { ProtectedRoute } from "@components/routes/ProtectedRoute";

export const getTenantPortalRoutes = (isLoggedIn: boolean) => [
  {
    path: "/my-apartment",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <MyApartmentScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-invoices",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <MyInvoicesScreen />
      </ProtectedRoute>
    ),
  },
];
