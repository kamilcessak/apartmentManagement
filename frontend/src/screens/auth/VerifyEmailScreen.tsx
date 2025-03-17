import { CircularProgress } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export const VerifyEmailScreen = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const activationAttemptedRef = useRef(false);

  const { mutate: activateAccount, isError } = useMutation({
    mutationFn: async (tokenParam: string) => {
      const result = await axios.get("http://localhost:5050/activate-account", {
        params: { token: tokenParam },
      });
      return result;
    },
    onSuccess: (data) => {
      toast(data.data.message, { type: "success" });
      if (data.status === 200) {
        navigate("/login", { replace: true });
      }
    },
    onError: (data) => {
      toast(data.response.data.error, { type: "error" });
    },
  });

  useEffect(() => {
    if (token?.length && !activationAttemptedRef.current) {
      activationAttemptedRef.current = true;
      activateAccount(token);
    }
  }, [token]);

  return (
    <div className="flex h-screen flex-1 items-center justify-center flex-col gap-8">
      {isError ? (
        <h1 className="text-3xl">
          Wystąpił błąd podczas aktywacji konta. Spróbuj ponownie.
        </h1>
      ) : (
        <>
          <h1 className="text-3xl">Trwa weryfikacja adresu email</h1>
          <CircularProgress size={50} />
        </>
      )}
    </div>
  );
};
