import * as React from "react";
import { cn } from "../libs/utils";

const BrutalistCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-3 border-black dark:border-white bg-white dark:bg-black",
      "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]",
      "p-6 transition-all hover:translate-x-[2px] hover:translate-y-[2px]",
      "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
      className,
    )}
    {...props}
  />
));
BrutalistCard.displayName = "BrutalistCard";

const BrutalistCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 mb-4", className)}
    {...props}
  />
));
BrutalistCardHeader.displayName = "BrutalistCardHeader";

const BrutalistCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold uppercase tracking-tight leading-none",
      className,
    )}
    {...props}
  />
));
BrutalistCardTitle.displayName = "BrutalistCardTitle";

const BrutalistCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
BrutalistCardDescription.displayName = "BrutalistCardDescription";

const BrutalistCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
BrutalistCardContent.displayName = "BrutalistCardContent";

const BrutalistCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center mt-4", className)}
    {...props}
  />
));
BrutalistCardFooter.displayName = "BrutalistCardFooter";

export {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardFooter,
  BrutalistCardHeader,
  BrutalistCardTitle,
};
