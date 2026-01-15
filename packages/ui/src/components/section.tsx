"use client";

import * as React from "react";
import { cn } from "../libs/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "accent" | "inverted";
  containerSize?: "default" | "narrow" | "wide";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    { className, variant = "default", containerSize = "default", ...props },
    ref,
  ) => {
    const variantClasses = {
      default: "bg-background",
      muted: "bg-secondary/30",
      accent: "bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10",
      inverted: "bg-foreground text-background",
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
