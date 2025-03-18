import { Divider } from "@mui/material";
import theme from "../../../css/muicss";
import { getApartmentIdFromAddress } from "../../../utils/apartment";
import { DetailsInformationItem } from "./DetailsInformationItem";
import { DetailsSectionHeader } from "./DetailsSectionHeader";

export const DetailsInformationsSection = ({ data }) => {
  return (
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
  );
};
