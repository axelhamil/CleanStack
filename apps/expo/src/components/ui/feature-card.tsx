import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Text, View } from "react-native";
import { cn } from "@/libs/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "compact";
  className?: string;
}

const FeatureCard = React.forwardRef<View, FeatureCardProps>(
  ({ icon: Icon, title, description, variant = "default", className }, ref) => {
    if (variant === "compact") {
      return (
        <View
          ref={ref}
          className={cn("p-4 border-2 border-black bg-gray-50", className)}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 0,
            elevation: 4,
          }}
        >
          <View className="flex-row items-start gap-3">
            <View className="p-2 bg-black rounded-sm">
              <Icon size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold uppercase mb-1 text-black">
                {title}
              </Text>
              <Text className="text-sm text-gray-600 leading-5">
                {description}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View
        ref={ref}
        className={cn("p-5 border-2 border-black bg-white", className)}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
        }}
      >
        <Icon size={40} color="#000" strokeWidth={2.5} />
        <Text className="text-xl font-bold uppercase mt-4 mb-2 text-black">
          {title}
        </Text>
        <Text className="text-sm text-gray-600 leading-5">{description}</Text>
      </View>
    );
  },
);
FeatureCard.displayName = "FeatureCard";

export { FeatureCard };
