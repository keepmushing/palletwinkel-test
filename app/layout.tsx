import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "'t Palletje | Pallets en kisten op maat",
  description: "Houten verpakkingen op maat voor industrie, export en logistiek.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
