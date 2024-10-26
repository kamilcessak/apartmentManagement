import axios, { AxiosResponse } from "axios";
import { ErrorView, LoadingView, RouteContent } from "../../components/common";
import { useQuery } from "@tanstack/react-query";
import { TenantType } from "./tenant.type.ts";

export const TenantsScreen = () => {
  const getTenants = async () => {
    try {
      const response: AxiosResponse<TenantType[]> = await axios.get(
        "http://localhost:5050/tenants",
      );
      console.log({ response });
      return response.data || [];
    } catch (error) {
      console.error(error);
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["tenants", "list"],
    queryFn: getTenants,
  });

  console.log({ data, error });
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error.message} onClick={refetch} />;

  return (
    <RouteContent>
      <h1>List of your tenants:</h1>
      <div>
        {data?.map((tenant: TenantType) => (
          <div key={tenant._id}>
            <h2>{tenant.firstName}</h2>
          </div>
        ))}
      </div>
    </RouteContent>
  );
};
