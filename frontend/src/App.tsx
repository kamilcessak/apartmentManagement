import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import {
  ApartmentsScreen,
  HomeScreen,
  SettingsScreen,
  WelcomeScreen,
} from "./screens";
import { AddTenant, TenantsScreen } from "./screens/tenants";
import { Navigation } from "./components";
import {
  LoginScreen,
  RegisterScreen,
  RegisterSuccessful,
  UnauthenticatedScreen,
  VerifyEmailScreen,
} from "./screens/auth";
import { isAuthenticated } from "./utils";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    location?.state?.loggedIn || isAuthenticated()
  );

  useEffect(() => {
    const isLogged = isAuthenticated();
    setIsLoggedIn((prev: boolean) => {
      if (!prev && isLogged) {
        navigate("/home", { replace: true });
      }
      return isAuthenticated();
    });
  }, [location]);

  const routes = [
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
          <AddTenant />
        </ProtectedRoute>
      ),
    },
    {
      path: "/apartments",
      element: (
        <ProtectedRoute isAuthenticated={isLoggedIn}>
          <ApartmentsScreen />
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

  return (
    <div className="flex flex-1 flex-row">
      {isLoggedIn && <Navigation />}
      <div className="flex flex-1">
        <Routes>
          {routes.map(({ path, element }, i) => (
            <Route key={`route-${path}-${i}`} path={path} element={element} />
          ))}
        </Routes>
      </div>
    </div>
  );
};

export default App;
