import { FC } from "react";
import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  editMode?: boolean;
  onClickButton?: () => void;
  editModeButton?: React.ReactNode;
  hideEditButton?: boolean;
};

export const DetailsSectionHeader: FC<Props> = ({
  title,
  onClickButton,
  editMode,
  editModeButton,
  hideEditButton,
}) => {
  return (
    <div className="flex flex-1 flex-row items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="flex flex-row gap-2">
        {editMode && editModeButton ? editModeButton : null}
        {!hideEditButton ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onClickButton}
          >
            {editMode ? (
              <>
                <X />
                Close edit
              </>
            ) : (
              <>
                <Pencil />
                Edit
              </>
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
