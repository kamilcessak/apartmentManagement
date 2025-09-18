import {
  Button,
  CircularProgress,
  Divider,
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
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { DetailsInformationItem } from "@components/sections";
import { DetailsSectionHeader } from "@components/header";
import { ApartmentType } from "../types/apartment.type";

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
    <section
      className={`flex flex-col gap-4 border-2 ${
        editMode ? "border-green-600" : "border-gray-700"
      } rounded-md p-4`}
    >
      <DetailsSectionHeader
        editMode={editMode}
        editModeButton={
          <Button
            color="success"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress /> : null}
            onClick={handleSubmit(onSubmit)}
            style={{ textTransform: "none" }}
          >
            <Typography variant="body2">Save</Typography>
          </Button>
        }
        title={"Main informations"}
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
      <Divider />
      <div className="flex flex-1 flex-row items-center gap-4 justify-between w-full">
        {!editMode ? (
          <>
            <DetailsInformationItem
              title={"Apartment ID"}
              subtitle={getApartmentIdFromAddress(data.address)}
            />
            <DetailsInformationItem
              title={"Address"}
              subtitle={`${data.address}`}
            />
            <DetailsInformationItem
              title={"Metric"}
              subtitle={`${data.metric} m²`}
            />
            <DetailsInformationItem
              title={"Rooms count"}
              subtitle={`${data.roomCount}`}
            />
            <DetailsInformationItem
              title={"Monthly cost"}
              subtitle={`${data.monthlyCost} zł`}
            />
            <DetailsInformationItem
              title={"Status"}
              subtitle={`${!!data.isAvailable}`}
              content={
                <div
                  className="text-white p-1 rounded-md"
                  style={{
                    backgroundColor: data.isAvailable
                      ? theme.palette.success.main
                      : theme.palette.warning.main,
                  }}
                >
                  {data.isAvailable ? "Available" : "Unavailable"}
                </div>
              }
            />
          </>
        ) : (
          <div className="flex flex-col flex-1 gap-4">
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
    </section>
  );
};
