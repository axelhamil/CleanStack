import type { ReactElement, ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
