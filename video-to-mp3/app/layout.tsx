import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyMP3 | Free Video to MP3 Converter",
  description:
    "Convert MP4, MOV, MKV, AVI, WEBM and other video formats to high-quality MP3 audio directly in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}