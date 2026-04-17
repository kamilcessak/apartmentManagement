export type TenantType = {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  invitationCode: string;
  isActive: boolean;
  owner: string;
  email: string;
  phoneNumber: string;
  userID?: string | null;
  assignedApartmentID?: string | null;
};

export type TenantDetailsFormType = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type TenantsListType = {
  _id: string;
  firstName: string;
  lastName: string;
};
