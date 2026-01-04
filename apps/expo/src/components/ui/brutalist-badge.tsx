import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Text, View } from "react-native";
import { cn } from "@/libs/utils";

interface BrutalistBadgeProps {
  variant?: "default" | "gradient" | "subtle";
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const BrutalistBadge = React.forwardRef<View, BrutalistBadgeProps>(
  ({ className, variant = "default", icon: Icon, children }, ref) => {
    const variantClasses = {
      default: "bg-yellow-300 border-2 border-black",
      gradient: "bg-blue-100 border-2 border-black",
      subtle: "border-2 border-gray-300",
    };

    return (
      <View
        ref={ref}
        className={cn(
          "flex-row items-center gap-2 px-4 py-2",
          variantClasses[variant],
          className,
        )}
        style={
          variant === "default"
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 3,
              }
            : undefined
        }
      >
        {Icon && <Icon size={16} color="#000" strokeWidth={2.5} />}
        <Text className="font-bold uppercase text-xs tracking-wide text-black">
          {children}
        </Text>
      </View>
    );
  },
);
BrutalistBadge.displayName = "BrutalistBadge";

export { BrutalistBadge };
