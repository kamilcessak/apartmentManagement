import axios from "axios";
import { RouteContent } from "../components/common";
import { useQuery } from "@tanstack/react-query";

export const TenantsScreen = () => {
  const getTenants = async () => {
    try {
      const response = await axios.get("http://localhost:5050/tenants");
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const { data } = useQuery({
    queryFn: getTenants,
    queryKey: ["tenants", "list"],
  });

  console.log({ data });

  return (
    <RouteContent>
      <h1>List of your tenants:</h1>
      <div>{data?.map((tenant) => <div key={tenant.id}></div>)}</div>
    </RouteContent>
  );
};
