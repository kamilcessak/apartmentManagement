import * as yup from "yup";
import { FC, ReactNode, useState } from "react";
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

const schema = yup.object().shape({
  street: yup.string().trim().required("Field is required"),
  buildingNumber: yup.string().trim().required("Field is required"),
  apartmentNumber: yup.string().trim(),
  postalCode: yup
    .string()
    .trim()
    .required("Field is required")
    .matches(polishPostalCodePattern, "Use format XX-XXX"),
  city: yup.string().trim().required("Field is required"),
  metric: yup.number().required("Field is required"),
  roomCount: yup.number().required("Field is required"),
  monthlyCost: yup.number().required("Field is required"),
  isAvailable: yup.boolean().required("Field is required"),
});

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
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);

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
      toast("Successfully modified apartment details", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during modifying apartment details", {
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
            Main information
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
              Edit
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="pt-2">
          {!editMode ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <InfoCell
                label="Apartment ID"
                value={getApartmentShortLabel(data)}
              />
              <InfoCell
                label="Address"
                value={formatApartmentFullAddress(data)}
              />
              <InfoCell label="Metric" value={`${data.metric} m²`} />
              <InfoCell label="Rooms count" value={`${data.roomCount}`} />
              <InfoCell label="Monthly cost" value={`${data.monthlyCost} zł`} />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm text-slate-500">Status</span>
                <div>
                  {data.isAvailable ? (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Unavailable</Badge>
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
                      label="Street"
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
                      label="Building no."
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
                      label="Apartment no. (optional)"
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
                      label="Postal code"
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
                      label="City"
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
                    label="Metric (m²)"
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
                    label="Room count"
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
                    label="Monthly cost (zł)"
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
                    label="Is available"
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
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Available</SelectItem>
                        <SelectItem value="false">Not available</SelectItem>
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
              Close edit
            </Button>
            <Button type="submit" variant="default" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </CardFooter>
        ) : null}
      </form>
    </Card>
  );
};
