import axios, { AxiosResponse } from "axios";
import {
  Divider,
  ErrorView,
  LoadingView,
  RouteContent,
} from "../../components/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TenantType } from "./tenant.type.ts";
import { MdDelete, MdInfo, MdManageAccounts } from "react-icons/md";
import { Link } from "react-router-dom";
import { useMemo } from "react";

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

  const deleteTenant = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5050/tenants/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const { data, isLoading, isError, isRefetching, error, refetch } = useQuery({
    queryKey: ["tenants", "list"],
    queryFn: getTenants,
  });

  const { mutate: handleDeleteTenant, isPending: isTenantDeleting } =
    useMutation({
      mutationFn: deleteTenant,
      onSuccess: () => refetch(),
      onError: (error) => console.error(error),
    });

  const isAnythingLoading = useMemo(
    () => isLoading || isRefetching || isTenantDeleting,
    [isLoading, isTenantDeleting, isRefetching],
  );

  if (isAnythingLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error.message} onClick={refetch} />;

  return (
    <RouteContent sectionStyle={{ flexDirection: "column", gap: 16 }}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl">List of your tenants:</h1>
        <Link
          to="/tenants/add"
          className="border border-black rounded-md p-3 hover:bg-black hover:text-white transition-colors duration-300 ease-in-out"
        >
          Add new Tenant
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-4">
        {!data?.length ? (
          <div className="flex flex-1 items-center justify-center">
            <h2 className="text-3xl">List of Tenants is empty</h2>
          </div>
        ) : (
          data?.map((tenant: TenantType, i) => (
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
                    <h2>{tenant.address}</h2>
                  </div>
                </div>
                <div className="flex flex-1 gap-4 border-red-600 items-center justify-end">
                  <MdInfo className="text-blue-700 cursor-pointer" size={30} />
                  <MdManageAccounts
                    className="text-gray-800 cursor-pointer"
                    size={30}
                  />
                  <MdDelete
                    className="text-red-600 cursor-pointer"
                    size={30}
                    onClick={() => handleDeleteTenant(tenant._id)}
                  />
                </div>
              </div>
              {i < data?.length - 1 && <Divider />}
            </>
          ))
        )}
      </div>
    </RouteContent>
  );
};
