import { cn } from "@/lib/utils";

interface CardEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * CardEyebrow - A small label that hangs off the top center of a card
 * Uses Boogaloo font for a playful, gamified look
 * Should be used within a relatively-positioned parent (like a Card)
 */
export function CardEyebrow({ children, className }: CardEyebrowProps) {
  return (
    <div
      className={cn(
        "absolute -top-4 left-1/2 -translate-x-1/2",
        "px-4 py-1 rounded-full",
        "bg-background border-2 border-border",
        "text-sm font-['Boogaloo'] tracking-wide",
        "whitespace-nowrap",
        "shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
