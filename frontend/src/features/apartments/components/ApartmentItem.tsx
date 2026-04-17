import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import api from "@services/api";
import { ApartmentType } from "../types/apartment.type";

export const ApartmentItem = ({ apartment }: { apartment: ApartmentType }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const isAvailable = apartment.isAvailable;

  return (
    <Card className="flex flex-row items-center justify-between gap-4 border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="truncate font-medium text-slate-900">
            {apartment.address}
          </p>
          <Badge
            variant={isAvailable ? "secondary" : "outline"}
            className={
              isAvailable
                ? "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }
          >
            {isAvailable ? "Dostępne" : "Wynajęte"}
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          {apartment.metric ? `${apartment.metric} m²` : null}
          {apartment.metric && apartment.monthlyCost ? " · " : null}
          {apartment.monthlyCost ? `${apartment.monthlyCost} zł` : null}
        </p>
      </div>

      <div className="flex flex-row items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          onClick={() => navigate(`/apartment/${apartment._id}`)}
          aria-label="Edit apartment"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          onClick={() => mutate(apartment._id)}
          disabled={isPending}
          aria-label="Delete apartment"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
};
