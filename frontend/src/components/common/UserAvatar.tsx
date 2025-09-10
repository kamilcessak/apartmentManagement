import { Typography } from "@mui/material";

import { TenantType } from "@features/tenants/types/tenant.type";
import { getRandomHexColor } from "@utils/index";

export const UserAvatar = ({ firstName, lastName }: TenantType) => {
  return (
    <div
      className="flex flex-row w-14 h-14 items-center justify-center rounded-full"
      style={{ backgroundColor: getRandomHexColor() }}
    >
      <Typography variant="h5" className="text-gray-100">
        {firstName.charAt(0)}
      </Typography>
      <Typography variant="h5" className="text-gray-100">
        {lastName.charAt(0)}
      </Typography>
    </div>
  );
};
