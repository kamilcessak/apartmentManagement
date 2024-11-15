import { Button } from "@mui/material";
import { Link } from "react-router-dom";

export const UnauthenticatedScreen = () => {
  return (
    <div className="flex flex-1 h-screen items-center justify-center">
      <div className="flex flex-col gap-4 w-1/3">
        <h1 className="font-semibold text-3xl text-center text-red-600">
          404 Error
        </h1>
        <h1 className="font-semibold text-3xl text-center">
          You dont have permission to visit this site.
        </h1>
        <Link to="/" replace>
          <Button variant="outlined" size="large" fullWidth>
            Go back
          </Button>
        </Link>
      </div>
    </div>
  );
};
