import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EPU Smart Lookup - Tra cứu sinh viên",
  description: "Hệ thống tra cứu thông tin sinh viên Đại học Điện lực",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning // 👈 Thêm dòng này
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning // 👈 Và thêm dòng này
        className="min-h-full flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}