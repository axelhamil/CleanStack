import * as React from "react";
import { View } from "react-native";
import { cn } from "@/libs/utils";

interface SectionProps {
  variant?: "default" | "muted" | "inverted";
  children: React.ReactNode;
  className?: string;
}

const Section = React.forwardRef<View, SectionProps>(
  ({ variant = "default", children, className }, ref) => {
    const variantClasses = {
      default: "bg-white",
      muted: "bg-gray-50",
      inverted: "bg-black",
    };

    return (
      <View
        ref={ref}
        className={cn("py-12 px-4", variantClasses[variant], className)}
      >
        {children}
      </View>
    );
  },
);
Section.displayName = "Section";

export { Section };
