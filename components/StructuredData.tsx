type StructuredDataInput = Record<string, unknown> | Array<unknown>;

export function StructuredData({ data }: { data: StructuredDataInput }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
