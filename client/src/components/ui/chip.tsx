import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent/80 border border-border",
        selected: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 px-2.5 py-1",
        lg: "h-9 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  selected?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, size, selected, onClick, ...props }, ref) => {
    return (
      <div
        className={cn(
          chipVariants({
            variant: selected ? "selected" : variant,
            size,
            className
          })
        )}
        ref={ref}
        onClick={onClick}
        role="button"
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(e as any);
          }
        }}
        {...props}
      />
    );
  }
);

Chip.displayName = "Chip";

export { Chip, chipVariants };
