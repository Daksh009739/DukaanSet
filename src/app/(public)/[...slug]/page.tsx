import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/marketing";
import { publicPageContent, type PublicPageKey } from "@/components/marketing-content";

type Props = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() { return Object.keys(publicPageContent).map(key => ({ slug: key.split("/") })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const key = slug.join("/") as PublicPageKey;
  if (!Object.hasOwn(publicPageContent, key)) return {};
  const page = publicPageContent[key];
  return { title: { absolute: `${page.title} | DukaanSet` }, description: page.description, alternates: { canonical: `/${key}` }, openGraph: { title: `${page.title} | DukaanSet`, description: page.description, images: ["/social.png"] } };
}

export default async function DetailPage({ params }: Props) {
  const { slug } = await params;
  const key = slug.join("/") as PublicPageKey;
  if (!Object.hasOwn(publicPageContent, key)) notFound();
  return <PublicPage pageKey={key}/>;
}
