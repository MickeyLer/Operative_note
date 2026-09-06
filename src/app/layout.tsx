import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "HPB KKH - ระบบงานหน่วยศัลยศาสตร์ตับ ถุงน้ำดี และตับอ่อน รพ.ขอนแก่น",
  description: "ระบบบันทึกข้อมูลและติดตามการใช้งาน Stapler หน่วยศัลยศาสตร์ตับ ถุงน้ำดี และตับอ่อน โรงพยาบาลขอนแก่น",
  icons: {
    icon: "/hpb-logo.jpg",
    shortcut: "/hpb-logo.jpg",
    apple: "/hpb-logo.jpg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "HPB KKH",
    statusBarStyle: "black-translucent",
  },
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
