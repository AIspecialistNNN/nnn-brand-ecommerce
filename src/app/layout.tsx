import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/layout/CartDrawer";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "NNN BRAND — Less Noise. More Identity. | 3D Men's Luxury Fashion",
  description:
    "NNN BRAND — Contemporary architectural men's fashion with real-time 3D garment viewer, 360-degree photography, UZS pricing, Click & Payme checkout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#F7F7F5]">
        <StoreProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
