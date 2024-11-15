import React from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";

export const WelcomeScreen = () => {
  return (
    <div className="flex flex-1 gap-2 flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-2 w-1/4 text-center">
        <h1 className="font-semibold text-2xl">
          Welcome to ApartmentManagement!
        </h1>
        <div className="flex flex-col items-center gap-2 w-full">
          <Link className="w-full" to="/login">
            <Button variant="outlined" fullWidth size="large">
              Login
            </Button>
          </Link>
          <Link className="w-full" to="/register">
            <Button variant="outlined" fullWidth size="large">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
