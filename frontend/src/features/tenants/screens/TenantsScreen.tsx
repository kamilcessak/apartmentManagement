import { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";

import { TenantType } from "../types/tenant.type";
import { TenantItem } from "../components/TenantItem";

export const TenantsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

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

  const filteredTenants = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((tenant) => {
      const haystack = [
        tenant.firstName,
        tenant.lastName,
        tenant.email,
        tenant.phoneNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [data, search]);

  if (isAnythingLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error.message} onClick={refetch} />;

  const hasAnyTenants = (data?.length ?? 0) > 0;
  const hasResults = filteredTenants.length > 0;

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <div className="flex h-full flex-col overflow-hidden bg-slate-50 p-6 lg:p-8">
        <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t("tenants.title")}
            </h1>
            <p className="text-sm text-slate-500">{t("tenants.subtitle")}</p>
          </div>
          <Button
            variant="default"
            onClick={handleAddNewTenant}
            className="self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            {t("tenants.addTenant")}
          </Button>
        </header>

        <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("tenants.searchPlaceholder")}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("tenants.columns.tenant")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("tenants.columns.contact")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("tenants.columns.status")}
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("tenants.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasResults ? (
                  filteredTenants.map((tenant) => (
                    <TenantItem
                      key={`tenant-row-${tenant._id}`}
                      tenant={tenant}
                    />
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center text-sm text-slate-500"
                    >
                      {hasAnyTenants
                        ? t("tenants.emptySearch")
                        : t("tenants.empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </RouteContent>
  );
};
