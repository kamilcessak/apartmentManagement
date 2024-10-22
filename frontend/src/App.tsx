import { Routes, Route } from "react-router-dom";

import { HomeScreen, TenantsScreen } from "./screens";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/tenants" element={<TenantsScreen />} />
      </Routes>
    </div>
  );
}

export default App;
