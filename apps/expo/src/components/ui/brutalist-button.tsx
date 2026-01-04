import * as React from "react";
import { Pressable, type PressableProps, Text } from "react-native";
import { cn } from "@/libs/utils";

interface BrutalistButtonProps extends PressableProps {
  variant?: "default" | "dark" | "outline";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
  className?: string;
}

const BrutalistButton = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  BrutalistButtonProps
>(
  (
    { className, variant = "default", size = "default", children, ...props },
    ref,
  ) => {
    const variantClasses = {
      default: "bg-white",
      dark: "bg-black",
      outline: "bg-transparent",
    };

    const sizeClasses = {
      default: "h-12 px-8",
      sm: "h-10 px-6",
      lg: "h-14 px-10",
    };

    const textVariantClasses = {
      default: "text-black",
      dark: "text-white",
      outline: "text-black",
    };

    const textSizeClasses = {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-base",
    };

    return (
      <Pressable
        ref={ref}
        className={cn(
          "items-center justify-center border-2 border-black",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
        {...props}
      >
        {typeof children === "string" ? (
          <Text
            className={cn(
              "font-bold uppercase tracking-wide",
              textVariantClasses[variant],
              textSizeClasses[size],
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);
BrutalistButton.displayName = "BrutalistButton";

export { BrutalistButton };
