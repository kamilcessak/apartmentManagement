import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Divider, Typography, useTheme } from "@mui/material";
import { MdChevronLeft } from "react-icons/md";

import { RouteContent } from "../../components/common";
import api from "../../services/api";
import { getApartmentIdFromAddress } from "../../utils/apartment";
import { capitalizeFirstLetter } from "../../utils/common";
import {
  DetailsInformationItem,
  DetailsSectionHeader,
} from "../../components/apartment";

export const ApartmentDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

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
      <main className="flex flex-1 flex-col gap-4 mt-4">
        <section className="flex flex-col gap-4 border-2 border-gray-700 rounded-md p-4">
          <DetailsSectionHeader
            title={"Main informations"}
            onClickButton={() => {}}
          />
          <Divider />
          <div className="flex flex-1 flex-row items-center gap-4 justify-between w-full">
            <DetailsInformationItem
              title={"Apartment ID"}
              subtitle={getApartmentIdFromAddress(data.address)}
            />
            <DetailsInformationItem
              title={"Address"}
              subtitle={`${data.address}`}
            />
            <DetailsInformationItem
              title={"Metric"}
              subtitle={`${data.metric} m²`}
            />
            <DetailsInformationItem
              title={"Rooms count"}
              subtitle={`${data.roomCount}`}
            />
            <DetailsInformationItem
              title={"Monthly cost"}
              subtitle={`${data.monthlyCost} zł`}
            />
            <DetailsInformationItem
              title={"Status"}
              subtitle={`${!!data.isAvailable}`}
              content={
                <div
                  className="text-white p-1 rounded-md"
                  style={{
                    backgroundColor: data.isAvailable
                      ? theme.palette.success.main
                      : theme.palette.warning.main,
                  }}
                >
                  {data.isAvailable ? "Available" : "Unavailable"}
                </div>
              }
            />
          </div>
        </section>
        <section className="flex flex-col gap-4 border-2 border-gray-700 rounded-md p-4">
          <DetailsSectionHeader
            title={"Description"}
            onClickButton={() => {}}
          />
          <Divider />
          <Typography variant="body1">{data.description}</Typography>
        </section>
      </main>
    </RouteContent>
  );
};
