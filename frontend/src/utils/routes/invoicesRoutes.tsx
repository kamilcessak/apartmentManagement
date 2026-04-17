import { ProtectedRoute } from "@components/routes/ProtectedRoute";
import {
  InvoicesScreen,
  NewInvoiceScreen,
  EditInvoiceScreen,
  InvoiceDetailsScreen,
} from "@features/invoices/screens";

export const getInvoicesRoutes = (isLoggedIn: boolean) => [
  {
    path: "/invoices",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <InvoicesScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoices/new",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <NewInvoiceScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoice/:id",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <InvoiceDetailsScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoice/:id/edit",
    element: (
      <ProtectedRoute isAuthenticated={isLoggedIn}>
        <EditInvoiceScreen />
      </ProtectedRoute>
    ),
  },
];
