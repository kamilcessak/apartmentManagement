import type { InvoiceType } from "../types";

/** Resolved tenant from populated `tenantID` on invoice API responses */
export function formatInvoiceTenantLabel(invoice: InvoiceType): string | null {
  const raw = invoice.tenantID;
  if (raw && typeof raw === "object" && "firstName" in raw) {
    return `${raw.firstName} ${raw.lastName}`.trim();
  }
  return null;
}
