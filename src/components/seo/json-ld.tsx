const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SouqFeed",
    url: baseUrl,
    description:
      "B2B supplier-discovery and live-stock-intelligence platform for Dubai's IT wholesale market.",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SouqFeed",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/feed?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
