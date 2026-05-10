import { FC } from "react";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import api from "@services/api";
import { getApartmentShortLabel } from "@utils/apartment";

import { RentalType } from "../types/rental.types";
import { RentalItemSkeleton } from "./RentalItemSkeleton";

type Props = {
  rental: RentalType;
  searchQuery?: string;
};

export const RentalItem: FC<Props> = ({ rental, searchQuery = "" }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleGetApartmentData = async () => {
    try {
      const result = await api.get(`/apartment/${rental.apartmentID}`);
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleGetTenantData = async () => {
    try {
      const result = await api.get(`/tenant/${rental.tenantID}`);
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data: apartmentData, isLoading: isApartmentDataLoading } = useQuery({
    queryKey: ["apartment", `${rental.apartmentID}`, "DETAILS"],
    queryFn: handleGetApartmentData,
  });

  const { data: tenantData, isLoading: isTenantDataLoading } = useQuery({
    queryKey: ["tenant", `${rental.tenantID}`, "DETAILS"],
    queryFn: handleGetTenantData,
  });

  const { mutate: deleteRental, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => api.delete(`/rental/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals", "list"] });
      toast(t("rentals.deleteSuccess"), { type: "success" });
    },
    onError: () => {
      toast(t("rentals.deleteError"), { type: "error" });
    },
  });

  const goToDetails = () => navigate(`/rental/${rental._id}`);

  const isLoading = isApartmentDataLoading || isTenantDataLoading;

  if (isLoading) {
    return <RentalItemSkeleton />;
  }

  const unassignedLabel = t("rentals.unassigned");
  const addressLabel =
    apartmentData?.street && apartmentData?.buildingNumber
      ? getApartmentShortLabel(apartmentData)
      : unassignedLabel;
  const tenantLabel = tenantData
    ? `${tenantData.firstName ?? ""} ${tenantData.lastName ?? ""}`.trim() ||
      unassignedLabel
    : unassignedLabel;

  if (searchQuery) {
    const haystack = `${addressLabel} ${tenantLabel}`.toLowerCase();
    if (!haystack.includes(searchQuery)) return null;
  }

  return (
    <TableRow className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <TableCell className="py-3 pl-6 text-sm font-medium text-slate-900">
        {addressLabel}
      </TableCell>

      <TableCell className="py-3 text-sm text-slate-700">
        {tenantLabel}
      </TableCell>

      <TableCell className="py-3">
        <Badge variant="outline">{t("rentals.status.active")}</Badge>
      </TableCell>

      <TableCell className="py-3 pr-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              aria-label={t("rentals.columns.actions")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={goToDetails}>
              <Eye className="h-4 w-4" />
              <span>{t("rentals.actions.details")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={goToDetails}>
              <Pencil className="h-4 w-4" />
              <span>{t("rentals.actions.edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteRental(rental._id)}
              className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("rentals.actions.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
