import type { Metadata } from "next";

import { privatePageRobots } from "@/features/seo/metadata";

export const metadata: Metadata = { robots: privatePageRobots };

export default function CustomerAccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
