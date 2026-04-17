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

export type InvoiceType = {
  _id: string;
  apartmentID: string;
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
  isPaid?: "all" | "paid" | "unpaid";
  dueDateFrom?: string;
  dueDateTo?: string;
};
