import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "FitPulse - Track Your Fitness Journey",
  description: "Comprehensive fitness tracking application. Monitor weight, food intake, calories burned, set goals, and analyze your progress with detailed reports.",
  keywords: "fitness tracker, weight loss, calorie counter, exercise tracking, health goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="grid-bg" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
