import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { cn } from "@/libs/utils";

interface CodeBlockProps {
  code: string;
  title?: string;
  className?: string;
}

const CodeBlock = React.forwardRef<View, CodeBlockProps>(
  ({ code, title, className }, ref) => {
    return (
      <View
        ref={ref}
        className={cn("bg-gray-900 border-2 border-black p-4", className)}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 0,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <View className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
          {title && (
            <Text className="ml-2 text-green-400 font-mono text-xs">
              {title}
            </Text>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text className="text-green-400 font-mono text-xs leading-5">
            {code}
          </Text>
        </ScrollView>
      </View>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
