import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/sections/footer";
import { Providers } from "@/components/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Reponote - Generate Detailed READMEs with AI",
  description: "Reponote leverages AI to create professional, comprehensive README files for your projects in seconds.",
  openGraph: {
    title: "Reponote - Generate Detailed READMEs with AI",
    description: "Reponote leverages AI to create professional, comprehensive README files for your projects in seconds.",
    url: "https://reponote.org",
    siteName: "Reponote",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reponote - AI-Powered README Generator",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reponote - Generate Detailed READMEs with AI",
    description: "Reponote leverages AI to create professional, comprehensive README files for your projects in seconds.",
    images: ["/og-image.png"],
    creator: "@reponote",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
