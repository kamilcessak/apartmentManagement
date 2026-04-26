import { FC } from "react";
import { Search, X } from "lucide-react";

import { ApartmentListType } from "@features/apartments/types/apartment.type";
import { getApartmentShortLabel } from "@utils/apartment";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { InvoiceFilters } from "../types";

type Props = {
  value: InvoiceFilters;
  onChange: (next: InvoiceFilters) => void;
  apartments: ApartmentListType[];
};

const ALL_APARTMENTS = "__ALL_APARTMENTS__";

export const InvoicesFilters: FC<Props> = ({
  value,
  onChange,
  apartments,
}) => {
  const hasActiveFilters =
    Boolean(value.search?.trim()) ||
    Boolean(value.apartmentID) ||
    (value.isPaid && value.isPaid !== "all") ||
    Boolean(value.dueDateFrom) ||
    Boolean(value.dueDateTo);

  const clearFilters = () =>
    onChange({
      search: "",
      apartmentID: undefined,
      isPaid: "all",
      dueDateFrom: undefined,
      dueDateTo: undefined,
    });

  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Szukaj po numerze faktury..."
          value={value.search ?? ""}
          onChange={(event) =>
            onChange({ ...value, search: event.target.value })
          }
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          value={value.apartmentID ?? ALL_APARTMENTS}
          onValueChange={(next) =>
            onChange({
              ...value,
              apartmentID: next === ALL_APARTMENTS ? undefined : next,
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Mieszkanie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_APARTMENTS}>Wszystkie mieszkania</SelectItem>
            {apartments.map((apartment) => (
              <SelectItem key={apartment._id} value={apartment._id}>
                {getApartmentShortLabel(apartment)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.isPaid ?? "all"}
          onValueChange={(next) =>
            onChange({
              ...value,
              isPaid: next as InvoiceFilters["isPaid"],
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="paid">Opłacone</SelectItem>
            <SelectItem value="unpaid">Nieopłacone</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 rounded-md border border-input px-2 py-1 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Termin</span>
          <Input
            type="date"
            aria-label="Termin od"
            value={value.dueDateFrom ? value.dueDateFrom.slice(0, 10) : ""}
            onChange={(event) =>
              onChange({
                ...value,
                dueDateFrom: event.target.value
                  ? new Date(event.target.value).toISOString()
                  : undefined,
              })
            }
            className="h-8 w-[140px] border-0 shadow-none focus-visible:ring-0"
          />
          <span className="text-slate-400">—</span>
          <Input
            type="date"
            aria-label="Termin do"
            value={value.dueDateTo ? value.dueDateTo.slice(0, 10) : ""}
            onChange={(event) =>
              onChange({
                ...value,
                dueDateTo: event.target.value
                  ? new Date(event.target.value).toISOString()
                  : undefined,
              })
            }
            className="h-8 w-[140px] border-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-500 hover:text-slate-900"
          >
            <X />
            Wyczyść
          </Button>
        ) : null}
      </div>
    </section>
  );
};
