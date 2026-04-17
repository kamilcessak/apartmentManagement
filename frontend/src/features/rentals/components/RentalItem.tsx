import { FC } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import api from "@services/api";
import { getApartmentIdFromAddress } from "@utils/apartment";

import { RentalType } from "../types/rental.types";

type Props = {
  rental: RentalType;
  searchQuery?: string;
};

export const RentalItem: FC<Props> = ({ rental, searchQuery = "" }) => {
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
      toast("Rental deleted successfully", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during deleting rental", { type: "error" });
    },
  });

  const isLoading = isApartmentDataLoading || isTenantDataLoading;

  if (isLoading) {
    return (
      <TableRow className="border-b border-slate-100 hover:bg-transparent">
        <TableCell colSpan={4} className="py-4 pl-6">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        </TableCell>
      </TableRow>
    );
  }

  const addressLabel = apartmentData?.address
    ? getApartmentIdFromAddress(apartmentData.address)
    : "—";
  const tenantLabel = tenantData
    ? `${tenantData.firstName ?? ""} ${tenantData.lastName ?? ""}`.trim() || "—"
    : "—";

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
        <Badge variant="outline">Active</Badge>
      </TableCell>

      <TableCell className="py-3 pr-6 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit rental"
            title="Edit rental"
            onClick={() => navigate(`/rental/${rental._id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete rental"
            title="Delete rental"
            disabled={isDeleting}
            onClick={() => deleteRental(rental._id)}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
