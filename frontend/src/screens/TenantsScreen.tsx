import { useEffect } from "react";
import axios from "axios";

export const TenantsScreen = () => {
  const getTenants = async () => {
    try {
      const response = await axios.get("http://localhost:5050/tenants");
      console.log({ response });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void getTenants();
  }, []);

  return (
    <div>
      <h1>Tenants screen</h1>
    </div>
  );
};
