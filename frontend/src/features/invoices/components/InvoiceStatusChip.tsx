import { FC } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";

import { InvoiceType } from "../types";

type Props = {
  invoice: Pick<InvoiceType, "isPaid" | "dueDate">;
};

export const InvoiceStatusChip: FC<Props> = ({ invoice }) => {
  const { t } = useTranslation();

  if (invoice.isPaid) {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
        {t("invoices.status.paid")}
      </Badge>
    );
  }

  const isOverdue = dayjs(invoice.dueDate).isBefore(dayjs(), "day");
  if (isOverdue) {
    return <Badge variant="destructive">{t("invoices.status.overdue")}</Badge>;
  }

  return (
    <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">
      {t("invoices.status.unpaid")}
    </Badge>
  );
};
