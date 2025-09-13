import { CircularProgress, IconButton, Typography } from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";
import { RentalType } from "../types/rental.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { toast } from "react-toastify";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { useMemo } from "react";

export const RentalItem = ({ rental }: { rental: RentalType }) => {
  const queryClient = useQueryClient();
  const navigation = useNavigate();

  const deleteRental = async (id: string) => {
    try {
      const result = await api.delete(`/rental/${id}`);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

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

  console.log({ apartmentData, tenantData });

  const { mutate, isPending } = useMutation({
    mutationFn: deleteRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals", "list"] });
      toast("Rental deleted successfully", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during deleting rental", { type: "error" });
    },
  });

  const isAnyLoading = useMemo(
    () => isApartmentDataLoading || isTenantDataLoading,
    [isApartmentDataLoading, isTenantDataLoading]
  );

  if (isAnyLoading) return <CircularProgress size={32} />;

  return (
    <div className="flex flex-row items-center justify-between border-gray-400 rounded-md border-2 p-4">
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-col gap-2">
          <Typography variant="subtitle1">{`${getApartmentIdFromAddress(
            apartmentData.address
          )}`}</Typography>
          <Typography variant="subtitle1">{`${tenantData.firstName} ${tenantData.lastName}`}</Typography>
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <IconButton color="primary" onClick={() => mutate(rental._id)}>
          {isPending ? <CircularProgress size={32} /> : <MdDelete size={32} />}
        </IconButton>
        <IconButton
          color="primary"
          onClick={() => navigation(`/rental/${rental._id}`)}
        >
          <MdEdit size={32} />
        </IconButton>
      </div>
    </div>
  );
};
