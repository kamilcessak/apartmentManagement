import { Routes, Route } from "react-router-dom";

import {
  ApartmentsScreen,
  HomeScreen,
  SettingsScreen,
  TenantsScreen,
} from "./screens";
import { Navigation } from "./components";

const App = () => {
  const routes = [
    { path: "/", element: <HomeScreen /> },
    { path: "/tenants", element: <TenantsScreen /> },
    { path: "/apartments", element: <ApartmentsScreen /> },
    { path: "/settings", element: <SettingsScreen /> },
  ];

  return (
    <div className="flex flex-1 flex-row">
      <Navigation />
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
