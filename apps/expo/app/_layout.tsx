import "../src/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryProvider } from "@/providers/query-provider";

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </QueryProvider>
  );
}
