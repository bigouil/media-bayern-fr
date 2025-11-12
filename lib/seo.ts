export function generateArticleSchema(article: {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  coverImage: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: `https://media-bayern.fr${article.coverImage}`,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Media Bayern",
      logo: {
        "@type": "ImageObject",
        url: "https://media-bayern.fr/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://media-bayern.fr/article/${article.slug}`,
    },
  };
}

type JsonObject = Record<string, unknown>;

export function generateSportsEventSchema(match: {
  homeTeam: string;
  awayTeam: string;
  date: string;
  competition: string;
  stadium: string;
  homeScore?: number | null;
  awayScore?: number | null;
}) {
  const schema: JsonObject = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.homeTeam} vs ${match.awayTeam}`,
    startDate: match.date,
    location: {
      "@type": "Place",
      name: match.stadium,
    },
    homeTeam: {
      "@type": "SportsTeam",
      name: match.homeTeam,
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: match.awayTeam,
    },
    sport: "Football",
  };

  if (match.homeScore !== null && match.awayScore !== null) {
    schema["eventStatus"] = "https://schema.org/EventScheduled";
    schema["offers"] = {
      "@type": "Offer",
      availability: "https://schema.org/SoldOut",
    };
  }

  return schema;
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "FC Bayern Munich",
    alternateName: "Bayern Munich",
    url: "https://media-bayern.fr",
    logo: "https://media-bayern.fr/logo.png",
    description:
      "Site d'actualités et d'informations sur le FC Bayern Munich - Bundesliga, Ligue des Champions, mercato et plus encore.",
    sameAs: [
      "https://www.facebook.com/FCBayern",
      "https://twitter.com/FCBayern",
      "https://www.instagram.com/fcbayern",
    ],
    foundingDate: "1900-02-27",
    sport: "Football",
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://media-bayern.fr${item.url}`,
    })),
  };
}

export function generatePersonSchema(player: {
  name: string;
  position: string;
  nationality: string;
  age: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    jobTitle: player.position,
    nationality: {
      "@type": "Country",
      name: player.nationality,
    },
    memberOf: {
      "@type": "SportsTeam",
      name: "FC Bayern Munich",
    },
    sport: "Football",
  };
}
