import {
  Button as MuiButton,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import * as yup from "yup";
import { FC, ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { DetailsSectionHeader } from "@components/header";
import { ApartmentType } from "../types/apartment.type";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getApartmentIdFromAddress } from "@utils/apartment";
import api from "@services/api";

const schema = yup.object().shape({
  address: yup.string().required("Field is required"),
  metric: yup.number().required("Field is required"),
  roomCount: yup.number().required("Field is required"),
  monthlyCost: yup.number().required("Field is required"),
  isAvailable: yup.boolean().required("Field is required"),
});

type FormType = {
  address: string;
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

export const DetailsInformationsSection = ({
  data,
}: {
  data: ApartmentType;
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [editMode, seteditMode] = useState(false);

  const { handleSubmit, control, reset } = useForm<FormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      address: data?.address || "",
      metric: data?.metric || 0,
      roomCount: data?.roomCount || 0,
      monthlyCost: data?.monthlyCost || 0,
      isAvailable: data?.isAvailable || true,
    },
  });

  const handlePatchApartment = async (formData: FormType) => {
    try {
      const result = await api.patch(`/apartment/${data._id}`, formData);
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
      seteditMode(false);
      toast("Successfully modified apartment details", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during modifying apartment details", {
        type: "error",
      });
    },
  });

  const onSubmit = (formData: FormType) => mutate(formData);

  return (
    <Card className="p-6 mb-6">
      <DetailsSectionHeader
        editMode={editMode}
        editModeButton={
          <MuiButton
            color="success"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} /> : null}
            onClick={handleSubmit(onSubmit)}
            style={{ textTransform: "none" }}
          >
            <Typography variant="body2">Save</Typography>
          </MuiButton>
        }
        title={"Main information"}
        onClickButton={() =>
          seteditMode((prev) => {
            if (!prev) {
              reset({
                address: data?.address || "",
                metric: data?.metric || 0,
                roomCount: data?.roomCount || 0,
                monthlyCost: data?.monthlyCost || 0,
                isAvailable: data?.isAvailable || true,
              });
            }
            return !prev;
          })
        }
      />
      <div className="mt-6">
        {!editMode ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <InfoCell
              label="Apartment ID"
              value={getApartmentIdFromAddress(data.address)}
            />
            <InfoCell label="Address" value={data.address} />
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
          <div className="flex flex-col gap-4">
            <Controller
              control={control}
              name="address"
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isPending}
                  label="Address"
                  value={field.value}
                  onChange={field.onChange}
                  variant="outlined"
                  error={!!fieldState.error?.message}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="metric"
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isPending}
                  label="Metric"
                  value={field.value}
                  onChange={field.onChange}
                  variant="outlined"
                  error={!!fieldState.error?.message}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="roomCount"
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isPending}
                  label="Room count"
                  value={field.value}
                  onChange={field.onChange}
                  variant="outlined"
                  error={!!fieldState.error?.message}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="monthlyCost"
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isPending}
                  label="Monthly cost"
                  value={field.value}
                  onChange={field.onChange}
                  variant="outlined"
                  error={!!fieldState.error?.message}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="isAvailable"
              render={({ field, fieldState }) => (
                <FormControl>
                  <InputLabel id="isAvailableSelect">Is available</InputLabel>
                  <Select
                    id="isAvailableSelect"
                    label="Is available"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value === "true");
                    }}
                  >
                    <MenuItem value={"true"}>Available</MenuItem>
                    <MenuItem value={"false"}>Not available</MenuItem>
                  </Select>
                  {fieldState.error?.message && (
                    <FormHelperText
                      style={{ color: theme.palette.error.main }}
                    >{`fieldState.error?.message`}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
};
