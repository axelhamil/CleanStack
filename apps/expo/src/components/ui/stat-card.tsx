import * as React from "react";
import { Text, View } from "react-native";
import { cn } from "@/libs/utils";

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

const StatCard = React.forwardRef<View, StatCardProps>(
  ({ value, label, className }, ref) => {
    return (
      <View
        ref={ref}
        className={cn("border-2 border-gray-300 p-3 items-center", className)}
      >
        <Text className="text-lg font-black text-black mb-1">{value}</Text>
        <Text className="text-xs font-medium uppercase text-gray-500">
          {label}
        </Text>
      </View>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatCard };
