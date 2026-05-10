import type { TFunction } from "i18next";

/** Localized label for `invoice.invoiceType` (backend stores snake/lowercase keys). */
export function getInvoiceTypeLabel(
  t: TFunction,
  invoiceType: string
): string {
  return t(`invoices.types.${invoiceType}`, {
    defaultValue: invoiceType,
  });
}
