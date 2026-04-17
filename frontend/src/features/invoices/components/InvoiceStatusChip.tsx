import { FC } from "react";
import { Chip } from "@mui/material";
import dayjs from "dayjs";

import { InvoiceType } from "../types";

type Props = {
  invoice: Pick<InvoiceType, "isPaid" | "dueDate">;
};

export const InvoiceStatusChip: FC<Props> = ({ invoice }) => {
  if (invoice.isPaid) {
    return <Chip size="small" color="success" label="Paid" />;
  }

  const isOverdue = dayjs(invoice.dueDate).isBefore(dayjs(), "day");
  if (isOverdue) {
    return <Chip size="small" color="error" label="Overdue" />;
  }

  return <Chip size="small" color="warning" label="Unpaid" />;
};
