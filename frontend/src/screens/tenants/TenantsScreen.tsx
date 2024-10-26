import axios, { AxiosResponse } from "axios";
import {
  Divider,
  ErrorView,
  LoadingView,
  RouteContent,
} from "../../components/common";
import { useQuery } from "@tanstack/react-query";
import { TenantType } from "./tenant.type.ts";
import { MdDelete, MdInfo, MdManageAccounts } from "react-icons/md";

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

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error.message} onClick={refetch} />;

  console.log({ data });

  return (
    <RouteContent sectionStyle={{ flexDirection: "column", gap: 16 }}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl">List of your tenants:</h1>
        <button className="border border-black rounded-md p-3 hover:bg-black hover:text-white transition-colors duration-300 ease-in-out">
          Add new Tenant
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {data?.map((tenant: TenantType, i) => (
          <>
            <div
              className="flex flex-row items-center gap-4"
              key={`tenant-${tenant._id}-${i}`}
            >
              <div className="h-3 w-3 bg-black rounded-full" />
              <div className="flex flex-1 gap-1 flex-col border-blue-600">
                <div>
                  <h2>{`${tenant.firstName} ${tenant.lastName}`}</h2>
                </div>
                <div>
                  <h2>{tenant.apartmentId}</h2>
                </div>
              </div>
              <div className="flex flex-1 gap-4 border-red-600 items-center justify-end">
                <MdInfo className="text-blue-700" size={30} />
                <MdManageAccounts className="text-gray-800" size={30} />
                <MdDelete className="text-red-600" size={30} />
              </div>
            </div>
            {i < data?.length - 1 && <Divider />}
          </>
        ))}
      </div>
    </RouteContent>
  );
};
