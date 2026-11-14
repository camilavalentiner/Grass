import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { GrassSwitch } from "@/components/GrassSwitch";

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
        <GrassSwitch />
        {children}
      </body>
    </html>
  );
}
