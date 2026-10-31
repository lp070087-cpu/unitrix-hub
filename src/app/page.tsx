import type { Metadata } from "next";
import { SiteNav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { Services } from "@/components/site/services";
import { Portfolio } from "@/components/site/portfolio";
import { Process } from "@/components/site/process";
import { Differentials } from "@/components/site/differentials";
import { HubDemo } from "@/components/site/hub-demo";
import { LeadSection } from "@/components/site/lead-section";
import { FaqSection } from "@/components/site/faq-section";
import { FinalCta } from "@/components/site/final-cta";
import { SiteFooter } from "@/components/site/footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Unitrix — Tecnologia sob medida para negócios que querem ir além" },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Unitrix",
    url: "/",
    title: "Unitrix — Tecnologia sob medida",
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image", title: "Unitrix — Tecnologia sob medida", description: siteConfig.description },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    ...(siteConfig.contact.instagram ? { sameAs: [siteConfig.contact.instagram] } : {}),
  };

  return (
    <div className="overflow-x-clip">
      <SiteNav />
      <main id="conteudo">
        <Hero />
        <Services />
        <Portfolio />
        <Process />
        <Differentials />
        <HubDemo />
        <LeadSection />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
