import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../libs/utils";

const brutalistButtonVariants = cva(
  "inline-flex items-center justify-center font-bold uppercase tracking-wide transition-all " +
    "border-3 border-black dark:border-white active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:text-white dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]",
        dark: "bg-black text-white shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] dark:bg-white dark:text-black dark:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
        outline:
          "bg-transparent border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
      },
      size: {
        default: "h-12 px-8 text-sm",
        sm: "h-10 px-6 text-xs",
        lg: "h-14 px-10 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface BrutalistButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brutalistButtonVariants> {
  asChild?: boolean;
}

const BrutalistButton = React.forwardRef<
  HTMLButtonElement,
  BrutalistButtonProps
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(brutalistButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
BrutalistButton.displayName = "BrutalistButton";

export { BrutalistButton, brutalistButtonVariants };
