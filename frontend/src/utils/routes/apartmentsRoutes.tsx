import { ProtectedRoute } from "@components/routes/ProtectedRoute";
import {
  ApartmentsScreen,
  NewApartmentScreen,
  ApartmentDetailsScreen,
} from "@features/apartments/screens";

export const getApartmentsRoutes = (isLoggedIn: boolean) => [
  {
    path: "/apartments",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <ApartmentsScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apartments/new",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <NewApartmentScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apartment/:id",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <ApartmentDetailsScreen />
      </ProtectedRoute>
    ),
  },
];
