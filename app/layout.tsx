import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./components.css";
import "./components2.css";
import "./responsive.css";
import "./practice.css";
import "./practice-responsive.css";
import "./non-neon.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pipeline-academy.etozinplayz.chatgpt.site"),
  title: {
    default: "Pipeline Academy — Learn How Code Reaches Production",
    template: "%s · Pipeline Academy",
  },
  description:
    "An interactive CI/CD course and pipeline simulator for beginner developers.",
  openGraph: {
    title: "Pipeline Academy",
    description:
      "Learn how code reaches production with lessons, quizzes, and realistic pipeline simulations.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Pipeline Academy — Learn how code reaches production",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pipeline Academy",
    description: "Learn how code reaches production.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
