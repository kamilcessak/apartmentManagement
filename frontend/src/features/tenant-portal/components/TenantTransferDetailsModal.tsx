import { FC, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";

import type { LandlordContact } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  landlord: LandlordContact | null;
  /** Optional. When omitted the row is hidden (e.g. dashboard "transfer details" entry-point). */
  transferTitle?: string | null;
  /** When set, shown as the payment amount (e.g. invoice total). */
  amountFormatted?: string | null;
};

function landlordRecipientName(landlord: LandlordContact | null): string {
  if (!landlord) return "";
  const name = [landlord.firstName, landlord.lastName].filter(Boolean).join(" ");
  return name.trim() || landlord.email;
}

export const TenantTransferDetailsModal: FC<Props> = ({
  open,
  onClose,
  landlord,
  transferTitle,
  amountFormatted,
}) => {
  const { t } = useTranslation();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const recipient = landlordRecipientName(landlord);
  const iban = landlord?.bankAccountIban?.trim() || "";
  const bankName = landlord?.bankName?.trim() || "";

  const copy = async (label: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t("tenantPortal.transfer.copied", { label }));
    } catch {
      toast.error(t("tenantPortal.transfer.copyFailed"));
    }
  };

  const row = (key: string, label: string, value: string, copyable?: boolean) => (
    <div key={key} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 break-all text-sm font-medium text-slate-900">{value}</p>
        </div>
        {copyable && value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-600"
            aria-label={t("tenantPortal.transfer.copy")}
            onClick={() => copy(label, value)}
          >
            <Copy className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );

  const node = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-[2px]"
        role="presentation"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[101] flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <h2
            id={titleId}
            className="text-left text-base font-semibold leading-snug text-slate-900"
          >
            {t("tenantPortal.transfer.title")}
          </h2>
          <Button
            ref={closeRef}
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label={t("tenantPortal.transfer.close")}
            onClick={onClose}
          >
            <X className="size-5" strokeWidth={2} />
          </Button>
        </header>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
          {!iban && !recipient ? (
            <p className="text-sm text-slate-600">{t("tenantPortal.transfer.missingData")}</p>
          ) : null}
          {recipient
            ? row("recipient", t("tenantPortal.transfer.recipient"), recipient, true)
            : null}
          {iban ? row("iban", t("tenantPortal.transfer.iban"), iban, true) : null}
          {bankName
            ? row("bank", t("tenantPortal.transfer.bankName"), bankName, true)
            : null}
          {transferTitle
            ? row(
                "title",
                t("tenantPortal.transfer.transferTitle"),
                transferTitle,
                true
              )
            : null}
          {amountFormatted
            ? row("amount", t("tenantPortal.transfer.amount"), amountFormatted, true)
            : null}
          <p className="text-xs text-slate-500">{t("tenantPortal.transfer.hint")}</p>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
};
