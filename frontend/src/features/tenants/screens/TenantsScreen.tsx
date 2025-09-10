import { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Button } from "@mui/material";
import { MdAdd } from "react-icons/md";

import { TenantType } from "../types/tenant.type.ts";
import { TenantItem } from "../components/TenantItem.tsx";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api.ts";
import { EmptyView } from "@components/common";

export const TenantsScreen = () => {
  const navigate = useNavigate();
  const handleAddNewTenant = () => navigate("/tenants/add");

  const getTenants = async () => {
    try {
      const response: AxiosResponse<TenantType[]> = await api.get("/tenants");
      return response.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, isLoading, isError, isRefetching, error, refetch } = useQuery({
    queryKey: ["tenants", "list"],
    queryFn: getTenants,
  });

  const isAnythingLoading = useMemo(
    () => isLoading || isRefetching,
    [isLoading, isRefetching]
  );

  if (isAnythingLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error.message} onClick={refetch} />;

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <header className="flex flex-1 justify-between items-center p-8 bg-white border-b-2 border-gray-200">
        <h1 className="text-3xl font-semibold">List of your tenants:</h1>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<MdAdd />}
          onClick={handleAddNewTenant}
        >
          {`Add new Tenant`}
        </Button>
      </header>
      <main className="flex h-full flex-col gap-4 bg-white p-8 overflow-y-scroll scrollbar-hide">
        {!data?.length ? (
          <EmptyView message="List of Tenants is empty" />
        ) : (
          data?.map((tenant: TenantType, i) => (
            <TenantItem key={`tenant-item-${tenant._id}-${i}`} user={tenant} />
          ))
        )}
      </main>
    </RouteContent>
  );
};
