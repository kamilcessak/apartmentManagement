import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { RouteContent } from "../../components/common";
import { CircularProgress } from "@mui/material";

export const ApartmentDetailsScreen = () => {
  const { id } = useParams();

  const handleGetApartment = async () => {
    const result = await api.get(`http://localhost:5050/apartment/${id}`);
    return result.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["apartment", `${id}`],
    queryFn: handleGetApartment,
  });

  console.log({ data });

  if (isLoading) {
    return (
      <RouteContent
        sectionStyle={{ alignItems: "center", justifyContent: "center" }}
      >
        <CircularProgress size={64} />
      </RouteContent>
    );
  }

  return (
    <RouteContent>
      <h1>{`Apartment details ${id}`}</h1>
    </RouteContent>
  );
};
