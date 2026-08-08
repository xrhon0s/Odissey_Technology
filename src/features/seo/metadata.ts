import type { Metadata } from "next";

export const privatePageRobots: Metadata["robots"] = {
  follow: false,
  googleBot: {
    follow: false,
    index: false,
  },
  index: false,
};

export function canonicalPath(path: string): Metadata["alternates"] {
  return { canonical: path };
}
