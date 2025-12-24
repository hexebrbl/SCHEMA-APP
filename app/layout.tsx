import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google"; 
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCHEMA",
  description: "Idea generation tool for creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${mono.className} bg-[#0a0a0a] text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}