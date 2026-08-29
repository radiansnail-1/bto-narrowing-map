interface JsonLdProps {
  value: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function JsonLd({ value }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, '\\u003c') }}
    />
  );
}
