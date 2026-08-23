import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-11 w-full min-w-0 rounded-sm bg-elevated px-3 text-base text-fg shadow-[var(--shadow-border)] outline-none transition-[box-shadow,background-color] duration-150 ease-out placeholder:text-subtle",
          "focus-visible:ring-2 focus-visible:ring-ring/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
