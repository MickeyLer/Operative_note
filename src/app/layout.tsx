import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KKH Digital Operative Note",
  description: "Khon Kaen Hospital Digital Operative Note Web Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  );
}
