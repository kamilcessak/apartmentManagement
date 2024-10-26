import { Routes, Route } from "react-router-dom";

import { HomeScreen, TenantsScreen } from "./screens";
import { Navigation } from "./components";

function App() {
  return (
    <div className="flex flex-row">
      <Navigation />
      <div>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/tenants" element={<TenantsScreen />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
