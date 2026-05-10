import { ApartmentType } from "@features/apartments/types/apartment.type";
import { InvoiceType, InvoicesSummary } from "@features/invoices/types";

export type LandlordContact = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string;
  street: string | null;
  buildingNumber: string | null;
  apartmentNumber: string | null;
  postalCode: string | null;
  city: string | null;
  bankAccountIban: string | null;
  bankName: string | null;
};

export type TenantActiveRental = {
  startDate: string;
  endDate: string;
  documents: string[];
  monthlyCost: number;
  rentalPaymentDay: number;
};

export type MyApartmentResponse = {
  apartment: ApartmentType;
  tenant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  landlord: LandlordContact | null;
  /** Active lease for this tenant, if any. */
  rental: TenantActiveRental | null;
};

export type MyInvoicesResponse = {
  invoices: InvoiceType[];
  summary: InvoicesSummary | null;
};

export type MyDocumentsResponse = {
  apartmentDocuments: string[];
  rentalDocuments: string[];
  invoiceDocuments: {
    _id: string;
    invoiceID: string;
    invoiceType: string;
    document: string | null;
    dueDate: string;
    amount: number;
  }[];
};
