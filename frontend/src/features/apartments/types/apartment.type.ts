export type ApartmentType = {
  _id: string;
  address: string;
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

export type ApartmentListType = {
  _id: string;
  address: string;
};
