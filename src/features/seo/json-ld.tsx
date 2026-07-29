type JsonLdValue =
  | boolean
  | JsonLdValue[]
  | null
  | number
  | string
  | undefined
  | { [key: string]: JsonLdValue };

export function serializeJsonLd(data: JsonLdValue): string {
  const serialized = JSON.stringify(data) ?? "null";
  return serialized
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
