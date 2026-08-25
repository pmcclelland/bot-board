import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { FormEvent, ReactNode } from "react";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  onSubmit,
  className,
}: ModalProps) {
  const frame = (
    <>
      <div className="shrink-0 border-b border-border px-6 py-5">
        <DialogTitle>{title}</DialogTitle>
        {description ? (
          <DialogDescription className="mt-1.5">{description}</DialogDescription>
        ) : null}
      </div>
      <div className="dialog-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end",
          "max-md:pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        {footer}
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 flex w-[calc(100%-2rem)] max-w-md max-h-[90dvh] flex-col overflow-hidden rounded-dialog bg-surface text-fg shadow-[var(--shadow-lift)] outline-none",
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0",
            "max-md:max-h-[92dvh] max-md:rounded-t-dialog max-md:rounded-b-none",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.96]",
            className,
          )}
        >
          {onSubmit ? (
            <form
              noValidate
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              {frame}
            </form>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">{frame}</div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
