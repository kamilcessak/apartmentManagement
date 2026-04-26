export type ApartmentAddressParts = {
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
};

const s = (v: string | undefined | null) => (v ?? "").trim();

/** Single-line street + numbers (e.g. for list cells). */
export const formatApartmentStreetLine = (
  a: Pick<ApartmentAddressParts, "street" | "buildingNumber" | "apartmentNumber">
): string => {
  const apt = s(a.apartmentNumber);
  const base = `${s(a.street)} ${s(a.buildingNumber)}`.trim();
  return apt ? `${base}/${apt}` : base;
};

export const formatApartmentFullAddress = (a: ApartmentAddressParts): string =>
  `${formatApartmentStreetLine(a)}, ${s(a.postalCode)} ${s(a.city)}`.trim();

/**
 * Compact label used across lists (last word of street + building[/apt]).
 * Replaces legacy parsing of a single `address` string.
 */
export const getApartmentShortLabel = (
  a: Pick<ApartmentAddressParts, "street" | "buildingNumber" | "apartmentNumber">
): string => {
  const street = s(a.street);
  const building = s(a.buildingNumber);
  const words = street.split(/\s+/).filter(Boolean);
  const lastWord = (words[words.length - 1] || street).toLowerCase();
  const b = building.toLowerCase();
  const apt = s(a.apartmentNumber);
  const suffix = apt ? `${b}/${apt.toLowerCase()}` : b;
  return `${lastWord}${suffix}`;
};
