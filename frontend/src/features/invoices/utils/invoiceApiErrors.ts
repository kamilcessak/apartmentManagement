import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

/** Maps landlord invoice POST/PATCH API errors to user-facing messages */
export function getInvoiceApiErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackTranslationKey: string
): string {
  if (
    isAxiosError(error) &&
    error.response?.data &&
    typeof error.response.data === "object" &&
    "code" in error.response.data &&
    (error.response.data as { code?: string }).code === "NO_RENTAL_AGREEMENT"
  ) {
    return t("invoices.form.errors.noRentalAgreement");
  }
  if (
    isAxiosError(error) &&
    error.response?.data &&
    typeof error.response.data === "object" &&
    "error" in error.response.data
  ) {
    const msg = (error.response.data as { error?: unknown }).error;
    if (typeof msg === "string" && msg.length > 0) {
      return msg;
    }
  }
  return t(fallbackTranslationKey);
}
