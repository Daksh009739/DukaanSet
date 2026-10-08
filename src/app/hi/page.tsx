import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing";

export const metadata: Metadata = {
  title: { absolute: "DukaanSet — अपनी दुकान, सब सेट।" },
  description: "बिल, स्टॉक और ग्राहकों का उधार एक जगह। किराना, हार्डवेयर और सब्ज़ी की दुकानों के रोज़ के कारोबार के लिए फोन पर आसान ऐप।",
  alternates: { canonical: "/hi", languages: { en: "/", hi: "/hi" } },
  openGraph: { title: "DukaanSet — अपनी दुकान, सब सेट।", description: "आपका कारोबार। सब एक जगह।", locale: "hi_IN", images: ["/social.png"] },
};

export default function HindiHomePage() { return <MarketingHome hindi/>; }
