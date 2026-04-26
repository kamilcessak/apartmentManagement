export type ApartmentType = {
  _id: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  description: string;
  documents: string[];
  equipment: string;
  isAvailable: boolean;
  metric: number;
  monthlyCost: number;
  owner: string;
  photos: string[];
  roomCount: number;
};

export type ApartmentListType = Pick<
  ApartmentType,
  | "_id"
  | "street"
  | "buildingNumber"
  | "apartmentNumber"
  | "postalCode"
  | "city"
>;
