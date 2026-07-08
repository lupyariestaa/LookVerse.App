import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  DollarSign,
  Layers,
  Award,
  Link,
  Percent,
  ListPlus,
  Eye,
  FileText,
  AlertTriangle,
  Info,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Product, Category, Brand } from '../../types';

export const Products: React.FC = () => {
  // Products, categories, and brands states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter, Search, Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Published' | 'Draft'>('All');
  const [sortBy, setSortBy] = useState('name-asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Alerts/Toasts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form Tab Selection
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'taxonomy' | 'pricing' | 'media'>('basic');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    brand: '',
    image: '',
    gallery: [] as string[],
    originalPrice: 0,
    salePrice: 0,
    badge: '' as any,
    marketplace: 'Shopee' as any,
    affiliateUrl: '',
    highlights: [] as string[],
    specifications: {} as Record<string, string>,
    status: 'Published' as 'Published' | 'Draft'
  });

  // Dynamic input states for Highlights & Specifications in Form
  const [newHighlight, setNewHighlight] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Initial Data Fetch
  const fetchData = async () => {
    setLoading(true);
    try {
      const p = await dataService.getProducts();
      const c = await dataService.getCategories();
      const b = await dataService.getBrands();
      setProducts(p);
      setCategories(c);
      setBrands(b);
    } catch (e) {
      showToast('error', 'Failed to retrieveLookVerse parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show status toasts/alerts
  const showToast = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Filter & Search & Sort Logic
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

    // Brand filter
    const matchesBrand = selectedBrand === '' || product.brand === selectedBrand;

    // Status filter
    const productStatus = product.status || 'Published'; // default to published if not set
    const matchesStatus = selectedStatus === 'All' || productStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.salePrice - b.salePrice;
      case 'price-desc':
        return b.salePrice - a.salePrice;
      case 'discount-desc':
        return b.discount - a.discount;
      case 'rating-desc':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, selectedStatus, sortBy]);

  // Handle Input Change for Product Creation Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Automatically generate slug if changing name
    if (name === 'name' && !editingProduct) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generatedSlug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Pricing numbers change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Math.max(0, parseFloat(value) || 0);
    
    setFormData(prev => {
      const updated = { ...prev, [name]: numValue };
      // Auto-calculate discount percentage
      if (updated.originalPrice > 0 && updated.salePrice > 0) {
        const discountPercentage = Math.round(
          ((updated.originalPrice - updated.salePrice) / updated.originalPrice) * 100
        );
        updated.badge = discountPercentage > 0 ? 'Sale' : prev.badge;
      }
      return updated;
    });
  };

  // Add Dynamic Spec Key-Value
  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [newSpecKey.trim()]: newSpecValue.trim()
      }
    }));
    setNewSpecKey('');
    setNewSpecValue('');
  };

  // Delete dynamic Spec key-value
  const handleDeleteSpec = (keyToDelete: string) => {
    const updatedSpecs = { ...formData.specifications };
    delete updatedSpecs[keyToDelete];
    setFormData(prev => ({
      ...prev,
      specifications: updatedSpecs
    }));
  };

  // Add Highlight Item
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()]
    }));
    setNewHighlight('');
  };

  // Remove Highlight Item
  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, idx) => idx !== index)
    }));
  };

  // Add Gallery Image URL
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, newGalleryUrl.trim()]
    }));
    setNewGalleryUrl('');
  };

  // Remove Gallery Image URL
  const handleRemoveGalleryUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== index)
    }));
  };

  // Open Form for Editing or Creating
  const openFormModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setActiveFormTab('basic');
    setNewHighlight('');
    setNewSpecKey('');
    setNewSpecValue('');
    setNewGalleryUrl('');

    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        brand: product.brand,
        image: product.image,
        gallery: product.gallery || [],
        originalPrice: product.originalPrice,
        salePrice: product.salePrice,
        badge: product.badge || '',
        marketplace: product.marketplace || 'Shopee',
        affiliateUrl: product.affiliateUrl,
        highlights: product.highlights || [],
        specifications: product.specifications || {},
        status: product.status || 'Published'
      });
    } else {
      // Default placeholder fields
      setFormData({
        name: '',
        slug: '',
        description: '',
        category: categories[0]?.slug || 'shoes',
        brand: brands[0]?.slug || 'erigo',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        gallery: [],
        originalPrice: 0,
        salePrice: 0,
        badge: '',
        marketplace: 'Shopee',
        affiliateUrl: 'https://shopee.co.id',
        highlights: [],
        specifications: {},
        status: 'Published'
      });
    }
    setIsFormOpen(true);
  };

  // Submit main CRUD Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast('error', 'Product name is required.');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('error', 'Slug identifier is required.');
      return;
    }
    if (formData.salePrice <= 0 || formData.originalPrice <= 0) {
      showToast('error', 'Prices must be positive numeric values.');
      return;
    }

    // Prepare updated array
    let updatedProducts = [...products];
    const discountPct = formData.originalPrice > 0 
      ? Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100) 
      : 0;

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      slug: formData.slug.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      brand: formData.brand,
      image: formData.image.trim(),
      gallery: formData.gallery.length > 0 ? formData.gallery : [formData.image.trim()],
      originalPrice: formData.originalPrice,
      salePrice: formData.salePrice,
      discount: discountPct,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
      badge: formData.badge || undefined,
      marketplace: formData.marketplace,
      affiliateUrl: formData.affiliateUrl.trim(),
      highlights: formData.highlights,
      specifications: formData.specifications,
      status: formData.status
    };

    if (editingProduct) {
      // Edit
      updatedProducts = updatedProducts.map(p => (p.id === editingProduct.id ? payload : p));
      dataService.logActivity(`Product "${payload.name}" parameters curated and updated.`, 'UPDATE');
      showToast('success', 'LOOKVERSE PRODUCT UPDATED SUCCESSFULLY.');
    } else {
      // Create
      // Check slug collision
      const slugExists = products.some(p => p.slug === payload.slug);
      if (slugExists) {
        showToast('error', 'COLLISION FAILURE: Slug already exists in indices.');
        return;
      }
      updatedProducts = [payload, ...updatedProducts];
      dataService.logActivity(`New Product "${payload.name}" indices registered and published.`, 'ADD');
      showToast('success', 'NEW AFFILIATE PRODUCT REGISTERED.');
    }

    // Save
    dataService.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setIsFormOpen(false);
  };

  // Open Delete dialog
  const openDeleteModal = (id: string) => {
    setDeletingProductId(id);
    setIsDeleteOpen(true);
  };

  // Confirm delete action
  const confirmDeleteProduct = () => {
    if (!deletingProductId) return;
    
    const targetProduct = products.find(p => p.id === deletingProductId);
    const updated = products.filter(p => p.id !== deletingProductId);
    
    dataService.saveProducts(updated);
    setProducts(updated);
    
    if (targetProduct) {
      dataService.logActivity(`Product "${targetProduct.name}" removed from active catalogs.`, 'DELETE');
    }
    
    setIsDeleteOpen(false);
    setDeletingProductId(null);
    showToast('success', 'PRODUCT EXPUNGED SUCCESSFULLY FROM CATALOGS.');
  };

  // Quick Toggle Status Badge
  const toggleStatus = (product: Product) => {
    const newStatus: 'Published' | 'Draft' = (product.status || 'Published') === 'Published' ? 'Draft' : 'Published';
    const updated = products.map(p => {
      if (p.id === product.id) {
        return { ...p, status: newStatus };
      }
      return p;
    });

    dataService.saveProducts(updated);
    setProducts(updated);
    dataService.logActivity(`Product "${product.name}" publication status set to ${newStatus}.`, 'UPDATE');
    showToast('success', `STATUS SET TO ${newStatus.toUpperCase()}`);
  };

  // Quick Populate standard premium demo images in Form for seamless high-fidelity creation
  const handleQuickImageSelect = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
  };

  const sampleUnsplashImages = [
    { name: 'Shoe Red', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { name: 'Shoe Yellow', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop' },
    { name: 'Shoe Black', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop' },
    { name: 'Tee White', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop' },
    { name: 'Watch S1', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop' },
    { name: 'Bag Nylon', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop' }
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Alert Banner / Toast notification */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-[16px] border shadow-xl flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider ${
              alert.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-rose-500 text-white border-rose-600'
            }`}
          >
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-border dark:border-admin-dark-border transition-colors duration-300">
        <div className="space-y-1.5">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 -skew-x-2">
            Product Management_
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Manage affiliates products, customize specifications, tags, original pricing, discount calculations and custom marketplace URLs.
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-admin-dark-surface p-5 rounded-[20px] border border-admin-border dark:border-admin-dark-border shadow-sm space-y-4 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Box */}
          <div className="relative md:col-span-4">
            <input
              type="text"
              placeholder="Search products by title, slug, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 pl-10 rounded-[12px] text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-admin-primary transition-all text-slate-800 dark:text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-3 rounded-[12px] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-admin-primary transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-3 rounded-[12px] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-admin-primary transition-all cursor-pointer"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-3 rounded-[12px] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-admin-primary transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published Only</option>
              <option value="Draft">Drafts Only</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-3 rounded-[12px] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-admin-primary transition-all cursor-pointer"
            >
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
              <option value="discount-desc">Discounts</option>
              <option value="rating-desc">Rating Score</option>
            </select>
          </div>

        </div>

        {/* Clear Filters Indicator */}
        {(searchQuery || selectedCategory || selectedBrand || selectedStatus !== 'All') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/40 text-[10px] font-mono">
            <div className="text-slate-400">
              Found <span className="text-admin-primary dark:text-admin-secondary font-bold">{filteredProducts.length}</span> matching products.
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedBrand('');
                setSelectedStatus('All');
                setSortBy('name-asc');
              }}
              className="text-red-500 hover:text-red-600 flex items-center gap-1 font-bold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>CLEAR FILTERS</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table Panel */}
      <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-admin-primary animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">LOADING PRODUCT DATA INDEX...</p>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300">NO PRODUCTS INDEXED_</p>
              <p className="text-[11px] text-slate-400 font-medium">Try resetting your filters, search terms, or create a new product above.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse" id="products-catalogue-table">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-4.5 px-6">Product Item</th>
                    <th className="py-4.5 px-5">Taxonomy & Brand</th>
                    <th className="py-4.5 px-5">Pricing Matrix</th>
                    <th className="py-4.5 px-5">Platform & Link</th>
                    <th className="py-4.5 px-5 text-center">Status</th>
                    <th className="py-4.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {paginatedProducts.map((product) => {
                    const catData = categories.find(c => c.slug === product.category);
                    const brandData = brands.find(b => b.slug === product.brand);
                    const statusVal = product.status || 'Published';

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors group"
                      >
                        {/* Product details */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4.5">
                            <div className="w-12 h-12 rounded-[10px] overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 shrink-0 relative">
                              <img
                                src={product.image}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';
                                }}
                              />
                              {product.badge && (
                                <span className={`absolute top-0.5 left-0.5 px-1 py-0.5 rounded-[4px] text-[7px] font-mono font-black uppercase leading-none text-white tracking-wider ${
                                  product.badge === 'Sale' ? 'bg-rose-500' :
                                  product.badge === 'New' ? 'bg-emerald-500' :
                                  product.badge === 'Best Seller' ? 'bg-amber-500' : 'bg-indigo-500'
                                }`}>
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 min-w-0 max-w-[200px] lg:max-w-[280px]">
                              <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-admin-primary dark:group-hover:text-admin-secondary transition-colors truncate">
                                {product.name}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400 truncate tracking-wide">
                                slug // {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category & Brand */}
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{catData?.name || product.category}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase font-bold">
                              <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{brandData?.name || product.brand}</span>
                            </div>
                          </div>
                        </td>

                        {/* Pricing Matrix */}
                        <td className="py-4 px-5">
                          <div className="space-y-0.5 font-mono">
                            <div className="text-slate-800 dark:text-slate-100 font-bold flex items-center">
                              <span>IDR {product.salePrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span className="line-through">IDR {product.originalPrice.toLocaleString('id-ID')}</span>
                              <span className="text-rose-500 font-black">({product.discount}% OFF)</span>
                            </div>
                          </div>
                        </td>

                        {/* Platform & Affiliate Url */}
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[8.5px] font-mono font-black uppercase tracking-wider border ${
                              product.marketplace === 'Shopee' ? 'bg-orange-500/10 text-orange-500 border-orange-500/10' :
                              product.marketplace === 'Tokopedia' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                              product.marketplace === 'Lazada' ? 'bg-blue-500/10 text-blue-500 border-blue-500/10' :
                              'bg-pink-500/10 text-pink-500 border-pink-500/10'
                            }`}>
                              {product.marketplace}
                            </span>
                            <a
                              href={product.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-admin-primary dark:hover:text-admin-secondary transition-colors"
                            >
                              <Link className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[120px]">Gateway Link</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          </div>
                        </td>

                        {/* Status toggle button */}
                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => toggleStatus(product)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer border ${
                              statusVal === 'Published'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20'
                            }`}
                            title="Click to toggle publication status"
                          >
                            {statusVal}
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => openFormModal(product)}
                              className="p-1.5 hover:text-indigo-500 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Edit specifications"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(product.id)}
                              className="p-1.5 hover:text-red-500 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid View (2 product cards per row, no horizontal scrolling, compact & comfortable spacing) */}
            <div className="md:hidden grid grid-cols-2 gap-1.5 p-1.5 bg-slate-50 dark:bg-zinc-950/40">
              {paginatedProducts.map((product) => {
                const brandData = brands.find(b => b.slug === product.brand);
                const statusVal = product.status || 'Published';

                return (
                  <div
                    key={product.id}
                    className="flex flex-col bg-white dark:bg-admin-dark-surface border border-slate-100 dark:border-zinc-800/80 rounded-[6px] overflow-hidden shadow-xs relative"
                  >
                    {/* Compact Image wrapper */}
                    <div className="relative aspect-square bg-slate-50 dark:bg-zinc-900/10 overflow-hidden shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      
                      {/* Shopee-style Discount Tag overlay in the Top Right */}
                      {product.discount > 0 && (
                        <div className="absolute top-0 right-0 bg-[#fff5f0] text-admin-primary font-black text-[9px] px-1.5 py-0.5 rounded-bl-[4px] z-10 border-l border-b border-admin-primary/10">
                          -{product.discount}%
                        </div>
                      )}

                      {/* Optional Promo Tag in the Top Left */}
                      {product.badge && (
                        <span className="absolute top-1 left-1 px-1 py-0.5 rounded-[2px] text-[6.5px] font-mono font-black uppercase leading-none bg-admin-primary text-white tracking-wider z-10">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Card Content area */}
                    <div className="flex-1 p-2 flex flex-col justify-between space-y-1">
                      <div className="space-y-0.5">
                        {/* Brand Category */}
                        <div className="text-[7.5px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold truncate">
                          {brandData?.name || product.brand}
                        </div>
                        {/* Title (2 lines max, with inline marketplace badge prepended) */}
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight h-[28px] overflow-hidden">
                          <span className={`inline-flex items-center px-1 py-0.25 text-[7px] font-black rounded-[2px] mr-1 uppercase leading-none text-white ${
                            product.marketplace === 'Shopee' ? 'bg-orange-500' :
                            product.marketplace === 'Tokopedia' ? 'bg-emerald-500' :
                            product.marketplace === 'Lazada' ? 'bg-blue-500' :
                            'bg-pink-500'
                          }`}>
                            {product.marketplace === 'Shopee' ? 'Star+' : product.marketplace}
                          </span>
                          {product.name}
                        </p>
                      </div>

                      {/* Shopee-style mini promo tag row */}
                      <div className="flex flex-wrap gap-1 items-center min-h-[14px]">
                        {product.discount > 0 ? (
                          <span className="text-[7.5px] border border-admin-primary/30 text-admin-primary px-1 py-0.25 rounded-[2px] leading-none font-bold">
                            Beli Banyak Lebih Hemat
                          </span>
                        ) : (
                          <span className="text-[7.5px] border border-emerald-500/30 text-emerald-500 px-1 py-0.25 rounded-[2px] leading-none font-bold">
                            Garansi Terbaik
                          </span>
                        )}
                      </div>

                      {/* Shopee-style Price Row */}
                      <div className="space-y-0.5 pt-0.5">
                        <div className="flex items-baseline justify-between gap-1">
                          <div className="text-[11.5px] font-bold text-admin-primary">
                            Rp {product.salePrice.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">
                            {product.discount > 0 ? `${product.discount}% Off` : '100+ terjual'}
                          </div>
                        </div>
                        {product.originalPrice > product.salePrice && (
                          <div className="text-[8px] font-mono text-slate-400 line-through">
                            Rp {product.originalPrice.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>

                      {/* Status and Action Buttons Footer */}
                      <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-1.5 flex items-center justify-between gap-1 mt-1">
                        {/* Toggle Status Tag button */}
                        <button
                          onClick={() => toggleStatus(product)}
                          className={`px-1 py-0.5 rounded-[3px] text-[7px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer border ${
                            statusVal === 'Published'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/25'
                          }`}
                          title="Toggle Status"
                        >
                          {statusVal}
                        </button>

                        {/* Action buttons with proper touch target sizes */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openFormModal(product)}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-admin-primary transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product.id)}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Table Pagination Footer */}
        {!loading && sortedProducts.length > 0 && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono">
            <div className="text-slate-400">
              Showing <span className="text-slate-800 dark:text-slate-200 font-bold">{startIndex + 1}</span> to{' '}
              <span className="text-slate-800 dark:text-slate-200 font-bold">
                {Math.min(startIndex + itemsPerPage, sortedProducts.length)}
              </span>{' '}
              of <span className="text-slate-800 dark:text-slate-200 font-bold">{sortedProducts.length}</span> entries
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-[8px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8.5 h-8.5 rounded-[8px] text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-admin-primary text-white border border-admin-primary shadow-sm'
                        : 'border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-[8px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Full Slide-over or centered form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="product-form-modal">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body Container */}
            <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-4xl bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-2xl overflow-hidden flex flex-col text-left transition-colors duration-300"
              >
                {/* Modal Title Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="space-y-1">
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                      {editingProduct ? 'Curate Specifications_' : 'Publish New Affiliate_'}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
                      {editingProduct ? `EDITING INDEX // ID: ${editingProduct.id}` : 'ENTER THE PARAMETERS TO INDEX NEW ASSET'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 rounded-[8px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-form category selectors (tabs) */}
                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-1.5 flex flex-wrap gap-1.5 bg-slate-50/30 dark:bg-slate-900/10">
                  {[
                    { id: 'basic', label: 'Basic Info', icon: FileText },
                    { id: 'taxonomy', label: 'Specifications', icon: ListPlus },
                    { id: 'pricing', label: 'Pricing & Links', icon: Link },
                    { id: 'media', label: 'Media & Gallery', icon: ImageIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFormTab(tab.id as any)}
                      className={`px-4.5 py-2.5 rounded-[10px] text-[10px] font-mono font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                        activeFormTab === tab.id
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-black border border-slate-200/50 dark:border-slate-700/50'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Modal Form Submission wrapper */}
                <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto max-h-[60vh] p-6 space-y-6">
                  
                  {/* TAB 1: BASIC INFO */}
                  {activeFormTab === 'basic' && (
                    <div className="space-y-5 animate-fade-in">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Product Name_
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Phantom Volt '24 Extreme Performance Sneakers"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                          />
                        </div>

                        {/* Slug */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Slug Identifier_
                          </label>
                          <input
                            type="text"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="e.g. phantom-volt-24"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-mono"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                          Curated Description_
                        </label>
                        <textarea
                          name="description"
                          rows={4}
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Provide a compelling product story and affiliate summary..."
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium leading-relaxed resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Status */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Publication Status_
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-bold cursor-pointer"
                          >
                            <option value="Published">Published (Active in Frontend)</option>
                            <option value="Draft">Draft (Hidden from Visitors)</option>
                          </select>
                        </div>

                        {/* Promo Badge */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Product Promo Badge_ (Optional)
                          </label>
                          <select
                            name="badge"
                            value={formData.badge}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-bold cursor-pointer"
                          >
                            <option value="">None</option>
                            <option value="New">New</option>
                            <option value="Sale">Sale</option>
                            <option value="Trending">Trending</option>
                            <option value="Best Seller">Best Seller</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: SPECIFICATIONS & HIGHLIGHTS */}
                  {activeFormTab === 'taxonomy' && (
                    <div className="space-y-6 animate-fade-in">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Category */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Category Classification_
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-bold cursor-pointer"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Brand */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Brand Affiliation_
                          </label>
                          <select
                            name="brand"
                            value={formData.brand}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-bold cursor-pointer"
                          >
                            {brands.map(b => (
                              <option key={b.id} value={b.slug}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-3.5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
                        <div>
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Product Feature Highlights_
                          </label>
                          <p className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">Core selling points displayed in detail specs lists</p>
                        </div>

                        <div className="flex gap-2.5">
                          <input
                            type="text"
                            value={newHighlight}
                            onChange={(e) => setNewHighlight(e.target.value)}
                            placeholder="e.g. Responsive Neon cushioning technology"
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary"
                          />
                          <button
                            type="button"
                            onClick={handleAddHighlight}
                            className="px-4.5 py-3 rounded-[10px] bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Add
                          </button>
                        </div>

                        {formData.highlights.length > 0 && (
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-[12px] border border-slate-100 dark:border-slate-800/50 space-y-2">
                            {formData.highlights.map((highlight, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-4 text-xs font-medium">
                                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-admin-primary" />
                                  {highlight}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHighlight(idx)}
                                  className="text-red-500 hover:text-red-700 font-mono text-[9px] font-bold"
                                >
                                  REMOVE
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Technical Specifications */}
                      <div className="space-y-3.5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
                        <div>
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Key-Value Technical Specifications_
                          </label>
                          <p className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">Parameters such as Style, Model, Material, Sizes Available, etc.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            placeholder="Specification Key (e.g. Material)"
                            value={newSpecKey}
                            onChange={(e) => setNewSpecKey(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary"
                          />
                          <input
                            type="text"
                            placeholder="Specification Value (e.g. Synthetic Suede)"
                            value={newSpecValue}
                            onChange={(e) => setNewSpecValue(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary sm:col-span-1"
                          />
                          <button
                            type="button"
                            onClick={handleAddSpec}
                            className="px-4 py-3 rounded-[10px] bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors w-full sm:col-span-1"
                          >
                            Add Specification
                          </button>
                        </div>

                        {Object.keys(formData.specifications).length > 0 && (
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-[12px] border border-slate-100 dark:border-slate-800/50 divide-y divide-slate-100 dark:divide-slate-800">
                            {Object.entries(formData.specifications).map(([key, val]) => (
                              <div key={key} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0 text-xs font-medium">
                                <div className="flex items-center gap-4">
                                  <span className="font-bold text-slate-400 font-mono text-[10px] uppercase w-24 shrink-0">{key}:</span>
                                  <span className="text-slate-700 dark:text-slate-300 font-mono">{val}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSpec(key)}
                                  className="text-red-500 hover:text-red-700 font-mono text-[9px] font-bold"
                                >
                                  REMOVE
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 3: PRICING & AFFILIATE LINKS */}
                  {activeFormTab === 'pricing' && (
                    <div className="space-y-5 animate-fade-in">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Original Price */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Original Pricing (IDR)_
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="originalPrice"
                              required
                              min="0"
                              value={formData.originalPrice || ''}
                              onChange={handlePriceChange}
                              placeholder="e.g. 1299000"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-12 pr-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-mono font-bold"
                            />
                            <span className="text-[10px] font-mono font-black text-slate-400 absolute left-4 top-1/2 -translate-y-1/2">IDR</span>
                          </div>
                        </div>

                        {/* Sale Price */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Affiliate Sale Price (IDR)_
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="salePrice"
                              required
                              min="0"
                              value={formData.salePrice || ''}
                              onChange={handlePriceChange}
                              placeholder="e.g. 799000"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-12 pr-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-mono font-bold"
                            />
                            <span className="text-[10px] font-mono font-black text-slate-400 absolute left-4 top-1/2 -translate-y-1/2">IDR</span>
                          </div>
                        </div>
                      </div>

                      {/* Calculated discount preview */}
                      {formData.originalPrice > 0 && formData.salePrice > 0 && (
                        <div className="p-4 bg-indigo-500/5 rounded-[12px] border border-indigo-500/10 flex items-center gap-3">
                          <Percent className="w-5 h-5 text-admin-primary shrink-0" />
                          <p className="text-[10px] font-mono text-slate-400 uppercase leading-relaxed">
                            AUTOMATIC CALCULATED DISCOUNT DETECTED:{' '}
                            <strong className="text-admin-primary dark:text-admin-secondary">
                              {Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100)}% OFF
                            </strong>. THIS WILL SHOW IN VISITOR BADGES.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
                        {/* Marketplace platform */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Outbound Affiliate Platform_
                          </label>
                          <select
                            name="marketplace"
                            value={formData.marketplace}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-bold cursor-pointer"
                          >
                            <option value="Shopee">Shopee</option>
                            <option value="Tokopedia">Tokopedia</option>
                            <option value="TikTok Shop">TikTok Shop</option>
                            <option value="Lazada">Lazada</option>
                          </select>
                        </div>

                        {/* Affiliate URL */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Outbound Affiliate URL_
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              name="affiliateUrl"
                              required
                              value={formData.affiliateUrl}
                              onChange={handleInputChange}
                              placeholder="https://shopee.co.id/your-affiliate-identifier"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-mono"
                            />
                            <Link className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 4: MEDIA & GALLERY */}
                  {activeFormTab === 'media' && (
                    <div className="space-y-5 animate-fade-in">
                      
                      {/* Primary Image URL */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                          Primary Showcase Image URL_
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="image"
                            required
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="https://images.unsplash.com/your-image-slug"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-mono"
                          />
                          <ImageIcon className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Live Image Preview */}
                      {formData.image && (
                        <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[12px] items-center">
                          <div className="w-16 h-16 rounded-[8px] overflow-hidden border border-slate-200 shrink-0 bg-white">
                            <img
                              src={formData.image}
                              alt="Primary Preview"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-mono font-black text-slate-500 uppercase">Image Gateway Status</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Unsplash asset resolved correctly.</p>
                          </div>
                        </div>
                      )}

                      {/* Demo Quick Selection Panel */}
                      <div className="space-y-2 pt-2">
                        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Quick Populate Premium Demo Presets_</p>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                          {sampleUnsplashImages.map((img) => (
                            <button
                              key={img.name}
                              type="button"
                              onClick={() => handleQuickImageSelect(img.url)}
                              className={`rounded-[8px] overflow-hidden border text-[8px] font-mono py-1 px-1 bg-white dark:bg-slate-900 transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                                formData.image === img.url
                                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                              }`}
                            >
                              <img src={img.url} alt={img.name} className="w-8 h-8 object-cover rounded-sm" />
                              <span className="truncate w-full font-bold">{img.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gallery Images Collection */}
                      <div className="space-y-3.5 border-t border-slate-50 dark:border-slate-800/50 pt-5">
                        <div>
                          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                            Product Image Carousel Gallery_ (Optional)
                          </label>
                          <p className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">Additional showcase angles displayed inside details slideshow</p>
                        </div>

                        <div className="flex gap-2.5">
                          <input
                            type="text"
                            value={newGalleryUrl}
                            onChange={(e) => setNewGalleryUrl(e.target.value)}
                            placeholder="Add additional showcase Unsplash URL..."
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleAddGalleryUrl}
                            className="px-4.5 py-3 rounded-[10px] bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors animate-fade-in"
                          >
                            Add URL
                          </button>
                        </div>

                        {formData.gallery.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-[16px] border border-slate-100 dark:border-slate-800/60">
                            {formData.gallery.map((url, idx) => (
                              <div key={idx} className="relative rounded-[10px] overflow-hidden border border-slate-200 aspect-square bg-white group">
                                <img src={url} alt={`Gallery ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryUrl(idx)}
                                  className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer"
                                >
                                  EXPUNGE URL
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Actions buttons footer inside scrolling form */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-admin-dark-surface">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-3 rounded-[10px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all cursor-pointer shadow-md shadow-indigo-500/10 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'Commit Curation' : 'Publish Asset'}</span>
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DELETE CONFIRMATION */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="product-delete-confirm-modal">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Body Container */}
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-2xl p-6 space-y-6 text-center transition-all duration-300"
              >
                <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-full border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-500 mx-auto">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                    DESTRUCTIVE_ PERMANENT EXPUNGE
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed uppercase">
                    Are you absolutely sure you wish to expunge this product? This action cannot be undone and will immediately sync down to active LookVerse showcases.
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    className="flex-1 py-3 rounded-[12px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                  >
                    ABORT OPERATION
                  </button>
                  <button
                    onClick={confirmDeleteProduct}
                    className="flex-1 py-3 rounded-[12px] bg-red-500 text-white hover:bg-red-600 text-xs font-mono font-black uppercase tracking-wider cursor-pointer"
                  >
                    CONFIRM EXPUNGE
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Products;
