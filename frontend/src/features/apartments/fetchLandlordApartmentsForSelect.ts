import api from "@services/api";

import type { ApartmentListType, ApartmentType } from "./types/apartment.type";

/**
 * All apartments owned by the landlord ({@link ApartmentListType} shape).
 * Unlike `/apartmentsList`, includes rented units — needed for invoices and invoice filters.
 */
export async function fetchLandlordApartmentsForSelect(): Promise<
  ApartmentListType[]
> {
  const { data } = await api.get<ApartmentType[]>("/apartments");
  return data.map(
    ({
      _id,
      street,
      buildingNumber,
      apartmentNumber,
      postalCode,
      city,
    }) => ({
      _id,
      street,
      buildingNumber,
      apartmentNumber,
      postalCode,
      city,
    })
  );
}
