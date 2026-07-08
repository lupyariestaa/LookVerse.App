export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  image: string;
  gallery: string[];
  originalPrice: number;
  salePrice: number;
  discount: number; // e.g. 40 for 40% OFF
  rating: number;
  reviewCount: number;
  badge?: 'New' | 'Sale' | 'Trending' | 'Best Seller';
  marketplace: 'Shopee' | 'TikTok Shop' | 'Tokopedia' | 'Lazada';
  affiliateUrl: string;
  highlights?: string[];
  specifications?: Record<string, string>;
  status?: 'Published' | 'Draft';
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string; // Lucide icon name
  image: string;
  description: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

export type Theme = 'light' | 'dark';

export interface WebsiteSettings {
  siteName: string;
  siteSuffix: string;
  siteDescription: string;
  establishedYear: string;
  versionString: string;
  locationString: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  metaTitle: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  shopeeUrl: string;
  tokopediaUrl: string;
  lazadaUrl: string;
  tiktokShopUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  defaultTheme: 'light' | 'dark';
  enableMaintenanceMode: boolean;
  enableClickLogging: boolean;
}

