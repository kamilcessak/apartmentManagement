import { Button } from "@mui/material";
import { MdAdd } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { RentalType } from "../types/rental.types";

import { EmptyView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";
import { ErrorView } from "@components/common";

export const RentalsScreen = () => {
  const navigate = useNavigate();
  const handleAddNewRental = () => navigate("/rentals/new");

  const handleGetRentals = async () => {
    try {
      const result = await api.get<RentalType[]>("/rentals");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["rentals", "list"],
    queryFn: handleGetRentals,
  });

  console.log({ data });

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error?.message} onClick={refetch} />;

  return (
    <RouteContent>
      <header className="flex flex-row justify-between items-center p-8 bg-white border-b-2 border-gray-200">
        <h1 className="text-3xl font-semibold">{`List of your rentals`}</h1>
        <Button
          variant="outlined"
          color="primary"
          style={{ textTransform: "none" }}
          startIcon={<MdAdd />}
          onClick={handleAddNewRental}
        >
          {`Add new rental`}
        </Button>
      </header>
      <main className="flex h-full flex-col gap-4 bg-white p-8 overflow-y-scroll scrollbar-hide">
        {data?.length ? (
          data.map((e, i) => <div />)
        ) : (
          <EmptyView message="No rentals added yet" />
        )}
      </main>
    </RouteContent>
  );
};
