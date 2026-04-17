import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, CircularProgress, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";
import { MdArrowBackIos } from "react-icons/md";
import { toast } from "react-toastify";

import api from "@services/api";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9+\-\s()]{6,20}$/, "Invalid phone number")
    .required("Phone number is required"),
  invitationCode: yup.string().optional(),
});

type FormValues = {
  email: string;
  password: string;
  phoneNumber: string;
  invitationCode?: string;
};

export const RegisterScreen = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const handleRegister = async (data: FormValues) => {
    const payload: FormValues = {
      email: data.email.trim(),
      password: data.password,
      phoneNumber: data.phoneNumber.trim(),
    };
    const invitationCode = data.invitationCode?.trim();
    if (invitationCode) {
      payload.invitationCode = invitationCode;
    }
    const response = await api.post("/register", payload);
    return response;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleRegister,
    onSuccess: (data) => {
      if (data?.status === 201) {
        navigate("/registerSuccess", { replace: true });
      }
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Registration failed";
      toast(message, { type: "error" });
    },
  });

  const onSubmit = (data: FormValues) => mutate(data);

  return (
    <>
      <div className="flex flex-1 items-center justify-center h-screen flex-col gap-4">
        <h1 className="text-2xl font-semibold">
          Register into the application
        </h1>
        <form
          className="flex flex-col gap-4 w-full items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            className="w-1/4"
            label="Email"
            disabled={isPending}
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            className="w-1/4"
            label="Phone number"
            disabled={isPending}
            {...register("phoneNumber")}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber?.message}
          />
          <TextField
            className="w-1/4"
            disabled={isPending}
            label="Password"
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            className="w-1/4"
            label="Invitation code (optional)"
            disabled={isPending}
            {...register("invitationCode")}
            error={!!errors.invitationCode}
            helperText={errors.invitationCode?.message}
          />
          <Button
            type="submit"
            disabled={isPending}
            className="w-1/4"
            size="large"
            variant="outlined"
            startIcon={isPending ? <CircularProgress size={20} /> : null}
          >
            Register
          </Button>
        </form>
      </div>
      <Link to="/" className="absolute top-8 left-8">
        <MdArrowBackIos size={24} />
      </Link>
    </>
  );
};
