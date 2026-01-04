"use client";

import * as React from "react";
import { cn } from "../libs/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "inverted";
  containerSize?: "default" | "narrow" | "wide";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    { className, variant = "default", containerSize = "default", ...props },
    ref,
  ) => {
    const variantClasses = {
      default: "bg-white dark:bg-black",
      muted: "bg-gray-50 dark:bg-gray-950",
      inverted: "bg-black dark:bg-white",
    };

    const containerClasses = {
      default: "max-w-5xl",
      narrow: "max-w-4xl",
      wide: "max-w-6xl",
    };

    return (
      <section
        ref={ref}
        className={cn(
          "py-24 relative overflow-hidden",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "container mx-auto px-4 relative z-10",
            containerClasses[containerSize],
          )}
        >
          {props.children}
        </div>
      </section>
    );
  },
);
Section.displayName = "Section";

export { Section };
