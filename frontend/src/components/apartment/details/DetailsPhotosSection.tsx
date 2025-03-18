import { Divider } from "@mui/material";
import { FileItem } from "../../files";
import { DetailsSectionHeader } from "./DetailsSectionHeader";
import { FC, useState } from "react";

type Props = {
  photos: string[];
  handleRefreshGetApartment: () => void;
};

export const DetailsPhotosSection: FC<Props> = ({
  photos,
  handleRefreshGetApartment,
}) => {
  const [editMode, seteditMode] = useState(false);

  return (
    <section
      className={`flex flex-col gap-4 border-2 ${
        editMode ? "border-green-600" : "border-gray-700"
      } rounded-md p-4`}
    >
      <DetailsSectionHeader
        title={"Photos"}
        editMode={editMode}
        onClickButton={() => seteditMode((prev) => !prev)}
      />
      <Divider />
      <div className="flex flex-row flex-wrap gap-4">
        {photos.map((e, i) => (
          <FileItem
            key={`photo-file-${e}-${i}`}
            name={e}
            fileName={e}
            isPhoto={e.includes("png") || e.includes("jpg")}
            isDocument={e.includes("pdf")}
            containerStyle={{ flex: "0 0 calc(25% - 12px)" }}
            editMode={editMode}
            onSuccess={handleRefreshGetApartment}
          />
        ))}
      </div>
    </section>
  );
};
