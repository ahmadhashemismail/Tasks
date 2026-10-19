import { Suspense } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow",
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}