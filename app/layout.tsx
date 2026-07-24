import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trainora AI — The expert intelligence network",
  description: "Verified human expertise for training, evaluating, and improving advanced AI systems.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
