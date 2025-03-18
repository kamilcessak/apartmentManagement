import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, useTheme } from "@mui/material";
import { MdChevronLeft } from "react-icons/md";

import { RouteContent } from "../../components/common";
import api from "../../services/api";
import { getApartmentIdFromAddress } from "../../utils/apartment";
import { capitalizeFirstLetter } from "../../utils/common";
import {
  DetailsDescriptionSection,
  DetailsPhotosSection,
  DetailsInformationsSection,
} from "../../components/apartment/details";

export const ApartmentDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const handleRefreshGetApartment = () => {
    queryClient.invalidateQueries({ queryKey: ["apartment", `${id}`] });
  };

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
    <RouteContent sectionStyle={{ height: "100vh" }}>
      <header className="flex flex-row items-center">
        <a className="cursor-pointer" onClick={() => navigate(-1)}>
          <MdChevronLeft size={51} />
        </a>
        <h1 className="text-3xl">
          {capitalizeFirstLetter(getApartmentIdFromAddress(data.address)) +
            " " +
            "Details"}
        </h1>
      </header>
      <main
        className="flex flex-1 flex-col gap-4 mt-4 overflow-y-scroll"
        style={{
          paddingRight: "8px",
          scrollbarWidth: "thin",
          scrollbarColor: `${theme.palette.gray.main} transparent`,
          "&::WebkitScrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::WebkitScrollbarTrack": {
            background: "transparent",
            marginRight: "8px",
          },
          "&::WebkitScrollbarThumb": {
            backgroundColor: theme.palette.gray.main,
            borderRadius: "4px",
          },
        }}
      >
        <DetailsInformationsSection data={data} />
        <DetailsDescriptionSection description={data.description} />
        <DetailsPhotosSection
          photos={data.photos}
          handleRefreshGetApartment={handleRefreshGetApartment}
        />
      </main>
    </RouteContent>
  );
};
