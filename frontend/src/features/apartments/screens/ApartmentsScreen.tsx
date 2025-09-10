import { Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import { MdAdd, MdVisibility } from "react-icons/md";

import { EmptyView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";
import { ApartmentListItem } from "@components/apartment";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { ErrorView } from "@components/common";
import { ApartmentType } from "../types/apartment.type";
import { ApartmentItem } from "../components/ApartmentItem";

export const ApartmentsScreen = () => {
  const navigate = useNavigate();
  const handleAddNewApartment = () => navigate("/apartments/new");

  const handleGetApartments = async () => {
    try {
      const result = await api.get<ApartmentType[]>("/apartments");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["apartments", "list"],
    queryFn: handleGetApartments,
  });

  console.log({ data });

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error?.message} onClick={refetch} />;

  return (
    <RouteContent>
      <header className="flex flex-row justify-between items-center p-8 bg-white border-b-2 border-gray-200">
        <h1 className="text-3xl font-semibold">{`List of your apartments`}</h1>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<MdAdd />}
          onClick={handleAddNewApartment}
        >
          {`Add new apartment`}
        </Button>
      </header>
      <main className="flex h-full flex-col gap-4 bg-white p-8 overflow-y-scroll scrollbar-hide">
        {data?.length ? (
          data.map((e, i) => (
            <ApartmentItem apartment={e} key={`apartment-item-${e._id}-${i}`} />
          ))
        ) : (
          <EmptyView message="No apartments added yet" />
        )}
      </main>
    </RouteContent>
  );
};
