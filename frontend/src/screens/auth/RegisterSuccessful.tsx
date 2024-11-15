import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const RegisterSuccessful = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 items-center justify-center h-screen flex-col gap-4">
      <h1 className="font-semibold text-4xl text-green-600">
        Registered successfully!
      </h1>
      <h3 className="text-xl text-gray-800">
        Confirm your email address in your mailbox
      </h3>
      <Button
        variant="outlined"
        size="large"
        onClick={() => navigate("/", { replace: true })}
      >
        Go home
      </Button>
    </div>
  );
};
