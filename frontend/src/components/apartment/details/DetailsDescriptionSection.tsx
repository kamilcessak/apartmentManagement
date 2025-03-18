import { Divider, Typography } from "@mui/material";
import { DetailsSectionHeader } from "./DetailsSectionHeader";

export const DetailsDescriptionSection = ({ description }) => {
  return (
    <section className="flex flex-col gap-4 border-2 border-gray-700 rounded-md p-4">
      <DetailsSectionHeader title={"Description"} onClickButton={() => {}} />
      <Divider />
      <Typography variant="body1">{description}</Typography>
    </section>
  );
};
