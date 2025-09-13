import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { Navigation } from "./components";

import { isAuthenticated } from "./utils";
import { useState, useEffect } from "react";
import { getRoutes } from "@utils/routes";

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

  const routes = getRoutes(isLoggedIn);

  console.log({ routes });

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
