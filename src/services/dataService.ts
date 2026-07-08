import { Product, Category, Brand, Banner, WebsiteSettings } from '../types';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';
import brandsData from '../data/brands.json';
import bannersData from '../data/banners.json';

// Helper functions for localStorage persistence
const getStoredData = <T>(key: string, defaultData: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(stored) as T[];
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultData;
  }
};

const saveStoredData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

export const dataService = {
  /**
   * Fetch all products, with optional filtering
   */
  async getProducts(filters?: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<Product[]> {
    const products = getStoredData<Product>('lookverse_products', productsData as unknown as Product[]);
    let result = [...products];

    if (!filters) return result;

    const { category, brand, search, minPrice, maxPrice, sort } = filters;

    if (category) {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (brand) {
      result = result.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (minPrice !== undefined) {
      result = result.filter(p => p.salePrice >= minPrice);
    }

    if (maxPrice !== undefined) {
      result = result.filter(p => p.salePrice <= maxPrice);
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case 'newest':
          // Just as is or filter by custom rules
          break;
        case 'popular':
          result.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'price-low':
          result.sort((a, b) => a.salePrice - b.salePrice);
          break;
        case 'price-high':
          result.sort((a, b) => b.salePrice - a.salePrice);
          break;
        case 'discount':
          result.sort((a, b) => b.discount - a.discount);
          break;
        default:
          break;
      }
    }

    return result;
  },

  /**
   * Fetch a single product by its slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = getStoredData<Product>('lookverse_products', productsData as unknown as Product[]);
    const found = products.find(p => p.slug === slug);
    return found || null;
  },

  /**
   * Fetch all categories
   */
  async getCategories(): Promise<Category[]> {
    return getStoredData<Category>('lookverse_categories', categoriesData as Category[]);
  },

  /**
   * Fetch a category by its slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories();
    const found = categories.find(c => c.slug === slug);
    return found || null;
  },

  /**
   * Fetch all brands
   */
  async getBrands(): Promise<Brand[]> {
    return getStoredData<Brand>('lookverse_brands', brandsData as Brand[]);
  },

  /**
   * Fetch a brand by its slug
   */
  async getBrandBySlug(slug: string): Promise<Brand | null> {
    const brands = await this.getBrands();
    const found = brands.find(b => b.slug === slug);
    return found || null;
  },

  /**
   * Fetch all editorial banners
   */
  async getBanners(): Promise<Banner[]> {
    return getStoredData<Banner>('lookverse_banners', bannersData as Banner[]);
  },

  /**
   * Fetch related products (e.g. products in the same category, excluding itself)
   */
  async getRelatedProducts(productSlug: string, limit = 4): Promise<Product[]> {
    const products = getStoredData<Product>('lookverse_products', productsData as unknown as Product[]);
    const targetProduct = products.find(p => p.slug === productSlug);
    if (!targetProduct) return [];

    return products
      .filter(p => p.slug !== productSlug && p.category === targetProduct.category)
      .slice(0, limit);
  },

  // CMS update methods for operations and synchronization
  saveProducts(products: Product[]): void {
    saveStoredData('lookverse_products', products);
  },

  saveCategories(categories: Category[]): void {
    saveStoredData('lookverse_categories', categories);
  },

  saveBrands(brands: Brand[]): void {
    saveStoredData('lookverse_brands', brands);
  },

  saveBanners(banners: Banner[]): void {
    saveStoredData('lookverse_banners', banners);
  },

  /**
   * Fetch all system activity logs
   */
  getActivityLogs(): { id: string; text: string; time: string; badge: string; timestamp: number }[] {
    const defaultLogs = [
      { id: '1', text: 'Category "Footwear" updated by Super Admin', time: '10 mins ago', badge: 'UPDATE', timestamp: Date.now() - 600000 },
      { id: '2', text: 'Product "Air Jordan 1 Low Retro" details curated', time: '1 hour ago', badge: 'ADD', timestamp: Date.now() - 3600000 },
      { id: '3', text: 'Banner campaign "Mid Season Sale" scheduled successfully', time: '3 hours ago', badge: 'PUBLISH', timestamp: Date.now() - 10800000 },
      { id: '4', text: 'System configuration saved in browser storage', time: '1 day ago', badge: 'CONFIG', timestamp: Date.now() - 86400000 }
    ];
    try {
      const stored = localStorage.getItem('lookverse_activities');
      if (!stored) {
        localStorage.setItem('lookverse_activities', JSON.stringify(defaultLogs));
        return defaultLogs;
      }
      return JSON.parse(stored);
    } catch (e) {
      return defaultLogs;
    }
  },

  /**
   * Log a new administrative activity
   */
  logActivity(text: string, badge: 'ADD' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'CONFIG' | 'AUTH' | 'SYNC'): void {
    const logs = this.getActivityLogs();
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      badge,
      time: 'Just now',
      timestamp: Date.now()
    };
    
    // Maintain a max of 40 logs
    const updated = [newLog, ...logs].slice(0, 40);
    try {
      localStorage.setItem('lookverse_activities', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving activity logs', e);
    }
  },

  /**
   * Fetch Website Settings configuration
   */
  getSettings(): WebsiteSettings {
    const defaultSettings: WebsiteSettings = {
      siteName: 'LOOKVERSE',
      siteSuffix: '_',
      siteDescription: 'A premium editorial fashion & sneaker discovery deck. Curating high-conversion products from multiple verified affiliate marketplaces in a clean bold landscape.',
      establishedYear: '2026',
      versionString: 'V1.0.0 RELEASE CANDIDATE',
      locationString: 'Jakarta, Indonesia',
      email: 'support@lookverse.com',
      phone: '+62 812-3456-7890',
      whatsappUrl: 'https://wa.me/6281234567890',
      metaTitle: 'LookVerse - Premium Fashion & Sneaker Curation Portal',
      metaKeywords: 'sneakers, footwear, fashion curation, affiliate, shopee, tokopedia, lazada, tiktok shop',
      googleAnalyticsId: 'G-LVERSE2026',
      shopeeUrl: 'https://shopee.co.id',
      tokopediaUrl: 'https://tokopedia.com',
      lazadaUrl: 'https://lazada.co.id',
      tiktokShopUrl: 'https://tiktok.com',
      instagramUrl: 'https://instagram.com/lookverse',
      youtubeUrl: 'https://youtube.com/lookverse',
      twitterUrl: 'https://twitter.com/lookverse',
      defaultTheme: 'dark',
      enableMaintenanceMode: false,
      enableClickLogging: true
    };
    try {
      const stored = localStorage.getItem('lookverse_settings');
      if (!stored) {
        localStorage.setItem('lookverse_settings', JSON.stringify(defaultSettings));
        return defaultSettings;
      }
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (e) {
      return defaultSettings;
    }
  },

  /**
   * Save Website Settings configuration
   */
  saveSettings(settings: WebsiteSettings): void {
    try {
      localStorage.setItem('lookverse_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving website settings', e);
    }
  }
};
