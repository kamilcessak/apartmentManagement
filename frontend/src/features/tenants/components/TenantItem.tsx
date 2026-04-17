import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, MoreHorizontal, Pencil, Phone, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { TableCell, TableRow } from "@components/ui/table";
import api from "@services/api";

import { TenantType } from "../types/tenant.type";

type Props = {
  tenant: TenantType;
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

export const TenantItem: FC<Props> = ({ tenant }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: handleDeleteTenant, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => api.delete(`/tenant/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants", "list"] });
      toast(t("tenants.deleteSuccess"), { type: "success" });
    },
    onError: () => {
      toast(t("tenants.deleteError"), { type: "error" });
    },
  });

  const fullName = `${tenant.firstName} ${tenant.lastName}`.trim();
  const statusLabel = tenant.isActive
    ? t("tenants.status.active")
    : t("tenants.status.pending");

  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="py-3 pl-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
              {getInitials(tenant.firstName, tenant.lastName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-900">
            {fullName}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>{tenant.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>{tenant.phoneNumber}</span>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-3">
        <Badge
          variant="secondary"
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            tenant.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
              : "bg-amber-50 text-amber-700 hover:bg-amber-50"
          )}
        >
          {statusLabel}
        </Badge>
      </TableCell>

      <TableCell className="py-3 pr-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              aria-label={t("tenants.columns.actions")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate(`/tenant/${tenant._id}`)}>
              <Pencil className="h-4 w-4" />
              <span>{t("tenants.actions.edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteTenant(tenant._id)}
              className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("tenants.actions.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
