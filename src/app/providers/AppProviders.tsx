import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth";
import { ThemeProvider } from "@/features/theme-switcher";
import { RouterProvider } from "@/shared/routing";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueueProvider } from "@/features/generation-queue";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <QueueProvider>
            <RouterProvider>{children}</RouterProvider>
          </QueueProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
