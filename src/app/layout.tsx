import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const manrope = localFont({
  src: [
    { path: "../../public/fonts/manrope-400.ttf", weight: "400" },
    { path: "../../public/fonts/manrope-600.ttf", weight: "600" },
    { path: "../../public/fonts/manrope-700.ttf", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  title: "VANTELIER — Wear your own way",
  description:
    "Streetwear de siluetas amplias. Descubre los esenciales oversize de Vantelier.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
