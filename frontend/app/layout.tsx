import type { Metadata, Viewport } from "next";
import { Sora, Inter, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CellTech Distributor",
  description: "Premium mobile phone parts distribution - Your trusted source for quality components",
  keywords: ["mobile parts", "phone components", "distributor", "wholesale", "cell phone parts"],
  authors: [{ name: "CellTech" }],
  openGraph: {
    title: "CellTech Distributor",
    description: "Premium mobile phone parts distribution",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070A12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-ct-bg">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <FooterSection />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
