import { dataService } from './dataService';

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: string;
  size: string; // e.g. "142 KB"
  dimensions: string; // e.g. "600 x 600"
  category: 'product' | 'brand' | 'category' | 'banner' | 'upload';
  createdAt: string;
  isSystemDefault: boolean;
}

export interface MediaUsage {
  type: 'Product' | 'Category' | 'Brand' | 'Banner';
  name: string;
  id: string;
}

// Helper to extract a friendly name from Unsplash URLs or base64
const getFriendlyName = (url: string, index: number, cat: string): string => {
  if (url.startsWith('data:')) {
    return `custom_upload_${index + 1}.png`;
  }
  try {
    const parsed = new URL(url);
    // If unsplash, grab the photo ID from path
    if (parsed.hostname.includes('unsplash.com')) {
      const parts = parsed.pathname.split('/');
      const photoId = parts[parts.length - 1] || 'photo';
      return `${photoId.substring(0, 15)}.jpg`;
    }
  } catch (e) {
    // ignore
  }
  return `${cat}_asset_${index + 1}.jpg`;
};

// Helper to generate mock dimensions/size for system defaults
const getMockMetadata = (url: string) => {
  if (url.includes('w=1200')) {
    return { dimensions: '1200 x 800', size: '245 KB', type: 'image/jpeg' };
  } else if (url.includes('w=300')) {
    return { dimensions: '300 x 300', size: '32 KB', type: 'image/png' };
  } else {
    return { dimensions: '600 x 600', size: '115 KB', type: 'image/jpeg' };
  }
};

export const mediaService = {
  /**
   * Scans all system records and localStorage to retrieve the full media list
   */
  async getAllAssets(): Promise<MediaAsset[]> {
    const assets: MediaAsset[] = [];
    const urlMap = new Set<string>();

    // 1. Fetch from Products
    try {
      const products = await dataService.getProducts();
      let idx = 0;
      products.forEach(p => {
        if (p.image && !urlMap.has(p.image)) {
          urlMap.add(p.image);
          const meta = getMockMetadata(p.image);
          assets.push({
            id: `sys-p-${idx++}`,
            url: p.image,
            name: getFriendlyName(p.image, idx, 'product'),
            category: 'product',
            createdAt: 'System Base',
            isSystemDefault: true,
            ...meta
          });
        }
        // Gallery images
        if (p.gallery && Array.isArray(p.gallery)) {
          p.gallery.forEach(img => {
            if (img && !urlMap.has(img)) {
              urlMap.add(img);
              const meta = getMockMetadata(img);
              assets.push({
                id: `sys-p-g-${idx++}`,
                url: img,
                name: getFriendlyName(img, idx, 'product_gallery'),
                category: 'product',
                createdAt: 'System Base',
                isSystemDefault: true,
                ...meta
              });
            }
          });
        }
      });
    } catch (e) {
      console.error('Error scanning products for media', e);
    }

    // 2. Fetch from Categories
    try {
      const categories = await dataService.getCategories();
      let idx = 0;
      categories.forEach(c => {
        if (c.image && !urlMap.has(c.image)) {
          urlMap.add(c.image);
          const meta = getMockMetadata(c.image);
          assets.push({
            id: `sys-c-${idx++}`,
            url: c.image,
            name: getFriendlyName(c.image, idx, 'category'),
            category: 'category',
            createdAt: 'System Base',
            isSystemDefault: true,
            ...meta
          });
        }
      });
    } catch (e) {
      console.error('Error scanning categories for media', e);
    }

    // 3. Fetch from Brands
    try {
      const brands = await dataService.getBrands();
      let idx = 0;
      brands.forEach(b => {
        if (b.logo && !urlMap.has(b.logo)) {
          urlMap.add(b.logo);
          const meta = getMockMetadata(b.logo);
          assets.push({
            id: `sys-b-${idx++}`,
            url: b.logo,
            name: getFriendlyName(b.logo, idx, 'brand'),
            category: 'brand',
            createdAt: 'System Base',
            isSystemDefault: true,
            ...meta
          });
        }
      });
    } catch (e) {
      console.error('Error scanning brands for media', e);
    }

    // 4. Fetch from Banners
    try {
      const banners = await dataService.getBanners();
      let idx = 0;
      banners.forEach(b => {
        if (b.image && !urlMap.has(b.image)) {
          urlMap.add(b.image);
          const meta = getMockMetadata(b.image);
          assets.push({
            id: `sys-ban-${idx++}`,
            url: b.image,
            name: getFriendlyName(b.image, idx, 'banner'),
            category: 'banner',
            createdAt: 'System Base',
            isSystemDefault: true,
            ...meta
          });
        }
      });
    } catch (e) {
      console.error('Error scanning banners for media', e);
    }

    // 5. Fetch custom uploaded media
    try {
      const stored = localStorage.getItem('lookverse_custom_media');
      if (stored) {
        const customAssets = JSON.parse(stored) as MediaAsset[];
        customAssets.forEach(asset => {
          assets.push(asset);
        });
      }
    } catch (e) {
      console.error('Error loading custom media', e);
    }

    return assets;
  },

  /**
   * Find all system entities actively referencing an image URL
   */
  async getUsageReferences(url: string): Promise<MediaUsage[]> {
    const usages: MediaUsage[] = [];

    // Check Products
    try {
      const products = await dataService.getProducts();
      products.forEach(p => {
        const isMain = p.image === url;
        const isInGallery = p.gallery && p.gallery.includes(url);
        if (isMain || isInGallery) {
          usages.push({
            type: 'Product',
            name: p.name,
            id: p.id
          });
        }
      });
    } catch (e) {}

    // Check Categories
    try {
      const categories = await dataService.getCategories();
      categories.forEach(c => {
        if (c.image === url) {
          usages.push({
            type: 'Category',
            name: c.name,
            id: c.id
          });
        }
      });
    } catch (e) {}

    // Check Brands
    try {
      const brands = await dataService.getBrands();
      brands.forEach(b => {
        if (b.logo === url) {
          usages.push({
            type: 'Brand',
            name: b.name,
            id: b.id
          });
        }
      });
    } catch (e) {}

    // Check Banners
    try {
      const banners = await dataService.getBanners();
      banners.forEach(b => {
        if (b.image === url) {
          usages.push({
            type: 'Banner',
            name: b.title,
            id: b.id
          });
        }
      });
    } catch (e) {}

    return usages;
  },

  /**
   * Save custom media array
   */
  saveCustomMedia(assets: MediaAsset[]): void {
    try {
      localStorage.setItem('lookverse_custom_media', JSON.stringify(assets));
    } catch (e) {
      console.error('Error saving custom media to localStorage', e);
    }
  },

  /**
   * Add a newly uploaded image URL or base64 file
   */
  async addAsset(asset: Omit<MediaAsset, 'id' | 'createdAt' | 'isSystemDefault'>): Promise<MediaAsset> {
    const id = `custom-media-${Math.random().toString(36).substring(2, 9)}`;
    const newAsset: MediaAsset = {
      ...asset,
      id,
      createdAt: new Date().toLocaleString(),
      isSystemDefault: false
    };

    try {
      const stored = localStorage.getItem('lookverse_custom_media');
      const current = stored ? (JSON.parse(stored) as MediaAsset[]) : [];
      current.unshift(newAsset);
      localStorage.setItem('lookverse_custom_media', JSON.stringify(current));
    } catch (e) {
      console.error('Error adding new custom media asset', e);
    }

    return newAsset;
  },

  /**
   * Delete custom asset from lookverse_custom_media list
   */
  async deleteAsset(id: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem('lookverse_custom_media');
      if (!stored) return false;

      let current = JSON.parse(stored) as MediaAsset[];
      const exists = current.some(a => a.id === id);
      if (!exists) return false;

      current = current.filter(a => a.id !== id);
      localStorage.setItem('lookverse_custom_media', JSON.stringify(current));
      return true;
    } catch (e) {
      console.error('Error deleting custom media asset', e);
      return false;
    }
  },

  /**
   * Rename a custom media asset file name
   */
  async renameAsset(id: string, newName: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem('lookverse_custom_media');
      if (!stored) return false;

      const current = JSON.parse(stored) as MediaAsset[];
      const asset = current.find(a => a.id === id);
      if (!asset) return false;

      asset.name = newName;
      localStorage.setItem('lookverse_custom_media', JSON.stringify(current));
      return true;
    } catch (e) {
      console.error('Error renaming custom media asset', e);
      return false;
    }
  }
};
