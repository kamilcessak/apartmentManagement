import { Routes, Route } from "react-router-dom";

import { HomeScreen, TenantsScreen } from "./screens";
import { Navigation } from "./components";

function App() {
  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/tenants" element={<TenantsScreen />} />
      </Routes>
    </div>
  );
}

export default App;
