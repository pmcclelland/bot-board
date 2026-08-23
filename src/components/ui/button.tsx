import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none select-none transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-fg shadow-[var(--shadow-border)] hover:bg-primary/90",
        secondary:
          "bg-elevated text-fg shadow-[var(--shadow-border)] hover:bg-elevated/80",
        ghost: "text-muted hover:bg-elevated hover:text-fg",
        outline:
          "bg-transparent text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
        danger: "bg-danger text-danger-fg hover:bg-danger/90",
      },
      size: {
        default: "h-11 px-4 pr-3.5",
        sm: "h-9 rounded-sm px-3 pr-2.5 text-sm",
        lg: "h-12 rounded-lg px-5",
        icon: "size-11",
        "icon-sm": "size-9",
      },
      static: {
        true: "",
        false: "active:not-disabled:scale-[0.96]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      static: false,
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, static: isStatic, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size, static: isStatic }),
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
