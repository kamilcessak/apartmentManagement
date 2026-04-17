import { FC } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

import { ApartmentListType } from "@features/apartments/types/apartment.type";
import { getApartmentIdFromAddress } from "@utils/apartment";

import { InvoiceFilters } from "../types";

type Props = {
  value: InvoiceFilters;
  onChange: (next: InvoiceFilters) => void;
  apartments: ApartmentListType[];
};

export const InvoicesFilters: FC<Props> = ({
  value,
  onChange,
  apartments,
}) => {
  const handleDueDateFromChange = (next: Dayjs | null) => {
    onChange({
      ...value,
      dueDateFrom: next ? next.toISOString() : undefined,
    });
  };

  const handleDueDateToChange = (next: Dayjs | null) => {
    onChange({
      ...value,
      dueDateTo: next ? next.toISOString() : undefined,
    });
  };

  const clearFilters = () =>
    onChange({
      apartmentID: undefined,
      isPaid: "all",
      dueDateFrom: undefined,
      dueDateTo: undefined,
    });

  return (
    <section className="flex flex-row flex-wrap gap-4 items-end border-2 border-gray-300 rounded-md p-4">
      <FormControl style={{ minWidth: 220 }} size="small">
        <InputLabel id="invoices-filter-apartment">Apartment</InputLabel>
        <Select
          labelId="invoices-filter-apartment"
          label="Apartment"
          value={value.apartmentID ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              apartmentID: event.target.value
                ? String(event.target.value)
                : undefined,
            })
          }
        >
          <MenuItem value="">All apartments</MenuItem>
          {apartments.map((apartment) => (
            <MenuItem key={apartment._id} value={apartment._id}>
              {getApartmentIdFromAddress(apartment.address)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: 160 }} size="small">
        <InputLabel id="invoices-filter-paid">Status</InputLabel>
        <Select
          labelId="invoices-filter-paid"
          label="Status"
          value={value.isPaid ?? "all"}
          onChange={(event) =>
            onChange({
              ...value,
              isPaid: event.target.value as InvoiceFilters["isPaid"],
            })
          }
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="unpaid">Unpaid</MenuItem>
        </Select>
      </FormControl>
      <DatePicker
        label="Due from"
        value={value.dueDateFrom ? dayjs(value.dueDateFrom) : null}
        onChange={handleDueDateFromChange}
        format="DD.MM.YYYY"
        slotProps={{
          textField: {
            size: "small",
          } as React.ComponentProps<typeof TextField>,
        }}
      />
      <DatePicker
        label="Due to"
        value={value.dueDateTo ? dayjs(value.dueDateTo) : null}
        onChange={handleDueDateToChange}
        format="DD.MM.YYYY"
        slotProps={{
          textField: {
            size: "small",
          } as React.ComponentProps<typeof TextField>,
        }}
      />
      <Button
        variant="outlined"
        size="small"
        style={{ textTransform: "none" }}
        onClick={clearFilters}
      >
        Clear filters
      </Button>
    </section>
  );
};
