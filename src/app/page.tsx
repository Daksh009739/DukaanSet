import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing";

export const metadata: Metadata = {
  title: { absolute: "DukaanSet — Apni Dukaan, Sab Set." },
  description: "Bills, stock and customer payments in one clear workspace. DukaanSet is a mobile-first business app for Indian grocery, hardware and vegetable shops.",
  alternates: { canonical: "/", languages: { en: "/", hi: "/hi" } },
  openGraph: { title: "DukaanSet — Apni Dukaan, Sab Set.", description: "Your business. All in one place.", images: ["/social.png"] },
};

export default function HomePage() { return <MarketingHome/>; }
