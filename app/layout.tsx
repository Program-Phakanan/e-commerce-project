import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-commerce Management System",
  description: "ระบบจัดการร้านค้าออนไลน์ครบวงจร - จัดการสินค้า คำสั่งซื้อ ลูกค้า และคลังสินค้า",
};

import MobileNav from "@/components/MobileNav";

// ... existing imports ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <MobileNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
