import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Text, View } from "react-native";
import { cn } from "@/libs/utils";
import { BrutalistBadge } from "./brutalist-badge";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    icon?: LucideIcon;
    text: string;
  };
  inverted?: boolean;
  className?: string;
}

const SectionHeader = React.forwardRef<View, SectionHeaderProps>(
  ({ title, subtitle, badge, inverted = false, className }, ref) => {
    return (
      <View ref={ref} className={cn("items-center mb-8", className)}>
        {badge && (
          <View className="mb-4">
            <BrutalistBadge icon={badge.icon} variant="gradient">
              {badge.text}
            </BrutalistBadge>
          </View>
        )}

        <Text
          className={cn(
            "text-2xl font-black uppercase text-center mb-3",
            inverted ? "text-white" : "text-black",
          )}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            className={cn(
              "text-base text-center max-w-sm leading-6",
              inverted ? "text-gray-300" : "text-gray-600",
            )}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  },
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
