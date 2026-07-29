import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/features/seo/json-ld";
import { buildStoreStructuredData } from "@/features/seo/structured-data";

export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={buildStoreStructuredData()} />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
