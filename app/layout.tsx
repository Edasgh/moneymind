import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import Providers from "@/components/Providers";
import NotificationToaster from "@/components/NotificationToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "MoneyMind 🧠 - AI-powered behavioral finance coach that helps users understand why they make bad money decisions and how to fix them",
  description:
    "MoneyMind is an AI-powered behavioral finance coach that helps users understand why they make bad money decisions and how to fix them",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
        suppressContentEditableWarning
      >
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <body
          className="min-h-full flex flex-col overflow-x-hidden"
          suppressHydrationWarning
          suppressContentEditableWarning
        >
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <NotificationToaster/>
          {children}
        </body>
      </html>
    </Providers>
  );
}
