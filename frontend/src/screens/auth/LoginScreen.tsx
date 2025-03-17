import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, CircularProgress, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { MdArrowBackIos } from "react-icons/md";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  email: yup.string().required("Email is required"),
  password: yup.string().required("Password is required"),
});

type FormValues = {
  email: string;
  password: string;
};

export const LoginScreen = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const handleLogin = async (data: FormValues) => {
    try {
      const response = axios.post("http://localhost:5050/login", data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleLogin,
    onSuccess: async (data) => {
      if (data?.data.token) {
        sessionStorage.setItem("token", data.data.token);
        toast("Pomyślnie zalogowano do konta!", { type: "success" });
        navigate("/home", { replace: true, state: { loggedIn: true } });
      } else {
        alert("Login failed");
      }
    },
    onError: (error) => {
      console.error(error);
      toast(error.response.data.error, { type: "error" });
    },
  });

  const onSubmit = (data: FormValues) => mutate(data);

  return (
    <>
      <div className="flex flex-1 items-center justify-center h-screen flex-col gap-4">
        <h1 className="text-2xl font-semibold">Login into the app</h1>
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
            Login
          </Button>
        </form>
      </div>
      <Link to="/" className="absolute top-8 left-8">
        <MdArrowBackIos size={24} />
      </Link>
    </>
  );
};
