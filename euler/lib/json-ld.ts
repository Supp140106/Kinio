type JsonLd = Record<string, unknown>

export function webApplicationJsonLd({
  url,
  name,
  description,
}: {
  url: string
  name: string
  description: string
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    description,
    applicationCategory: "Multimedia",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  }
}

export function organizationJsonLd({
  url,
  name,
  description,
}: {
  url: string
  name: string
  description: string
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    description,
    sameAs: [],
  }
}

export function faqPageJsonLd(
  questions: { question: string; answer: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  }
}

export function videoObjectJsonLd({
  name,
  description,
  contentUrl,
  thumbnailUrl,
  uploadDate,
  duration,
}: {
  name: string
  description: string
  contentUrl: string
  thumbnailUrl?: string
  uploadDate: string
  duration?: string
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    contentUrl,
    thumbnailUrl: thumbnailUrl ?? contentUrl,
    uploadDate,
    ...(duration ? { duration } : {}),
  }
}

export function breadcrumbListJsonLd(
  items: { name: string; url: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function itemListJsonLd(
  items: { name: string; url: string; description?: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: item.name,
        url: item.url,
        ...(item.description ? { description: item.description } : {}),
      },
    })),
  }
}

export function productJsonLd({
  name,
  description,
  offers,
}: {
  name: string
  description: string
  offers: { price: number; priceCurrency: string; billingInterval: string }[]
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    offers: offers.map((offer) => ({
      "@type": "Offer",
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        billingDuration: 1,
        billingInterval: offer.billingInterval,
        price: offer.price,
        priceCurrency: offer.priceCurrency,
        unitText: `/${offer.billingInterval}`,
      },
    })),
  }
}
