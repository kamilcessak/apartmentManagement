import { useEffect } from "react";
import axios from "axios";
import { RouteContent } from "../components/common";

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
    <RouteContent>
      <h1>List of your tenants:</h1>
    </RouteContent>
  );
};
