import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { MdChevronLeft } from "react-icons/md";
import { Button, CircularProgress, Divider, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { TenantDetailsFormType, TenantType } from "../types/tenant.type";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";
import { DetailsSectionHeader } from "@components/header";
import { TenantDetails } from "../components/TenantDetails";

const schema = yup.object().shape({
  firstName: yup.string().required("Field is required"),
  lastName: yup.string().required("Field is required"),
  email: yup.string().required("Field is required"),
  phoneNumber: yup.string().required("Field is required"),
});

export const TenantDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editMode, seteditMode] = useState(false);

  const { handleSubmit, control, reset } = useForm<TenantDetailsFormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  const handleGetTenant = async () => {
    try {
      const result = await api.get<TenantType>(`/tenant/${id}`);
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch, isSuccess } = useQuery({
    queryKey: ["tenant", `${id}`],
    queryFn: handleGetTenant,
  });

  const handlePatchTenant = async (formData: TenantDetailsFormType) => {
    try {
      const result = await api.patch(`/tenant/${id}`, formData);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePatchTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", `${id}`] });
      seteditMode(false);
      toast("Successfully modified tenant details", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during modifying tenant details", {
        type: "error",
      });
    },
  });

  const onSubmit = (formData: TenantDetailsFormType) => mutate(formData);

  useEffect(() => {
    if (isSuccess) {
      reset({
        firstName: data?.firstName,
        lastName: data?.lastName,
        email: data?.email,
        phoneNumber: data?.phoneNumber,
      });
    }
  }, [isSuccess]);

  if (isLoading) return <LoadingView />;
  if (isError || !data)
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;

  return (
    <RouteContent>
      <header className="flex flex-row items-center p-8 border-b-2 border-gray-200">
        <a className="cursor-pointer" onClick={() => navigate(-1)}>
          <MdChevronLeft size={48} />
        </a>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl font-semibold">
            {`Details of: ${data.firstName} ${data.lastName}`}
          </h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        <div
          className={`border-2 ${
            editMode ? "border-green-600" : "border-gray-400"
          } p-4 flex flex-col gap-4 rounded`}
        >
          <DetailsSectionHeader
            title="Main informations"
            editMode={editMode}
            onClickButton={() =>
              seteditMode((prev) => {
                if (!prev) {
                  reset({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                  });
                }
                return !prev;
              })
            }
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
          />
          <Divider />
          <TenantDetails
            control={control}
            editMode={editMode}
            data={data}
            isPending={isPending}
          />
        </div>
      </main>
    </RouteContent>
  );
};
