import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CardFlow - Flashcards Inteligentes",
  description: "Plataforma de estudos com flashcards inteligentes e IA de leitura",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.variable} antialiased bg-gray-900 text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
