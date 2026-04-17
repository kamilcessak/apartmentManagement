import { ApartmentType } from "@features/apartments/types/apartment.type";
import { InvoiceType, InvoicesSummary } from "@features/invoices/types";

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
