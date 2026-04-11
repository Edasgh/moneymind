"use client";
import { SessionProvider } from "next-auth/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { FinanceProvider } from "@/hooks/useFinance";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: any) {
  return (
    <ConvexProvider client={convex}>
      <SessionProvider>
        <FinanceProvider>
        {children}
        </FinanceProvider>
        </SessionProvider>
    </ConvexProvider>
  );
}
