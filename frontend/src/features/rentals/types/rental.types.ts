export type RentalType = {
  _id: string;
  apartmentID: string;
  description: string;
  documents: string[];
  endDate: string;
  isActive: boolean;
  monthlyCost: number;
  owner: string;
  photos: string[];
  rentalPaymentDay: number;
  securityDeposit: number;
  startDate: string;
  tenantID: string;
};
