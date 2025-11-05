import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import "./tiptap.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CardFlow - Flashcards Inteligentes",
  description: "Plataforma de estudos com flashcards inteligentes e IA de leitura",
  themeColor: "#111827",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" style={{ colorScheme: 'dark', backgroundColor: '#111827' }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#111827" />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body { 
              background-color: #111827 !important; 
              color: #f9fafb !important;
            }
          `
        }} />
      </head>
      <body className={`${inter.variable} antialiased bg-gray-900 text-white min-h-screen`} style={{ backgroundColor: '#111827' }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
                document.documentElement.style.backgroundColor = '#111827';
                document.body.style.backgroundColor = '#111827';
              })();
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
