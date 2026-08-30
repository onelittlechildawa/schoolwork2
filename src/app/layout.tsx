import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspiration Wall - 灵感卡片墙",
  description: "基于 Next.js 与 Cloudflare D1 驱动的极简灵感墙与知识库",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="bg-slate-950 min-h-screen text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
