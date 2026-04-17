export type DashboardKpi = {
  apartmentsCount: number;
  occupiedCount: number;
  occupancyRate: number;
  activeRentalsCount: number;
  mrr: number;
  overdueAmount: number;
  overdueCount: number;
};

export type UpcomingInvoicePayment = {
  _id: string;
  kind: "invoice";
  apartmentID: string;
  amount: number;
  dueDate: string;
  invoiceID: string;
  invoiceType: string;
};

export type UpcomingRentalPayment = {
  _id: string;
  kind: "rental";
  apartmentID: string;
  tenantID: string;
  amount: number;
  dueDate: string;
  rentalPaymentDay: number;
};

export type UpcomingPayment = UpcomingInvoicePayment | UpcomingRentalPayment;

export type ExpiringLease = {
  _id: string;
  apartmentID: string;
  tenantID: string;
  endDate: string;
  monthlyCost: number;
};

export type DashboardResponse = {
  kpi: DashboardKpi;
  upcomingPayments: UpcomingPayment[];
  expiringLeases: ExpiringLease[];
};
