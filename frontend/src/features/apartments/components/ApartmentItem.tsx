import { CircularProgress, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MdDelete, MdEdit } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { ApartmentType } from "../types/apartment.type";

import api from "@services/api";

export const ApartmentItem = ({ apartment }: { apartment: ApartmentType }) => {
  const queryClient = useQueryClient();
  const navigation = useNavigate();

  const deleteApartment = async (id: string) => {
    try {
      const result = await api.delete(`/apartment/${id}`);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: deleteApartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments", "list"] });
      toast("Apartment deleted successfully", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during deleting apartment", { type: "error" });
    },
  });

  return (
    <div className="flex flex-row items-center justify-between border-gray-400 rounded-md border-2 p-4">
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-col gap-2">
          <Typography variant="subtitle1">{`${apartment.address}`}</Typography>
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <IconButton color="primary" onClick={() => mutate(apartment._id)}>
          {isPending ? <CircularProgress size={32} /> : <MdDelete size={32} />}
        </IconButton>
        <IconButton
          color="primary"
          onClick={() => navigation(`/apartment/${apartment._id}`)}
        >
          <MdEdit size={32} />
        </IconButton>
      </div>
    </div>
  );
};
