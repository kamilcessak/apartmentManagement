import * as yup from "yup";
import { FC, ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Pencil, X } from "lucide-react";

import { ApartmentType } from "../types/apartment.type";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatApartmentFullAddress,
  getApartmentShortLabel,
} from "@utils/apartment";
import api from "@services/api";

const polishPostalCodePattern = /^\d{2}-\d{3}$/;

type FormType = {
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  city: string;
  metric: number;
  roomCount: number;
  monthlyCost: number;
  isAvailable: boolean;
};

const InfoCell: FC<{ label: string; value?: ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="font-medium text-slate-900 truncate">{value}</span>
  </div>
);

type FieldWrapperProps = {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

const FieldWrapper: FC<FieldWrapperProps> = ({
  id,
  label,
  error,
  className,
  children,
}) => (
  <div className={`flex flex-col ${className ?? ""}`}>
    <Label htmlFor={id} className="text-sm font-medium text-slate-900 mb-1.5">
      {label}
    </Label>
    {children}
    {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
  </div>
);

export const DetailsInformationsSection = ({
  data,
}: {
  data: ApartmentType;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);

  const schema = useMemo(
    () =>
      yup.object().shape({
        street: yup
          .string()
          .trim()
          .required(t("apartments.details.information.validation.required")),
        buildingNumber: yup
          .string()
          .trim()
          .required(t("apartments.details.information.validation.required")),
        apartmentNumber: yup.string().trim(),
        postalCode: yup
          .string()
          .trim()
          .required(t("apartments.details.information.validation.required"))
          .matches(
            polishPostalCodePattern,
            t("apartments.details.information.validation.postalCodeFormat")
          ),
        city: yup
          .string()
          .trim()
          .required(t("apartments.details.information.validation.required")),
        metric: yup
          .number()
          .required(t("apartments.details.information.validation.required")),
        roomCount: yup
          .number()
          .required(t("apartments.details.information.validation.required")),
        monthlyCost: yup
          .number()
          .required(t("apartments.details.information.validation.required")),
        isAvailable: yup
          .boolean()
          .required(t("apartments.details.information.validation.required")),
      }),
    [t]
  );

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      street: data?.street || "",
      buildingNumber: data?.buildingNumber || "",
      apartmentNumber: data?.apartmentNumber || "",
      postalCode: data?.postalCode || "",
      city: data?.city || "",
      metric: data?.metric || 0,
      roomCount: data?.roomCount || 0,
      monthlyCost: data?.monthlyCost || 0,
      isAvailable: data?.isAvailable ?? true,
    },
  });

  const handlePatchApartment = async (formData: FormType) => {
    try {
      const payload = {
        ...formData,
        apartmentNumber: formData.apartmentNumber.trim(),
      };
      const result = await api.patch(`/apartment/${data._id}`, payload);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePatchApartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartment", `${data._id}`] });
      setEditMode(false);
      toast(t("apartments.details.information.toastSuccess"), {
        type: "success",
      });
    },
    onError: () => {
      toast(t("apartments.details.information.toastError"), {
        type: "error",
      });
    },
  });

  const handleToggleEdit = () => {
    setEditMode((prev) => {
      if (!prev) {
        reset({
          street: data?.street || "",
          buildingNumber: data?.buildingNumber || "",
          apartmentNumber: data?.apartmentNumber || "",
          postalCode: data?.postalCode || "",
          city: data?.city || "",
          metric: data?.metric || 0,
          roomCount: data?.roomCount || 0,
          monthlyCost: data?.monthlyCost || 0,
          isAvailable: data?.isAvailable ?? true,
        });
      }
      return !prev;
    });
  };

  const onSubmit = (formData: FormType) => mutate(formData);

  return (
    <Card className="border-slate-200 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
          <CardTitle className="text-lg text-slate-900">
            {t("apartments.details.information.title")}
          </CardTitle>
          {!editMode ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggleEdit}
              className="text-slate-600 hover:text-slate-900"
            >
              <Pencil className="h-4 w-4" />
              {t("apartments.details.information.edit")}
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="pt-2">
          {!editMode ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <InfoCell
                label={t("apartments.details.information.view.apartmentId")}
                value={getApartmentShortLabel(data)}
              />
              <InfoCell
                label={t("apartments.details.information.view.address")}
                value={formatApartmentFullAddress(data)}
              />
              <InfoCell
                label={t("apartments.details.information.view.metric")}
                value={`${data.metric} ${t(
                  "apartments.details.information.view.metricSuffix"
                )}`}
              />
              <InfoCell
                label={t("apartments.details.information.view.roomsCount")}
                value={`${data.roomCount}`}
              />
              <InfoCell
                label={t("apartments.details.information.view.monthlyCost")}
                value={`${data.monthlyCost} zł`}
              />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm text-slate-500">
                  {t("apartments.details.information.view.status")}
                </span>
                <div>
                  {data.isAvailable ? (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
                      {t(
                        "apartments.details.information.view.statusAvailable"
                      )}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      {t(
                        "apartments.details.information.view.statusUnavailable"
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-12">
                <Controller
                  control={control}
                  name="street"
                  render={({ field }) => (
                    <FieldWrapper
                      id="street"
                      label={t("apartments.details.information.fields.street")}
                      error={errors.street?.message}
                      className="md:col-span-7"
                    >
                      <Input
                        id="street"
                        disabled={isPending}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FieldWrapper>
                  )}
                />
                <Controller
                  control={control}
                  name="buildingNumber"
                  render={({ field }) => (
                    <FieldWrapper
                      id="buildingNumber"
                      label={t(
                        "apartments.details.information.fields.buildingNumber"
                      )}
                      error={errors.buildingNumber?.message}
                      className="md:col-span-2"
                    >
                      <Input
                        id="buildingNumber"
                        disabled={isPending}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FieldWrapper>
                  )}
                />
                <Controller
                  control={control}
                  name="apartmentNumber"
                  render={({ field }) => (
                    <FieldWrapper
                      id="apartmentNumber"
                      label={t(
                        "apartments.details.information.fields.apartmentNumber"
                      )}
                      error={errors.apartmentNumber?.message}
                      className="md:col-span-3"
                    >
                      <Input
                        id="apartmentNumber"
                        disabled={isPending}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FieldWrapper>
                  )}
                />
                <Controller
                  control={control}
                  name="postalCode"
                  render={({ field }) => (
                    <FieldWrapper
                      id="postalCode"
                      label={t(
                        "apartments.details.information.fields.postalCode"
                      )}
                      error={errors.postalCode?.message}
                      className="md:col-span-4"
                    >
                      <Input
                        id="postalCode"
                        disabled={isPending}
                        maxLength={6}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FieldWrapper>
                  )}
                />
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <FieldWrapper
                      id="city"
                      label={t("apartments.details.information.fields.city")}
                      error={errors.city?.message}
                      className="md:col-span-8"
                    >
                      <Input
                        id="city"
                        disabled={isPending}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FieldWrapper>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="metric"
                render={({ field }) => (
                  <FieldWrapper
                    id="metric"
                    label={t("apartments.details.information.fields.metric")}
                    error={errors.metric?.message}
                  >
                    <Input
                      id="metric"
                      type="number"
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FieldWrapper>
                )}
              />
              <Controller
                control={control}
                name="roomCount"
                render={({ field }) => (
                  <FieldWrapper
                    id="roomCount"
                    label={t("apartments.details.information.fields.roomCount")}
                    error={errors.roomCount?.message}
                  >
                    <Input
                      id="roomCount"
                      type="number"
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FieldWrapper>
                )}
              />
              <Controller
                control={control}
                name="monthlyCost"
                render={({ field }) => (
                  <FieldWrapper
                    id="monthlyCost"
                    label={t(
                      "apartments.details.information.fields.monthlyCost"
                    )}
                    error={errors.monthlyCost?.message}
                  >
                    <Input
                      id="monthlyCost"
                      type="number"
                      disabled={isPending}
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value)
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FieldWrapper>
                )}
              />
              <Controller
                control={control}
                name="isAvailable"
                render={({ field }) => (
                  <FieldWrapper
                    id="isAvailable"
                    label={t(
                      "apartments.details.information.fields.isAvailable"
                    )}
                    error={errors.isAvailable?.message}
                  >
                    <Select
                      disabled={isPending}
                      value={field.value ? "true" : "false"}
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                    >
                      <SelectTrigger id="isAvailable">
                        <SelectValue
                          placeholder={t(
                            "apartments.details.information.fields.selectStatusPlaceholder"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">
                          {t(
                            "apartments.details.information.fields.selectAvailable"
                          )}
                        </SelectItem>
                        <SelectItem value="false">
                          {t(
                            "apartments.details.information.fields.selectUnavailable"
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                )}
              />
            </div>
          )}
        </CardContent>

        {editMode ? (
          <CardFooter className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleEdit}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
              {t("apartments.details.information.closeEdit")}
            </Button>
            <Button type="submit" variant="default" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("apartments.details.information.save")}
            </Button>
          </CardFooter>
        ) : null}
      </form>
    </Card>
  );
};
