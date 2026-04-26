import { type LucideIcon } from "lucide-react";
import { type FC } from "react";

type Props = {
  icon: LucideIcon;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const DashboardWidgetEmptyState: FC<Props> = ({
  icon: Icon,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex min-h-[150px] w-full flex-grow flex-col items-center justify-center py-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Icon
          className="h-10 w-10 shrink-0 text-gray-400"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="max-w-sm text-sm text-gray-500">{message}</p>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};
