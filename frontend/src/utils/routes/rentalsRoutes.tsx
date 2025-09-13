import { ProtectedRoute } from "@components/routes/ProtectedRoute";
import {
  NewRentalScreen,
  RentalDetailsScreen,
  RentalsScreen,
} from "@features/rentals/screens";

export const getRentalsRoutes = (isLoggedIn: boolean) => [
  {
    path: "/rentals",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <RentalsScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/rentals/new",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <NewRentalScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/rental/:id",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <RentalDetailsScreen />
      </ProtectedRoute>
    ),
  },
];
