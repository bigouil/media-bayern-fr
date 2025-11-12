export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  readTime?: number;
  featured?: boolean;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  competition: string;
  stadium?: string;
  status: "scheduled" | "live" | "finished";
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface NavigationItem {
  title: string;
  href: string;
}
