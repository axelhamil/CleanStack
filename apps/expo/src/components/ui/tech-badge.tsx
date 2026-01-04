import * as React from "react";
import { Text, View } from "react-native";
import { cn } from "@/libs/utils";

interface TechBadgeProps {
  children: React.ReactNode;
  className?: string;
}

const TechBadge = React.forwardRef<View, TechBadgeProps>(
  ({ className, children }, ref) => {
    return (
      <View
        ref={ref}
        className={cn("px-4 py-2 border-2 border-gray-300", className)}
      >
        <Text className="text-sm font-medium text-gray-700">{children}</Text>
      </View>
    );
  },
);
TechBadge.displayName = "TechBadge";

export { TechBadge };
