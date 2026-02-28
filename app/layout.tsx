import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "resmd",
  description: "Plain text resume builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900">{children}</body>
    </html>
  );
}
