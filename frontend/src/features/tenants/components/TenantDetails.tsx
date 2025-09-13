import { TextField } from "@mui/material";
import { Control, Controller } from "react-hook-form";

import { TenantDetailsFormType, TenantType } from "../types/tenant.type";

type Props = {
  editMode: boolean;
  control: Control<TenantDetailsFormType>;
  data: TenantType;
  isPending: boolean;
};

export const TenantDetails = ({
  editMode,
  control,
  data,
  isPending,
}: Props) => {
  if (!editMode) {
    return (
      <>
        <div className="flex flex-row justify-between flex-1">
          <TextField
            label="First name"
            variant="standard"
            value={data.firstName}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <TextField
            label="Last name"
            variant="standard"
            value={data.lastName}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <TextField
            label="E-mail"
            variant="standard"
            value={data.email}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <TextField
            label="Phone number"
            variant="standard"
            value={data.phoneNumber}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </div>
        <div>
          <TextField
            label="Invitation code"
            variant="standard"
            value={data.invitationCode}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </div>
      </>
    );
  }
  return (
    <>
      <Controller
        control={control}
        name="firstName"
        render={({ field, fieldState }) => (
          <TextField
            disabled={isPending}
            label="First name"
            value={field.value}
            onChange={field.onChange}
            variant="outlined"
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="lastName"
        render={({ field, fieldState }) => (
          <TextField
            disabled={isPending}
            label="Last name"
            value={field.value}
            onChange={field.onChange}
            variant="outlined"
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            disabled={isPending}
            label="Email"
            value={field.value}
            onChange={field.onChange}
            variant="outlined"
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phoneNumber"
        render={({ field, fieldState }) => (
          <TextField
            disabled={isPending}
            label="Phone number"
            value={field.value}
            onChange={field.onChange}
            variant="outlined"
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </>
  );
};
