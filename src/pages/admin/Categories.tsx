import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Footprints,
  Shirt,
  Sparkles,
  Briefcase,
  Watch,
  Gift,
  Flame,
  Compass,
  Crown,
  Smile,
  Umbrella,
  Scissors,
  Image as ImageIcon,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Category, Product } from '../../types';

// Map icon strings to Lucide components for dynamic rendering
const iconMap: Record<string, React.ComponentType<any>> = {
  Footprints,
  Shirt,
  Sparkles,
  Briefcase,
  Watch,
  Gift,
  Flame,
  Compass,
  Crown,
  Smile,
  Umbrella,
  Scissors
};

export const Categories: React.FC = () => {
  // Category & Product states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Alerts/Toasts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'Shirt',
    image: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const c = await dataService.getCategories();
      const p = await dataService.getProducts();
      setCategories(c);
      setProducts(p);
    } catch (e) {
      showToast('error', 'Failed to retrieve categories.');
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
  const filteredCategories = categories.filter(category => {
    return (
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate product counts per category
  const getProductCount = (categorySlug: string) => {
    return products.filter(p => p.category === categorySlug).length;
  };

  // Handle Form Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'name' && !editingCategory) {
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
  const openFormModal = (category: Category | null = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        image: category.image,
        description: category.description
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        icon: 'Shirt',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
        description: ''
      });
    }
    setIsFormOpen(true);
  };

  // Submit Category Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('error', 'Category name is required.');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('error', 'Category slug is required.');
      return;
    }

    let updatedCategories = [...categories];
    const payload: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      slug: formData.slug.trim(),
      name: formData.name.trim(),
      icon: formData.icon,
      image: formData.image.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
      description: formData.description.trim()
    };

    if (editingCategory) {
      // Update
      updatedCategories = updatedCategories.map(c => (c.id === editingCategory.id ? payload : c));
      dataService.logActivity(`Category "${payload.name}" updated successfully.`, 'UPDATE');
      showToast('success', 'CATEGORY UPDATED SUCCESSFULLY.');
    } else {
      // Create
      // Check for collision
      const slugExists = categories.some(c => c.slug === payload.slug);
      if (slugExists) {
        showToast('error', 'COLLISION FAILURE: Slug already exists.');
        return;
      }
      updatedCategories = [...updatedCategories, payload];
      dataService.logActivity(`Category "${payload.name}" registered and published.`, 'ADD');
      showToast('success', 'NEW CATEGORY INDEXED.');
    }

    dataService.saveCategories(updatedCategories);
    setCategories(updatedCategories);
    setIsFormOpen(false);
  };

  // Open Delete modal
  const openDeleteModal = (id: string) => {
    // Check if category has active products before deleting
    const cat = categories.find(c => c.id === id);
    if (cat) {
      const pCount = getProductCount(cat.slug);
      if (pCount > 0) {
        showToast('error', `CANNOT DELETE: This category has ${pCount} active products.`);
        return;
      }
    }
    setDeletingCategoryId(id);
    setIsDeleteOpen(true);
  };

  // Confirm Delete Category
  const confirmDeleteCategory = () => {
    if (!deletingCategoryId) return;

    const targetCategory = categories.find(c => c.id === deletingCategoryId);
    const updated = categories.filter(c => c.id !== deletingCategoryId);

    dataService.saveCategories(updated);
    setCategories(updated);

    if (targetCategory) {
      dataService.logActivity(`Category "${targetCategory.name}" removed from indices.`, 'DELETE');
    }

    setIsDeleteOpen(false);
    setDeletingCategoryId(null);
    showToast('success', 'CATEGORY DELETED SUCCESSFULLY.');
  };

  const renderIcon = (iconName: string, className = "w-4 h-4") => {
    const IconComponent = iconMap[iconName] || HelpCircle;
    return <IconComponent className={className} />;
  };

  const quickCategoriesImages = [
    { name: 'Apparel', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop' },
    { name: 'Shoes', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { name: 'Bags', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop' },
    { name: 'Accessory', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop' }
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
            Category Segments_
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Organize website fashion items cleanly into high-level categories with icons, descriptive narratives, and banner visuals.
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-admin-dark-surface p-5 rounded-[20px] border border-admin-border dark:border-admin-dark-border shadow-sm space-y-4 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full max-w-md">
            <input
              type="text"
              placeholder="Search segments by name, description or slug..."
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
            Total Segments: <span className="text-slate-700 dark:text-slate-200 font-bold">{categories.length}</span>
          </div>
        </div>
      </div>

      {/* Category Display Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-admin-primary animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">LOADING SEGMENTS DATA INDEX...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center text-slate-300 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300">NO CATEGORIES INDEXED_</p>
            <p className="text-[11px] text-slate-400 font-medium">Try checking your spelling or create a new category above.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            const productCount = getProductCount(category.slug);

            return (
              <motion.div
                key={category.id}
                layout
                className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Banner image with overlay */}
                <div className="h-40 relative bg-slate-50 dark:bg-slate-950 overflow-hidden shrink-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Floating Lucide icon badge */}
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-[10px] bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg">
                    {renderIcon(category.icon, "w-4.5 h-4.5")}
                  </div>

                  {/* Active Products Count */}
                  <div className="absolute bottom-4 left-4 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{productCount} {productCount === 1 ? 'Product' : 'Products'}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-admin-primary dark:group-hover:text-admin-secondary transition-colors text-sm">
                        {category.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 lowercase bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-[6px]">
                        /{category.slug}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {category.description || "No customized description provided for this catalog segment."}
                    </p>
                  </div>

                  {/* Action row */}
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                      ID: {category.id}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openFormModal(category)}
                        className="p-2 hover:text-indigo-500 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[8px] transition-colors cursor-pointer"
                        title="Edit specifications"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(category.id)}
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

      {/* FORM MODAL: Add & Edit Category */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="category-form-modal">
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
                      {editingCategory ? 'Curate Segment_' : 'Register New Segment_'}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
                      {editingCategory ? `EDITING INDEX // ID: ${editingCategory.id}` : 'ENTER PARAMETERS TO PROPAGATE NEW CATEGORY'}
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
                        Category Name_
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Streetwear Outerwear"
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
                        placeholder="e.g. streetwear-outerwear"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-mono"
                        disabled={!!editingCategory}
                      />
                    </div>
                  </div>

                  {/* Icon selector & Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                        Lucide Vector Icon_
                      </label>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-bold cursor-pointer"
                      >
                        {Object.keys(iconMap).map((iconName) => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                        Banner Cover Image URL_
                      </label>
                      <input
                        type="url"
                        name="image"
                        required
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                      />
                    </div>
                  </div>

                  {/* Preloaded quick cover images */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Quick Premium Covers:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {quickCategoriesImages.map((img) => (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, image: img.url }))}
                          className={`h-11 rounded-[6px] overflow-hidden border transition-all cursor-pointer relative ${
                            formData.image === img.url ? 'border-admin-primary ring-2 ring-indigo-500/10' : 'border-slate-150'
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

                  {/* Narrative Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      Segment Narrative Narrative_
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief category storyline showcased on directory boards..."
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
                      {editingCategory ? 'Commit Curations' : 'Publish Segment'}
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
          <div className="fixed inset-0 z-50 overflow-y-auto" id="category-delete-modal">
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
                    Are you absolutely sure you want to permanently erase this Category from index catalogs? This action cannot be reversed.
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
                    onClick={confirmDeleteCategory}
                    className="px-4.5 py-2.5 rounded-[10px] bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-md shadow-red-500/10"
                  >
                    Confirm Expunge
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

export default Categories;
