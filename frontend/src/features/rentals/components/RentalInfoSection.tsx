import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import api from "@services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { RentalType } from "../types/rental.types";

const buildSchema = (t: TFunction) =>
  yup.object().shape({
    description: yup
      .string()
      .required(
        t(
          "rentals.rentalDetails.descriptionSection.validation.descriptionRequired"
        )
      ),
  });

type FormType = {
  description: string;
};

export const RentalInfoSection = ({ rental }: { rental: RentalType }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);

  const schema = useMemo(() => buildSchema(t), [t]);

  const defaultValues = useMemo<FormType>(
    () => ({
      description: rental.description || "",
    }),
    [rental]
  );

  const { handleSubmit, control, reset } = useForm<FormType>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const handlePatchRental = async (formData: FormType) => {
    const result = await api.patch(`/rental/${rental._id}`, formData);
    return result;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePatchRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental", `${rental._id}`] });
      setEditMode(false);
      toast(t("rentals.rentalDetails.descriptionSection.saveSuccess"), {
        type: "success",
      });
    },
    onError: () => {
      toast(t("rentals.rentalDetails.descriptionSection.saveError"), {
        type: "error",
      });
    },
  });

  const onSubmit = (data: FormType) => mutate(data);

  const handleToggleEdit = () => {
    setEditMode((prev) => {
      if (!prev) reset(defaultValues);
      return !prev;
    });
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {t("rentals.rentalDetails.descriptionSection.title")}
        </CardTitle>
        {!editMode ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleEdit}
          >
            <Pencil className="h-4 w-4" />
            {t("rentals.rentalDetails.descriptionSection.edit")}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {!editMode ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {rental.description || (
              <span className="italic text-slate-400">
                {t("rentals.rentalDetails.descriptionSection.empty")}
              </span>
            )}
          </p>
        ) : (
          <form
            id="rental-info-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid gap-2"
          >
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-slate-900">
                    {t("rentals.rentalDetails.descriptionSection.label")}
                  </Label>
                  <Textarea
                    id="description"
                    rows={5}
                    className="min-h-[140px]"
                    disabled={isPending}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  {fieldState.error?.message ? (
                    <p className="text-xs text-destructive">
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </form>
        )}
      </CardContent>

      {editMode ? (
        <CardFooter className="flex justify-end gap-2 border-t border-slate-100 p-6 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleToggleEdit}
            disabled={isPending}
          >
            {t("rentals.rentalDetails.descriptionSection.closeEdit")}
          </Button>
          <Button
            type="submit"
            form="rental-info-form"
            variant="default"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("rentals.rentalDetails.descriptionSection.save")}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};
