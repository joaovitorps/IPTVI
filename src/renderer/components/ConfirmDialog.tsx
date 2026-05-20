import { cn } from "@renderer/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed",
        "inset-0",
        "z-50",
        "flex",
        "items-center",
        "justify-center",
        "bg-black/50",
        "backdrop-blur-sm",
      )}
      onClick={onCancel}
    >
      <div
        className={cn(
          "bg-zinc-900",
          "border",
          "border-zinc-700",
          "rounded-2xl",
          "p-6",
          "max-w-md",
          "w-full",
          "mx-4",
          "shadow-2xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={cn("text-xl", "font-bold", "text-white", "mb-4")}>
          {title}
        </h3>
        <p className={cn("text-zinc-300", "mb-6")}>{message}</p>
        <div className={cn("flex", "justify-end", "gap-3")}>
          <button
            onClick={onCancel}
            className={cn(
              "px-4",
              "py-2",
              "rounded-lg",
              "bg-zinc-800",
              "hover:bg-zinc-700",
              "text-zinc-300",
              "transition-colors",
            )}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4",
              "py-2",
              "rounded-lg",
              "bg-amber-500",
              "hover:bg-amber-600",
              "text-zinc-950",
              "font-bold",
              "transition-colors",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
