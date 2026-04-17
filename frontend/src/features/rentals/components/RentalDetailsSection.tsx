import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { RentalType } from "../types/rental.types";

const buildSchema = (t: TFunction) =>
  yup.object().shape({
    startDate: yup
      .date()
      .typeError(
        t("rentals.rentalDetails.mainInfo.validation.startDateRequired")
      )
      .required(
        t("rentals.rentalDetails.mainInfo.validation.startDateRequired")
      ),
    endDate: yup
      .date()
      .typeError(t("rentals.rentalDetails.mainInfo.validation.endDateRequired"))
      .required(
        t("rentals.rentalDetails.mainInfo.validation.endDateRequired")
      ),
    rentalPaymentDay: yup
      .number()
      .typeError(
        t("rentals.rentalDetails.mainInfo.validation.paymentDayRequired")
      )
      .required(
        t("rentals.rentalDetails.mainInfo.validation.paymentDayRequired")
      ),
    monthlyCost: yup
      .number()
      .typeError(
        t("rentals.rentalDetails.mainInfo.validation.monthlyCostRequired")
      )
      .required(
        t("rentals.rentalDetails.mainInfo.validation.monthlyCostRequired")
      ),
    securityDeposit: yup
      .number()
      .typeError(
        t("rentals.rentalDetails.mainInfo.validation.securityDepositRequired")
      )
      .required(
        t("rentals.rentalDetails.mainInfo.validation.securityDepositRequired")
      ),
  });

type FormType = {
  startDate: string;
  endDate: string;
  rentalPaymentDay: number;
  monthlyCost: number;
  securityDeposit: number;
};

const toDateInputValue = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

type ReadItemProps = {
  label: string;
  value: string;
};

const ReadItem = ({ label, value }: ReadItemProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <span className="text-sm font-medium text-slate-900">{value}</span>
  </div>
);

export const RentalDetailsSection = ({ rental }: { rental: RentalType }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);

  const schema = useMemo(() => buildSchema(t), [t]);

  const defaultValues = useMemo<FormType>(
    () => ({
      startDate: toDateInputValue(rental.startDate),
      endDate: toDateInputValue(rental.endDate),
      rentalPaymentDay: rental.rentalPaymentDay ?? 0,
      monthlyCost: rental.monthlyCost ?? 0,
      securityDeposit: rental.securityDeposit ?? 0,
    }),
    [rental]
  );

  const { handleSubmit, control, reset } = useForm<FormType>({
    resolver: yupResolver(schema) as never,
    defaultValues,
  });

  const handlePatchRental = async (formData: FormType) => {
    const result = await api.patch(`/rental/${rental._id}`, {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    });
    return result;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePatchRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental", `${rental._id}`] });
      setEditMode(false);
      toast(t("rentals.rentalDetails.mainInfo.saveSuccess"), {
        type: "success",
      });
    },
    onError: () => {
      toast(t("rentals.rentalDetails.mainInfo.saveError"), { type: "error" });
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
          {t("rentals.rentalDetails.mainInfo.title")}
        </CardTitle>
        {!editMode ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleEdit}
          >
            <Pencil className="h-4 w-4" />
            {t("rentals.rentalDetails.mainInfo.edit")}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {!editMode ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            <ReadItem
              label={t("rentals.rentalDetails.mainInfo.fields.startDate")}
              value={dayjs(rental.startDate).format("DD.MM.YYYY")}
            />
            <ReadItem
              label={t("rentals.rentalDetails.mainInfo.fields.endDate")}
              value={dayjs(rental.endDate).format("DD.MM.YYYY")}
            />
            <ReadItem
              label={t("rentals.rentalDetails.mainInfo.fields.paymentDay")}
              value={`${rental.rentalPaymentDay}`}
            />
            <ReadItem
              label={t("rentals.rentalDetails.mainInfo.fields.monthlyCost")}
              value={`${rental.monthlyCost}`}
            />
            <ReadItem
              label={t("rentals.rentalDetails.mainInfo.fields.securityDeposit")}
              value={`${rental.securityDeposit}`}
            />
          </div>
        ) : (
          <form
            id="rental-details-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid gap-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="startDate" className="text-slate-900">
                      {t("rentals.rentalDetails.mainInfo.fields.startDate")}
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {fieldState.error?.message ? (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="endDate" className="text-slate-900">
                      {t("rentals.rentalDetails.mainInfo.fields.endDate")}
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {fieldState.error?.message ? (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Controller
                control={control}
                name="rentalPaymentDay"
                render={({ field, fieldState }) => (
                  <div className="grid gap-2">
                    <Label
                      htmlFor="rentalPaymentDay"
                      className="text-slate-900"
                    >
                      {t("rentals.rentalDetails.mainInfo.fields.paymentDay")}
                    </Label>
                    <Input
                      id="rentalPaymentDay"
                      type="number"
                      min={1}
                      max={31}
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                    />
                    {fieldState.error?.message ? (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="monthlyCost"
                render={({ field, fieldState }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="monthlyCost" className="text-slate-900">
                      {t("rentals.rentalDetails.mainInfo.fields.monthlyCost")}
                    </Label>
                    <Input
                      id="monthlyCost"
                      type="number"
                      min={0}
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                    />
                    {fieldState.error?.message ? (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="securityDeposit"
                render={({ field, fieldState }) => (
                  <div className="grid gap-2">
                    <Label
                      htmlFor="securityDeposit"
                      className="text-slate-900"
                    >
                      {t(
                        "rentals.rentalDetails.mainInfo.fields.securityDeposit"
                      )}
                    </Label>
                    <Input
                      id="securityDeposit"
                      type="number"
                      min={0}
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                    />
                    {fieldState.error?.message ? (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </div>
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
            {t("rentals.rentalDetails.mainInfo.closeEdit")}
          </Button>
          <Button
            type="submit"
            form="rental-details-form"
            variant="default"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("rentals.rentalDetails.mainInfo.save")}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};
