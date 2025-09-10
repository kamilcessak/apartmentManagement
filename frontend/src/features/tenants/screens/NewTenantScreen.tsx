import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, CircularProgress, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { RouteContent } from "@components/common";
import api from "@services/api";
import { MdChevronLeft } from "react-icons/md";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email().required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  personalId: yup.string().required("Personal ID is required"),
  address: yup.string().required("Address is required"),
});

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  personalId: string;
  address: string;
};

export const NewTenantScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const createTenant = async (data: FormValues) => {
    try {
      const result = await api.post("/tenant", data);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createTenant,
    onSuccess: async () => {
      queryClient
        .invalidateQueries({ queryKey: ["tenants", "list"] })
        .then(() => {
          toast("Tenant added successfully", { type: "success" });
          navigate(-1);
        });
    },
    onError: (error) => {
      console.error(error);
      toast("An error occured during adding new Tenant. Try again", {
        type: "error",
      });
    },
  });

  const formFields = [
    {
      label: "First Name",
      registerName: "firstName",
      helperText: errors?.firstName?.message,
      error: !!errors?.firstName?.message,
    },
    {
      label: "Last Name",
      registerName: "lastName",
      helperText: errors?.lastName?.message,
      error: !!errors?.lastName?.message,
    },
    {
      label: "Email",
      registerName: "email",
      helperText: errors?.email?.message,
      error: !!errors?.email?.message,
    },
    {
      label: "Phone number",
      registerName: "phoneNumber",
      helperText: errors?.phoneNumber?.message,
      error: !!errors?.phoneNumber?.message,
    },
    {
      label: "PersonalID",
      registerName: "personalId",
      helperText: errors?.personalId?.message,
      error: !!errors?.personalId?.message,
    },
    {
      label: "Registration address",
      registerName: "address",
      helperText: errors?.address?.message,
      error: !!errors?.address?.message,
    },
  ];

  const onSubmit = (data: FormValues) => mutate(data);

  return (
    <RouteContent>
      <header className="flex flex-row items-center p-8 border-b-2 border-gray-200">
        <a onClick={() => navigate(-1)}>
          <MdChevronLeft size={48} />
        </a>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl font-semibold">Add new Tenant</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        <div className="flex flex-col">
          {formFields.map(({ registerName, ...e }, i) => (
            <TextField
              className="h-20"
              key={`field-${e.label}-${i}`}
              {...e}
              {...register(registerName)}
              id={e.label}
              variant="standard"
            />
          ))}
        </div>
        <div className="flex justify-end w-full gap-2">
          <Button
            className="flex flex-1"
            color="success"
            size="large"
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
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
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </RouteContent>
  );
};
