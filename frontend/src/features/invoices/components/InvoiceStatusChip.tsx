import { FC } from "react";
import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";

import { InvoiceType } from "../types";

type Props = {
  invoice: Pick<InvoiceType, "isPaid" | "dueDate">;
};

export const InvoiceStatusChip: FC<Props> = ({ invoice }) => {
  if (invoice.isPaid) {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
        Paid
      </Badge>
    );
  }

  const isOverdue = dayjs(invoice.dueDate).isBefore(dayjs(), "day");
  if (isOverdue) {
    return <Badge variant="destructive">Overdue</Badge>;
  }

  return (
    <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">
      Unpaid
    </Badge>
  );
};
