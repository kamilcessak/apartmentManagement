import { useNavigate } from "react-router-dom";
import { MdChevronLeft } from "react-icons/md";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useCallback, useMemo } from "react";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";

import { ApartmentListType } from "@features/apartments/types/apartment.type";
import { TenantsListType } from "@features/tenants/types/tenant.type";
import { DatePicker } from "@mui/x-date-pickers";
import { FilesSection } from "@components/files";

const schema = yup.object().shape({
  apartmentID: yup.string().required("Field is required"),
  tenantID: yup.string().required("Field is required"),
  startDate: yup.date().required("Field is required"),
  endDate: yup.date().required("Field is required"),
  rentalPaymentDay: yup.number().required("Field is required"),
  monthlyCost: yup.number().required("Field is required"),
  securityDeposit: yup.number().required("Field is required"),
  description: yup.string().required("Field is required"),
});

type FormValues = {
  apartmentID: string;
  tenantID: string;
  startDate: Date | null | string;
  endDate: Date | null | string;
  rentalPaymentDay: number | null;
  monthlyCost: number | null;
  securityDeposit: number | null;
  description: string;
  documents?: string[];
  photos?: string[];
};

export const NewRentalScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      apartmentID: "",
      tenantID: "",
      startDate: null,
      endDate: null,
      rentalPaymentDay: null,
      monthlyCost: null,
      securityDeposit: null,
      description: "",
    },
  });

  const handlePostRental = async (data: FormValues) => {
    try {
      console.log({ data });
      const result = await api.post("/rental", data);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleGetApartmentsList = async () => {
    try {
      const result = await api.get<ApartmentListType[]>("/apartmentsList");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleGetTenantsList = async () => {
    try {
      const result = await api.get<TenantsListType[]>("/tenantsList");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleAddPhotoToForm = (url: string) => {
    const currentPhotos = watch("photos") || [];
    setValue("photos", [...currentPhotos, url]);
  };

  const handleRemovePhotoFromForm = (url: string) => {
    const currentPhotos = watch("photos") || [];
    const result = currentPhotos.filter((e) => e !== url);
    setValue("photos", [...result]);
  };

  const handleAddDocumentToForm = (url: string) => {
    const currentDocuments = watch("documents") || [];
    setValue("documents", [...currentDocuments, url]);
  };

  const handleRemoveDocumentFromForm = (url: string) => {
    const currentDocuments = watch("documents") || [];
    const result = currentDocuments.filter((e) => e !== url);
    setValue("documents", [...result]);
  };

  const {
    data: apartmentsList,
    isLoading: isApartmentsListLoading,
    isError: isApartmentsListError,
    error: apartmentsListError,
    refetch: refetchApartmentsList,
  } = useQuery({
    queryKey: ["apartments", "ids", "LIST"],
    queryFn: handleGetApartmentsList,
  });

  const {
    data: tenantsList,
    isLoading: isTenantsListLoading,
    isError: isTenantsListError,
    error: tenantsListError,
    refetch: refetchTenantsList,
  } = useQuery({
    queryKey: ["tenants", "ids", "LIST"],
    queryFn: handleGetTenantsList,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: handlePostRental,
    onSuccess: (data) => {
      if (data.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["rentals", "list"] });
        toast("Rental created successfully", { type: "success" });
        navigate(-1);
      }
    },
    onError: () => {
      toast("An error occurred during creating new rental", { type: "error" });
    },
  });

  const onSubmit = ({ startDate, endDate, ...data }: FormValues) => {
    console.log({ data, startDate, endDate });
    mutate({
      ...data,
      startDate: `${
        typeof startDate === "object" ? startDate?.toISOString() : ""
      }`,
      endDate: `${typeof endDate === "object" ? endDate?.toISOString() : ""}`,
    });
  };

  const isAnyLoading = useMemo(
    () => isApartmentsListLoading || isTenantsListLoading,
    [isApartmentsListLoading, isTenantsListLoading]
  );

  const isAnyError = useMemo(
    () => isApartmentsListError || isTenantsListError,
    [isApartmentsListError, isTenantsListError]
  );

  const refetchEverything = useCallback(async () => {
    await Promise.all([refetchApartmentsList(), refetchTenantsList()]);
  }, [refetchApartmentsList, refetchTenantsList]);

  if (isAnyLoading) return <LoadingView />;
  if (isAnyError)
    return (
      <ErrorView
        message={`${apartmentsListError?.message} \n ${tenantsListError?.message}`}
        onClick={refetchEverything}
      />
    );

  return (
    <RouteContent>
      <header className="flex flex-row items-center p-8 border-b-2 border-gray-200">
        <a onClick={() => navigate(-1)}>
          <MdChevronLeft size={48} />
        </a>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl">Add new rental</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        {apartmentsList?.length ? (
          <FormControl fullWidth error={!!errors.apartmentID?.message}>
            <InputLabel id="apartmentIdSelectLabel">Apartment ID</InputLabel>
            <Controller
              control={control}
              name="apartmentID"
              render={({ field, fieldState }) => (
                <>
                  <Select
                    labelId="apartmentIdSelectLabel"
                    id="apartmentIdSelect"
                    value={
                      field?.value?.length
                        ? apartmentsList.find((e) => e._id === field.value)?._id
                        : ""
                    }
                    label="Age"
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    {apartmentsList.map((e, i) => (
                      <MenuItem key={`apartment-${e._id}-${i}`} value={e._id}>
                        {e.address}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </>
              )}
            />
          </FormControl>
        ) : null}
        {tenantsList?.length ? (
          <FormControl fullWidth error={!!errors.tenantID?.message}>
            <InputLabel id="tenantIdSelectLabel">Tenant ID</InputLabel>
            <Controller
              control={control}
              name="tenantID"
              render={({ field, fieldState }) => (
                <>
                  <Select
                    labelId="tenantIdSelectLabel"
                    id="tenantIdSelect"
                    value={
                      field?.value?.length
                        ? tenantsList.find((e) => e._id === field.value)?._id
                        : ""
                    }
                    label="Age"
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    {tenantsList.map((e, i) => (
                      <MenuItem key={`tenant-${e._id}-${i}`} value={e._id}>
                        {`${e.firstName} ${e.lastName}`}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </>
              )}
            />
          </FormControl>
        ) : null}
        <Controller
          name="startDate"
          control={control}
          render={({ field, fieldState }) => (
            <DatePicker
              label="Rental start date"
              value={field.value}
              onChange={(newValue) => field.onChange(newValue)}
              format="DD.MM.YYYY"
              slotProps={{
                textField: {
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                } as React.ComponentProps<typeof TextField>,
              }}
            />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field, fieldState }) => (
            <DatePicker
              label="Rental end date"
              value={field.value}
              onChange={(newValue) => field.onChange(newValue)}
              format="DD.MM.YYYY"
              slotProps={{
                textField: {
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                } as React.ComponentProps<typeof TextField>,
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="rentalPaymentDay"
          render={({ field, fieldState }) => (
            <TextField
              disabled={isPending}
              label="Rental payment day"
              value={field.value ?? ""}
              type="number"
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
              value={field.value ?? ""}
              type="number"
              onChange={field.onChange}
              variant="outlined"
              error={!!fieldState.error?.message}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="securityDeposit"
          render={({ field, fieldState }) => (
            <TextField
              disabled={isPending}
              label="Security deposit"
              value={field.value ?? ""}
              type="number"
              onChange={field.onChange}
              variant="outlined"
              error={!!fieldState.error?.message}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              disabled={isPending}
              label="Additional description"
              value={field.value}
              multiline
              onChange={field.onChange}
              variant="outlined"
              error={!!fieldState.error?.message}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <FilesSection
          title={"Photos"}
          handleAddForm={handleAddPhotoToForm}
          handleRemoveForm={handleRemovePhotoFromForm}
        />
        <FilesSection
          title={"Documents"}
          handleAddForm={handleAddDocumentToForm}
          handleRemoveForm={handleRemoveDocumentFromForm}
        />
        <div className="flex justify-end w-full gap-2">
          <Button
            className="flex flex-1"
            color="success"
            size="large"
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            style={{ textTransform: "none" }}
            startIcon={
              isPending ? <CircularProgress size={16} color="primary" /> : null
            }
          >
            Add
          </Button>
          <Button
            size="large"
            className="flex flex-1"
            variant="outlined"
            style={{ textTransform: "none" }}
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </RouteContent>
  );
};
