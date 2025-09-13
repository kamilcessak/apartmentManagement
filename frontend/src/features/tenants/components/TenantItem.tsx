import { toast } from "react-toastify";
import { MdPhone, MdEmail, MdDelete, MdEdit } from "react-icons/md";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { TenantType } from "../types/tenant.type";

import { UserAvatar } from "@components/common";
import api from "@services/api";

type Props = {
  user: TenantType;
};

export const TenantItem = ({ user }: Props) => {
  const navigation = useNavigate();
  const queryClient = useQueryClient();

  const deleteTenant = async (id: string) => {
    try {
      const result = await api.delete(`/tenant/${id}`);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate: handleDeleteTenant, isPending: isTenantDeleting } =
    useMutation({
      mutationFn: deleteTenant,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tenants", "list"] });
        toast("Tenant deleted successfully", { type: "success" });
      },
      onError: () => {
        toast("An error occurred during deleting Tenant", { type: "error" });
      },
    });

  return (
    <div className="flex flex-row items-center justify-between border-gray-400 rounded-md border-2 p-4">
      <div className="flex flex-row items-center gap-4">
        <UserAvatar {...user} />
        <div className="flex flex-col gap-2">
          <Typography variant="subtitle1">{`${user.firstName} ${user.lastName}`}</Typography>
          <div className="flex flex-row items-start gap-2">
            <div className="flex flex-row items-center gap-2">
              <MdEmail size={24} />
              <Typography variant="body2">{user.email}</Typography>
            </div>
            <div className="flex flex-row items-center gap-2">
              <MdPhone size={24} />
              <Typography variant="body2">{user.phoneNumber}</Typography>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <IconButton
          color="primary"
          onClick={() => handleDeleteTenant(user._id)}
        >
          {isTenantDeleting ? (
            <CircularProgress size={32} />
          ) : (
            <MdDelete size={32} />
          )}
        </IconButton>
        <IconButton
          color="primary"
          onClick={() => navigation(`/tenant/${user._id}`)}
        >
          <MdEdit size={32} />
        </IconButton>
      </div>
    </div>
  );
};
