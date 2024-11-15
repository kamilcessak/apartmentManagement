import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, CircularProgress, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { MdArrowBackIos } from "react-icons/md";

const schema = yup.object().shape({
  login: yup.string().required("Login is required"),
  password: yup.string().required("Password is required"),
  email: yup.string().required("Email is required"),
});

type FormValues = {
  login: string;
  password: string;
  email: string;
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
    try {
      const response = axios.post("http://localhost:5050/register", data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleRegister,
    onSuccess: async (data) => {
      console.log({ data });
      if (data.status === 201) {
        navigate("/registerSuccess", { replace: true });
      }
    },
    onError: (error) => {
      console.error(error);
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
            label="Login"
            disabled={isPending}
            {...register("login")}
            error={!!errors.login}
            helperText={errors.login?.message}
          />
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
            disabled={isPending}
            label="Password"
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
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
