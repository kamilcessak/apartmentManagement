export type UserRole = "Landlord" | "Tenant";

export type CurrentUserTenant = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;
  assignedApartmentID: string | null;
  owner: string;
};

export type CurrentUserApartment = {
  _id: string;
  address: string;
  isAvailable: boolean;
  roomCount: number;
  monthlyCost: number;
};

export type CurrentUser = {
  _id: string;
  email: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isEmailVerified: boolean;
  invitationCode?: string;
  apartments?: CurrentUserApartment[];
  tenant?: CurrentUserTenant | null;
  createdAt?: string;
  updatedAt?: string;
};
