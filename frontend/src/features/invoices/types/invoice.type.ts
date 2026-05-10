export const INVOICE_TYPES = [
  "rent",
  "electricity",
  "water",
  "gas",
  "internet",
  "heating",
  "garbage",
  "other",
] as const;

export type InvoiceCategory = (typeof INVOICE_TYPES)[number];

/** Populated `tenantID` from GET invoice(s) */
export type InvoiceTenantPopulate = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
};

/** Populated `rentalID` from GET invoice */
export type InvoiceRentalPopulate = {
  _id: string;
  startDate: string;
  endDate: string;
};

export type InvoiceType = {
  _id: string;
  apartmentID: string;
  tenantID?: string | InvoiceTenantPopulate | null;
  rentalID?: string | InvoiceRentalPopulate | null;
  invoiceType: InvoiceCategory | string;
  amount: number;
  dueDate: string;
  uploadDate: string;
  paidDate: string | null;
  invoiceID: string;
  document: string | null;
  isPaid: boolean;
  owner: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InvoicesSummary = {
  total: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
  overdueCount: number;
};

export type ApartmentInvoicesResponse = {
  invoices: InvoiceType[];
  summary: InvoicesSummary;
};

export type InvoiceFilters = {
  search?: string;
  apartmentID?: string;
  /** undefined = all types */
  invoiceType?: string;
  isPaid?: "all" | "paid" | "unpaid";
  dueDateFrom?: string;
  dueDateTo?: string;
};
