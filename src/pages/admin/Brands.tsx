import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
  ExternalLink,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Brand, Product } from '../../types';

export const Brands: React.FC = () => {
  // Brand & Product states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Alerts/Toasts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const b = await dataService.getBrands();
      const p = await dataService.getProducts();
      setBrands(b);
      setProducts(p);
    } catch (e) {
      showToast('error', 'Failed to retrieve brands.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Search Logic
  const filteredBrands = brands.filter(brand => {
    return (
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate product counts per brand
  const getProductCount = (brandSlug: string) => {
    return products.filter(p => p.brand === brandSlug).length;
  };

  // Handle Form Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'name' && !editingBrand) {
      // Auto generate slug from name in creation mode
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

  // Open Form modal
  const openFormModal = (brand: Brand | null = null) => {
    setEditingBrand(brand);
    if (brand) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        description: brand.description
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        logo: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=300&auto=format&fit=crop',
        description: ''
      });
    }
    setIsFormOpen(true);
  };

  // Submit Brand Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('error', 'Brand name is required.');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('error', 'Brand slug is required.');
      return;
    }

    let updatedBrands = [...brands];
    const payload: Brand = {
      id: editingBrand ? editingBrand.id : `brand-${Date.now()}`,
      slug: formData.slug.trim(),
      name: formData.name.trim(),
      logo: formData.logo.trim() || 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=300&auto=format&fit=crop',
      description: formData.description.trim()
    };

    if (editingBrand) {
      // Update
      updatedBrands = updatedBrands.map(b => (b.id === editingBrand.id ? payload : b));
      dataService.logActivity(`Brand "${payload.name}" updated successfully.`, 'UPDATE');
      showToast('success', 'BRAND DATA RE-CURATED IN THE INDEX.');
    } else {
      // Create
      // Check for collision
      const slugExists = brands.some(b => b.slug === payload.slug);
      if (slugExists) {
        showToast('error', 'COLLISION FAILURE: Slug already exists.');
        return;
      }
      updatedBrands = [...updatedBrands, payload];
      dataService.logActivity(`Brand "${payload.name}" registered and certified.`, 'ADD');
      showToast('success', 'NEW CERTIFIED BRAND REGISTERED.');
    }

    dataService.saveBrands(updatedBrands);
    setBrands(updatedBrands);
    setIsFormOpen(false);
  };

  // Open Delete modal
  const openDeleteModal = (id: string) => {
    // Check if brand has active products before deleting
    const b = brands.find(brand => brand.id === id);
    if (b) {
      const pCount = getProductCount(b.slug);
      if (pCount > 0) {
        showToast('error', `CANNOT DELETE: This brand has ${pCount} active products.`);
        return;
      }
    }
    setDeletingBrandId(id);
    setIsDeleteOpen(true);
  };

  // Confirm Delete Brand
  const confirmDeleteBrand = () => {
    if (!deletingBrandId) return;

    const targetBrand = brands.find(b => b.id === deletingBrandId);
    const updated = brands.filter(b => b.id !== deletingBrandId);

    dataService.saveBrands(updated);
    setBrands(updated);

    if (targetBrand) {
      dataService.logActivity(`Brand "${targetBrand.name}" decommissioned.`, 'DELETE');
    }

    setIsDeleteOpen(false);
    setDeletingBrandId(null);
    showToast('success', 'BRAND REMOVED FROM REGISTER.');
  };

  const sampleBrandLogos = [
    { name: 'Casual', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=300&auto=format&fit=crop' },
    { name: 'Business', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300&auto=format&fit=crop' },
    { name: 'Modern', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=300&auto=format&fit=crop' },
    { name: 'Dynamic', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop' }
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
            Verified Brands_
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Manage certified partner brands, customize profiles, showcase visual logo benchmarks, and link active portfolios.
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Brand</span>
        </button>
      </div>

      {/* Control filters and search console */}
      <div className="bg-white dark:bg-admin-dark-surface p-5 rounded-[20px] border border-admin-border dark:border-admin-dark-border shadow-sm space-y-4 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full max-w-md">
            <input
              type="text"
              placeholder="Search partner brands by name, bio or slug..."
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

          <div className="text-[10px] font-mono text-slate-400 uppercase">
            Certified brands: <span className="text-slate-700 dark:text-slate-200 font-bold">{brands.length}</span>
          </div>
        </div>
      </div>

      {/* Brand Display Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-admin-primary animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">RETRIEVING REGISTERED BRANDS...</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center text-slate-300 mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300">NO PARTNERS FOUND_</p>
            <p className="text-[11px] text-slate-400 font-medium">Reset your filters or register a brand item using the action button.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => {
            const productCount = getProductCount(brand.slug);

            return (
              <motion.div
                key={brand.id}
                layout
                className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group p-6 justify-between space-y-5"
              >
                <div className="flex gap-4 items-start">
                  {/* Brand Logo Card */}
                  <div className="w-16 h-16 rounded-[16px] overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 shrink-0 relative flex items-center justify-center">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=300&auto=format&fit=crop';
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                        {brand.name}
                      </h3>
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 lowercase px-1.5 py-0.2 bg-slate-50 dark:bg-slate-900 rounded-[4px] shrink-0 border border-slate-100/60 dark:border-slate-800/60">
                        {brand.slug}
                      </span>
                    </div>
                    {/* Active Products Badge */}
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono text-admin-primary dark:text-admin-secondary font-bold uppercase">
                      <ShoppingBag className="w-3 h-3" />
                      <span>{productCount} catalog items</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {brand.description || "No bio narrative has been registered for this certified brand partner yet."}
                  </p>

                  {/* Actions Area */}
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                      ID: {brand.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openFormModal(brand)}
                        className="p-2 hover:text-indigo-500 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[8px] transition-colors cursor-pointer"
                        title="Edit bio details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(brand.id)}
                        className="p-2 hover:text-red-500 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[8px] transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL: Add & Edit Brand */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="brand-form-modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <div className="flex min-h-screen items-center justify-center p-4 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-2xl overflow-hidden flex flex-col text-left transition-colors duration-300"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="space-y-1">
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                      {editingBrand ? 'Curate Brand_' : 'Register Partner Brand_'}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
                      {editingBrand ? `EDITING INDEX // ID: ${editingBrand.id}` : 'ENTER BIO DATA IN INDEX DIRECTORY'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 rounded-[8px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                  {/* Name and Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                        Brand Name_
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Erigo Extreme"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                      />
                    </div>

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
                        placeholder="e.g. erigo-extreme"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-mono"
                        disabled={!!editingBrand}
                      />
                    </div>
                  </div>

                  {/* Logo Image */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      Brand Logo URL_
                    </label>
                    <input
                      type="url"
                      name="logo"
                      required
                      value={formData.logo}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                    />
                  </div>

                  {/* Preloaded quick logo presets */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Quick Visual Presets:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {sampleBrandLogos.map((img) => (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, logo: img.url }))}
                          className={`h-11 rounded-[6px] overflow-hidden border transition-all cursor-pointer relative ${
                            formData.logo === img.url ? 'border-admin-primary ring-2 ring-indigo-500/10' : 'border-slate-150'
                          }`}
                        >
                          <img src={img.url} alt={img.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-[7.5px] font-mono text-white font-black uppercase tracking-wider">{img.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bio Narrative Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      Corporate Bio / Narrative_
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter brand identity and corporate bio..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium leading-relaxed resize-none"
                    />
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4.5 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono font-bold uppercase cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-[10px] bg-admin-primary hover:bg-opacity-95 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-md shadow-indigo-500/10"
                    >
                      {editingBrand ? 'Commit Curations' : 'Publish Partner'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="brand-delete-modal">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsDeleteOpen(false)} />
            <div className="flex min-h-screen items-center justify-center p-4 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-2xl p-6 text-center space-y-5"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-mono font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    DESTRUCTIVE OPERATION COMMAND_
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Are you absolutely sure you want to permanently delete this Brand Partner? Products using this brand will need reconfiguration.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    className="px-4 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono font-bold uppercase cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    Abort Action
                  </button>
                  <button
                    onClick={confirmDeleteBrand}
                    className="px-4.5 py-2.5 rounded-[10px] bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-md shadow-red-500/10"
                  >
                    Confirm Decommission
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

export default Brands;
