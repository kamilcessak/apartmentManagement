import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Building, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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

import { ApartmentType } from "../types/apartment.type";

type Props = {
  apartment: ApartmentType;
};

export const ApartmentItem: FC<Props> = ({ apartment }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: handleDeleteApartment, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => api.delete(`/apartment/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments", "list"] });
      toast(t("apartments.deleteSuccess"), { type: "success" });
    },
    onError: () => {
      toast(t("apartments.deleteError"), { type: "error" });
    },
  });

  const isAvailable = apartment.isAvailable;

  const parameters = [
    apartment.metric
      ? t("apartments.parameters.metric", { value: apartment.metric })
      : null,
    apartment.roomCount
      ? t("apartments.parameters.roomCount", { count: apartment.roomCount })
      : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const goToDetails = () => navigate(`/apartment/${apartment._id}`);

  return (
    <TableRow className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <TableCell className="py-3 pl-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-indigo-50 text-indigo-600">
              <Building className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-900">
            {apartment.address}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-3 text-sm text-slate-500">
        {parameters || "—"}
      </TableCell>

      <TableCell className="py-3 text-sm font-medium text-slate-900">
        {apartment.monthlyCost
          ? t("apartments.parameters.monthlyCost", {
              value: apartment.monthlyCost,
            })
          : "—"}
      </TableCell>

      <TableCell className="py-3">
        <Badge
          variant="secondary"
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            isAvailable
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
          )}
        >
          {isAvailable
            ? t("apartments.status.available")
            : t("apartments.status.occupied")}
        </Badge>
      </TableCell>

      <TableCell className="py-3 pr-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              aria-label={t("apartments.columns.actions")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={goToDetails}>
              <Eye className="h-4 w-4" />
              <span>{t("apartments.actions.details")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={goToDetails}>
              <Pencil className="h-4 w-4" />
              <span>{t("apartments.actions.edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteApartment(apartment._id)}
              className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("apartments.actions.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
