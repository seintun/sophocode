'use client';

import { useEffect } from 'react';

interface JsonLdSchema {
  '@context': 'https://schema.org' | string;
  [key: string]: unknown;
}

interface JsonLdSchemaProps {
  schema: JsonLdSchema;
}

/**
 * Injects JSON-LD structured data into the document head.
 * Content is static/compiled, so safe for use with JSON.stringify.
 */
export default function JsonLdSchema({ schema }: JsonLdSchemaProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'json-ld-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('json-ld-schema');
      if (existing) existing.remove();
    };
  }, [schema]);

  return null;
}
