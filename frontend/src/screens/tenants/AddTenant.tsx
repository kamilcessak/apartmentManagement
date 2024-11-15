import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { ActivityIndicator, RouteContent } from "../../components/common";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export const AddTenant = () => {
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
      await axios.post("http://localhost:5050/tenants", data);
    } catch (error) {
      console.error(error);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createTenant,
    onSuccess: async () => {
      queryClient
        .invalidateQueries({ queryKey: ["tenants", "list"] })
        .then(() => {
          navigate("/tenants");
        });
    },
    onError: (error) => {
      console.error(error);
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
    <RouteContent
      sectionStyle={{
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
        padding: 32,
      }}
    >
      <h1 className="text-2xl font-bold">Add new Tenant:</h1>
      <form className="flex flex-1 w-3/4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-1 flex-col w-full justify-between gap-4">
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
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex flex-1 justify-center items-center border-gray-600 border-2 text-black text-xl font-semibold hover:bg-gray-600 hover:text-white py-2 px-6 rounded-md transition-colors duration-300 ease-in-out"
            >
              Cancel
            </button>
            <button
              className="flex flex-1 justify-center items-center border-blue-600 border-2 text-black text-xl font-semibold hover:bg-blue-600 hover:text-white py-2 px-6 rounded-md transition-colors duration-300 ease-in-out"
              type="submit"
            >
              {isPending ? <ActivityIndicator style={{ height: 28 }} /> : "Add"}
            </button>
          </div>
        </div>
      </form>
    </RouteContent>
  );
};
