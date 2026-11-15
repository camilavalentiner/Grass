import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { GrassBackground } from "@/components/GrassBackground";
import { Nav } from "@/components/Nav";
import { SyncAgent } from "@/components/SyncAgent";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grass",
  description: "A gentle place to use your time well.",
  applicationName: "Grass",
  appleWebApp: { capable: true, title: "Grass", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#fbf8ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lora.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <GrassBackground />
        {children}
        <Nav />
        <SyncAgent />
      </body>
    </html>
  );
}
