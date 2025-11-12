import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { WhatsAppChat } from "@/components/shared/whatsapp-chat";
import { ThemeScript } from "@/components/shared/theme-script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Ittihad Placement - Find Your Dream Job with Placement Guarantee",
  description: "Revolutionary Ittihad placement with pay-to-apply model and placement guarantees",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeScript />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <WhatsAppChat 
            phoneNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971502697904"}
            message={process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Hello! I need help with Ittihad Placement."}
          />
        </Providers>
      </body>
    </html>
  );
}

