import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderOpen,
  Plus,
  Search,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Grid,
  List,
  Info,
  ExternalLink,
  Eye,
  X,
  Sparkles,
  Database,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  Edit2
} from 'lucide-react';
import { mediaService, MediaAsset, MediaUsage } from '../../services/mediaService';
import { dataService } from '../../services/dataService';

// Premium fade-in and smooth scaling image component with background loading state
interface ImageWithFadeProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

const ImageWithFade: React.FC<ImageWithFadeProps> = ({ src, alt, className, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-zinc-950 z-10">
          <div className="w-5 h-5 border-2 border-admin-primary/30 border-t-admin-primary rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`transition-all duration-700 ease-out ${
          loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-xs'
        } ${className || ''}`}
        {...props}
      />
    </div>
  );
};

export const MediaLibrary: React.FC = () => {
  // State variables
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  
  // High-performance cache of active usage URLs to prevent repetitive fetch on keystroke
  const [activeUsageUrls, setActiveUsageUrls] = useState<Set<string>>(new Set());
  
  // Filtering & searching
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'product' | 'brand' | 'category' | 'banner' | 'upload'>('all');
  const [usageFilter, setUsageFilter] = useState<'all' | 'in-use' | 'unused'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name-asc' | 'name-desc' | 'size-desc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Selection & detail sidebar state
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedAssetUsages, setSelectedAssetUsages] = useState<MediaUsage[]>([]);
  const [loadingUsages, setLoadingUsages] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUrlUploadOpen, setIsUrlUploadOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputUrlName, setInputUrlName] = useState('');
  const [inputUrlCategory, setInputUrlCategory] = useState<'product' | 'brand' | 'category' | 'banner' | 'upload'>('upload');

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load all assets initially
  const loadAssets = async () => {
    setLoading(true);
    try {
      const [all, products, categories, brands, banners] = await Promise.all([
        mediaService.getAllAssets(),
        dataService.getProducts(),
        dataService.getCategories(),
        dataService.getBrands(),
        dataService.getBanners()
      ]);
      setAssets(all);

      const activeUrls = new Set<string>();
      products.forEach(p => {
        if (p.image) activeUrls.add(p.image);
        if (p.gallery) p.gallery.forEach(img => img && activeUrls.add(img));
      });
      categories.forEach(c => c.image && activeUrls.add(c.image));
      brands.forEach(b => b.logo && activeUrls.add(b.logo));
      banners.forEach(b => b.image && activeUrls.add(b.image));
      setActiveUsageUrls(activeUrls);
    } catch (err) {
      triggerToast('error', 'Failed to synchronize with active media repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // Filter & Search Logic (Optimized high-performance synchronous execution)
  useEffect(() => {
    const applyFiltersAndSort = () => {
      let result = [...assets];

      // 1. Category Filter
      if (activeCategory !== 'all') {
        result = result.filter(a => a.category === activeCategory);
      }

      // 2. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          a => a.name.toLowerCase().includes(query) || a.url.toLowerCase().includes(query)
        );
      }

      // 3. Usage Filter (Synchronous cache lookup)
      if (usageFilter !== 'all') {
        if (usageFilter === 'in-use') {
          result = result.filter(a => activeUsageUrls.has(a.url));
        } else if (usageFilter === 'unused') {
          result = result.filter(a => !activeUsageUrls.has(a.url));
        }
      }

      // 4. Sort Options
      result.sort((a, b) => {
        if (sortBy === 'newest') {
          // System bases go first, custom timestamped later
          if (a.isSystemDefault && !b.isSystemDefault) return 1;
          if (!a.isSystemDefault && b.isSystemDefault) return -1;
          return b.id.localeCompare(a.id);
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name-desc') {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === 'size-desc') {
          const sizeA = parseSize(a.size);
          const sizeB = parseSize(b.size);
          return sizeB - sizeA;
        }
        return 0;
      });

      setFilteredAssets(result);
    };

    applyFiltersAndSort();
  }, [assets, searchQuery, activeCategory, usageFilter, sortBy, activeUsageUrls]);

  // Load detailed usage stats for selection
  useEffect(() => {
    if (selectedAsset) {
      const fetchUsages = async () => {
        setLoadingUsages(true);
        try {
          const refs = await mediaService.getUsageReferences(selectedAsset.url);
          setSelectedAssetUsages(refs);
        } catch (e) {
          setSelectedAssetUsages([]);
        } finally {
          setLoadingUsages(false);
        }
      };
      fetchUsages();
      setEditedName(selectedAsset.name);
      setIsEditingName(false);
    } else {
      setSelectedAssetUsages([]);
    }
  }, [selectedAsset]);

  // Helper to parse sizes e.g. "142 KB" to numeric bytes for sorting
  const parseSize = (sizeStr: string): number => {
    const parts = sizeStr.split(' ');
    const val = parseFloat(parts[0]) || 0;
    const unit = parts[1]?.toUpperCase() || 'KB';
    if (unit === 'MB') return val * 1024 * 1024;
    if (unit === 'KB') return val * 1024;
    return val;
  };

  const triggerToast = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Copy URL to Clipboard
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    triggerToast('success', 'RESOURCE URL COPIED TO CLIPBOARD.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  // Upload logic & storage persistence
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast('error', 'Only image resource assets are supported.');
      return;
    }

    // Limit size to ~800KB for localStorage safety
    if (file.size > 800 * 1024) {
      triggerToast('error', 'To prevent LocalStorage overflow, please upload assets smaller than 800 KB.');
      return;
    }

    setUploadProgress(10);
    const reader = new FileReader();

    reader.onloadstart = () => setUploadProgress(30);
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(30 + Math.round((e.loaded / e.total) * 50));
      }
    };

    reader.onload = async () => {
      setUploadProgress(90);
      const dataUrl = reader.result as string;

      // Mock image dimensions helper
      const img = new Image();
      img.src = dataUrl;
      img.onload = async () => {
        const dimensions = `${img.naturalWidth} x ${img.naturalHeight}`;
        const sizeKB = `${Math.round(file.size / 1024)} KB`;

        const newAsset = await mediaService.addAsset({
          url: dataUrl,
          name: file.name,
          type: file.type,
          size: sizeKB,
          dimensions,
          category: 'upload'
        });

        // Update local state list
        setAssets(prev => [newAsset, ...prev]);
        setUploadProgress(null);
        triggerToast('success', 'ASSET ACQUIRED AND INDEXED SUCCESSFULLY.');
        dataService.logActivity(`Uploaded custom media asset "${file.name}" to lookverse files.`, 'ADD');
      };
    };

    reader.onerror = () => {
      setUploadProgress(null);
      triggerToast('error', 'Failed to read media asset stream.');
    };

    reader.readAsDataURL(file);
  };

  // External Image URL Link Addition
  const handleUrlUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      triggerToast('error', 'Please provide a valid asset URL.');
      return;
    }

    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      triggerToast('error', 'URL must begin with http:// or https://');
      return;
    }

    try {
      const extension = inputUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const name = inputUrlName.trim() || `remote_reference_${Math.random().toString(36).substring(2, 6)}.${extension}`;
      
      const newAsset = await mediaService.addAsset({
        url: inputUrl,
        name,
        type: `image/${extension === 'png' ? 'png' : 'jpeg'}`,
        size: 'N/A (Remote)',
        dimensions: 'Dynamic',
        category: inputUrlCategory
      });

      setAssets(prev => [newAsset, ...prev]);
      setInputUrl('');
      setInputUrlName('');
      setIsUrlUploadOpen(false);
      triggerToast('success', 'EXTERNAL ASSET INDEXED IN LOOKVERSE.');
      dataService.logActivity(`Linked external image link "${name}" in media catalog.`, 'ADD');
    } catch (err) {
      triggerToast('error', 'Could not index URL asset.');
    }
  };

  // Rename custom file
  const handleRename = async () => {
    if (!selectedAsset) return;
    if (!editedName.trim()) {
      triggerToast('error', 'Asset filename cannot be empty.');
      return;
    }

    try {
      if (selectedAsset.isSystemDefault) {
        triggerToast('error', 'Cannot modify system coordinate files.');
        return;
      }

      const success = await mediaService.renameAsset(selectedAsset.id, editedName.trim());
      if (success) {
        setAssets(prev => prev.map(a => a.id === selectedAsset.id ? { ...a, name: editedName.trim() } : a));
        setSelectedAsset(prev => prev ? { ...prev, name: editedName.trim() } : null);
        setIsEditingName(false);
        triggerToast('success', 'ASSET RE-INDEXED SUCCESSFULLY.');
        dataService.logActivity(`Renamed media file to "${editedName.trim()}".`, 'UPDATE');
      } else {
        triggerToast('error', 'Rename procedure aborted.');
      }
    } catch (err) {
      triggerToast('error', 'Failed to update asset name.');
    }
  };

  // Delete custom asset
  const handleDelete = async (asset: MediaAsset) => {
    if (asset.isSystemDefault) {
      triggerToast('error', 'System-default coordinates are protected and cannot be deleted.');
      return;
    }

    // Double check references
    const refs = await mediaService.getUsageReferences(asset.url);
    if (refs.length > 0) {
      const confirmForce = window.confirm(
        `Warning: This image is actively referenced in ${refs.length} layout nodes:\n` +
        refs.map(r => `• ${r.type}: ${r.name}`).join('\n') +
        `\n\nAre you absolutely sure you want to delete this resource? It may break user layouts.`
      );
      if (!confirmForce) return;
    } else {
      const confirmNormal = window.confirm(`Are you sure you want to delete "${asset.name}"? This operation is irreversible.`);
      if (!confirmNormal) return;
    }

    try {
      const success = await mediaService.deleteAsset(asset.id);
      if (success) {
        setAssets(prev => prev.filter(a => a.id !== asset.id));
        if (selectedAsset?.id === asset.id) {
          setSelectedAsset(null);
        }
        triggerToast('success', 'ASSET EXPUNGED FROM MEDIA CATALOG.');
        dataService.logActivity(`Deleted custom media asset "${asset.name}" from database.`, 'DELETE');
      } else {
        triggerToast('error', 'Failed to delete asset.');
      }
    } catch (err) {
      triggerToast('error', 'Operation failed.');
    }
  };

  // Compute summary values for stats card
  const systemDefaultCount = assets.filter(a => a.isSystemDefault).length;
  const customUploadCount = assets.filter(a => !a.isSystemDefault).length;

  return (
    <div className="space-y-8 animate-fade-in pb-16 relative">
      
      {/* Dynamic Toast Alerts */}
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-border dark:border-admin-dark-border transition-colors duration-300">
        <div className="space-y-1.5">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 -skew-x-2 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-admin-primary dark:text-admin-secondary shrink-0" />
            <span>Media Library_</span>
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Upload, browse, inspect, rename, and manage responsive visual content across your LookVerse CMS showcase layers.
          </p>
        </div>

        {/* Upload Action Group */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUrlUploadOpen(true)}
            className="px-3.5 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link URL</span>
          </button>
          <button
            onClick={triggerFileInput}
            className="px-5 py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Local Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* STATS STRIP CARD BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-admin-dark-surface rounded-[20px] p-5 border border-admin-border dark:border-admin-dark-border shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-admin-primary dark:text-admin-secondary flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest block">Total Curated Assets</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{assets.length} images</span>
          </div>
        </div>

        <div className="bg-white dark:bg-admin-dark-surface rounded-[20px] p-5 border border-admin-border dark:border-admin-dark-border shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest block">System Core Elements</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{systemDefaultCount} items</span>
          </div>
        </div>

        <div className="bg-white dark:bg-admin-dark-surface rounded-[20px] p-5 border border-admin-border dark:border-admin-dark-border shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest block">Custom Uploads</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{customUploadCount} assets</span>
          </div>
        </div>
      </div>

      {/* UPLOADING PROGRESS OVERLAY */}
      {uploadProgress !== null && (
        <div className="bg-white dark:bg-admin-dark-surface p-5 rounded-[20px] border border-indigo-200 dark:border-indigo-950/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-admin-primary border-t-transparent animate-spin shrink-0"></div>
            <div>
              <p className="text-xs font-mono font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Processing image asset stream...</p>
              <p className="text-[10px] text-slate-400">Performing dynamic measurements and base64 calculations.</p>
            </div>
          </div>
          <div className="w-full md:w-64 bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-admin-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* EXTERNAL URL LINK DIALOG MODAL */}
      <AnimatePresence>
        {isUrlUploadOpen && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border p-6 shadow-2xl max-w-md w-full space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-3">
                <h3 className="font-mono font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  <span>Index External Resource URL_</span>
                </h3>
                <button
                  onClick={() => setIsUrlUploadOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUrlUploadSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Direct Image Web URL:
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-[12px] text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-admin-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Friendly Asset Name (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. customized_jordan_heel.jpg"
                    value={inputUrlName}
                    onChange={(e) => setInputUrlName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-[12px] text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Logical Usage Category:
                  </label>
                  <select
                    value={inputUrlCategory}
                    onChange={(e: any) => setInputUrlCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-[12px] text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="upload">Custom Shared Image</option>
                    <option value="product">Product Catalog Showcase</option>
                    <option value="brand">Brand Logo Indicator</option>
                    <option value="category">Category Card Icon</option>
                    <option value="banner">Home Banner Campaign</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUrlUploadOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-wider hover:bg-opacity-90 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-wider hover:bg-opacity-90 transition-all cursor-pointer"
                  >
                    Index URL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DUAL COLUMN: MAIN BROWSER VIEW (left) + DETAIL PANEL DRAWER (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Asset filters + Gallery Browser (col-span-8 or full) */}
        <div className={`${selectedAsset ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
          
          {/* CONTROL RAIL (Category tabs, usage selector, sort options, view toggle) */}
          <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border p-5 shadow-sm space-y-4">
            
            {/* Row 1: Search and Category Tabs */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-50 dark:border-slate-800/60 pb-4">
              
              {/* Category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Assets' },
                  { id: 'product', label: 'Products' },
                  { id: 'category', label: 'Categories' },
                  { id: 'brand', label: 'Brands' },
                  { id: 'banner', label: 'Banners' },
                  { id: 'upload', label: 'Uploads' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as any)}
                    className={`px-3 py-1.5 rounded-[8px] text-[10px] font-mono font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      activeCategory === tab.id
                        ? 'bg-admin-primary text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View layout Mode Toggles */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg cursor-pointer border ${
                    viewMode === 'grid'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-admin-primary dark:text-admin-secondary border-indigo-150 dark:border-indigo-900'
                      : 'bg-white dark:bg-admin-dark-surface border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                  title="Grid layout"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg cursor-pointer border ${
                    viewMode === 'list'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-admin-primary dark:text-admin-secondary border-indigo-150 dark:border-indigo-900'
                      : 'bg-white dark:bg-admin-dark-surface border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                  title="List details table"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Row 2: Search Input, Usage Filter, and Sort order */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Search Bar (6/12) */}
              <div className="relative md:col-span-5">
                <input
                  type="text"
                  placeholder="Search file name, size, directory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 pl-10 rounded-[12px] text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-admin-primary"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Usage Filter Selector (3/12) */}
              <div className="md:col-span-3">
                <select
                  value={usageFilter}
                  onChange={(e: any) => setUsageFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-[12px] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer font-mono uppercase"
                >
                  <option value="all">📎 Usage: All</option>
                  <option value="in-use">✅ Active Usages Only</option>
                  <option value="unused">⚠️ Unused / Orphaned</option>
                </select>
              </div>

              {/* Sort Order Selector (4/12) */}
              <div className="md:col-span-4">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-[12px] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer font-mono uppercase"
                >
                  <option value="newest">⏳ Sort: Date Added</option>
                  <option value="name-asc">🔤 Sort: Alphabetical [A-Z]</option>
                  <option value="name-desc">🔤 Sort: Alphabetical [Z-A]</option>
                  <option value="size-desc">💾 Sort: File Weight [Desc]</option>
                </select>
              </div>

            </div>

          </div>

          {/* ASSET BROWSER STAGE */}
          {loading ? (
            <div className="py-24 text-center space-y-4 bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border">
              <div className="w-10 h-10 border-4 border-admin-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">PERFORMING MEDIA CATALOG DISCOVERY...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm p-16 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-admin-primary dark:text-admin-secondary">
                <ImageIcon className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  NO ASSETS MATCHING CRITERIA
                </h3>
                <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed font-medium">
                  We could not find any media files indexed with the specified filters. Try relaxing your filters or uploading a new file.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* DRAG AND DROP CAPABILITY LAYER */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-[24px] transition-all duration-300 ${
                  dragActive ? 'p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border-2 border-dashed border-admin-primary' : ''
                }`}
              >
                {dragActive && (
                  <div className="absolute inset-0 bg-indigo-100/10 dark:bg-indigo-950/20 backdrop-blur-xs rounded-[24px] z-20 flex flex-col items-center justify-center pointer-events-none text-admin-primary dark:text-admin-secondary">
                    <UploadCloud className="w-10 h-10 animate-bounce mb-2" />
                    <span className="text-xs font-mono font-black uppercase tracking-widest">DROP FILE TO ACQUIRE ASSET</span>
                  </div>
                )}

                {/* GRID VIEW STAGE */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                    {filteredAssets.map(asset => {
                      const isSelected = selectedAsset?.id === asset.id;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`group bg-white dark:bg-admin-dark-surface rounded-[20px] border overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all relative ${
                            isSelected
                              ? 'border-admin-primary ring-2 ring-admin-primary/20 dark:ring-admin-primary/40'
                              : 'border-admin-border dark:border-admin-dark-border hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {/* Image box frame with chess background pattern */}
                          <div className="aspect-square relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 overflow-hidden flex items-center justify-center">
                            <ImageWithFade
                              src={asset.url}
                              alt={asset.name}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />

                            {/* Badge tags overlay */}
                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
                              <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-mono font-black uppercase tracking-widest text-white shrink-0 ${
                                asset.isSystemDefault ? 'bg-slate-700/80' : 'bg-emerald-500/80'
                              }`}>
                                {asset.isSystemDefault ? 'System' : 'Upload'}
                              </span>
                              <span className="px-2 py-0.5 rounded-[6px] text-[8px] font-mono font-bold bg-black/50 text-white shrink-0 uppercase tracking-widest">
                                {asset.category}
                              </span>
                            </div>

                            {/* Quick copy overlay handle */}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyUrl(asset.url, asset.id);
                                }}
                                className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                                title="Copy asset link"
                              >
                                {copiedId === asset.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAsset(asset);
                                }}
                                className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                                title="Inspect details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!asset.isSystemDefault && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(asset);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer transition-colors"
                                  title="Delete asset"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Info footer box */}
                          <div className="p-3.5 space-y-1">
                            <p className="text-[10.5px] font-mono font-black text-slate-800 dark:text-slate-200 truncate" title={asset.name}>
                              {asset.name}
                            </p>
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                              <span>{asset.dimensions}</span>
                              <span className="text-zinc-500 dark:text-zinc-400">{asset.size}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* LIST VIEW STAGE */}
                {viewMode === 'list' && (
                  <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-xs overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/20 text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                          <th className="py-4 px-5">Preview</th>
                          <th className="py-4 px-4">Filename</th>
                          <th className="py-4 px-4">Category</th>
                          <th className="py-4 px-4">Dimensions</th>
                          <th className="py-4 px-4">Size</th>
                          <th className="py-4 px-4">Source</th>
                          <th className="py-4 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                        {filteredAssets.map(asset => {
                          const isSelected = selectedAsset?.id === asset.id;
                          return (
                            <tr
                              key={asset.id}
                              onClick={() => setSelectedAsset(asset)}
                              className={`text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer transition-colors ${
                                isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                              }`}
                            >
                              <td className="py-3 px-5">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-150 dark:border-slate-800 bg-slate-100 flex items-center justify-center shrink-0">
                                  <ImageWithFade
                                    src={asset.url}
                                    alt={asset.name}
                                    className="object-cover w-full h-full"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono font-black text-slate-800 dark:text-slate-200 max-w-xs truncate" title={asset.name}>
                                {asset.name}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-[6px] text-[8.5px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                  {asset.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                                {asset.dimensions}
                              </td>
                              <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                                {asset.size}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-mono font-black uppercase tracking-widest text-white ${
                                  asset.isSystemDefault ? 'bg-slate-700/80' : 'bg-emerald-500/80'
                                }`}>
                                  {asset.isSystemDefault ? 'System' : 'Upload'}
                                </span>
                              </td>
                              <td className="py-3 px-5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleCopyUrl(asset.url, asset.id)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                  title="Copy URL"
                                >
                                  {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => setSelectedAsset(asset)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                  title="Inspect Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {!asset.isSystemDefault && (
                                  <button
                                    onClick={() => handleDelete(asset)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                    title="Expunge Resource"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ACTIVE SELECTION DETAILED SIDEBAR PANEL (col-span-4) */}
        <AnimatePresence>
          {selectedAsset && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.98 }}
              className="lg:col-span-4 bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border p-5 shadow-sm space-y-6 shrink-0 sticky top-4 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-1.5 text-admin-primary dark:text-admin-secondary text-xs font-black uppercase tracking-widest">
                  <Info className="w-4 h-4" />
                  <span>Asset Metadata_</span>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Asset Full Preview Frame */}
              <div className="aspect-video relative rounded-[16px] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 overflow-hidden flex items-center justify-center">
                <ImageWithFade
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  className="object-contain max-h-full max-w-full"
                  referrerPolicy="no-referrer"
                />
                
                {/* External Anchor tag redirection */}
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Open source file in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Asset Name Edit Field */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                  Asset Filename:
                </label>
                {isEditingName && !selectedAsset.isSystemDefault ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-[10px] text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                    <button
                      onClick={handleRename}
                      className="px-3 py-1.5 rounded-[10px] bg-admin-primary text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-[12px] border border-slate-100 dark:border-slate-800/40 font-mono text-xs text-slate-800 dark:text-slate-100 truncate">
                    <span className="truncate font-black">{selectedAsset.name}</span>
                    {!selectedAsset.isSystemDefault && (
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Rename file"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Tech Specs Block */}
              <div className="space-y-2.5">
                <p className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400">Technical Details:</p>
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-[16px] border border-slate-100 dark:border-slate-800/60 font-mono text-[10.5px] space-y-2 text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    <span>Source Origin:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {selectedAsset.isSystemDefault ? 'Core System Asset' : 'Custom Upload'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    <span>Dimension resolution:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedAsset.dimensions}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    <span>File Size:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedAsset.size}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    <span>Asset Format:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{selectedAsset.type}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span>Registered Date:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedAsset.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Usage Scanning Results */}
              <div className="space-y-2.5">
                <p className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400">Layout References Scan:</p>
                
                {loadingUsages ? (
                  <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/30 rounded-[16px] border border-slate-100 dark:border-slate-800/60">
                    <div className="w-5 h-5 border-2 border-admin-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : selectedAssetUsages.length === 0 ? (
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-[16px] border border-amber-100/40 dark:border-amber-900/25 flex items-start gap-2.5 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[10.5px] font-bold uppercase tracking-wide">Orphaned Resource / Unused</p>
                      <p className="text-[9.5px] text-amber-600 dark:text-amber-400 leading-normal font-medium">This asset is not actively referenced by any product catalog, brand indicator, categories or banner slides.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-[16px] border border-slate-100 dark:border-slate-800/60 max-h-48 overflow-y-auto">
                    {selectedAssetUsages.map((usage, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-admin-dark-surface rounded-[10px] border border-slate-100 dark:border-slate-800 text-[10px] font-bold"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-admin-primary dark:text-admin-secondary text-[7.5px] font-mono font-black uppercase tracking-wider shrink-0">
                            {usage.type}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 truncate" title={usage.name}>
                            {usage.name}
                          </span>
                        </div>
                        <span className="text-[8.5px] text-emerald-500 font-mono shrink-0 font-black">● ACTIVE</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-50 dark:border-slate-850">
                <button
                  onClick={() => handleCopyUrl(selectedAsset.url, selectedAsset.id)}
                  className="flex-1 px-3 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                >
                  {copiedId === selectedAsset.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Link</span>
                </button>
                {!selectedAsset.isSystemDefault && (
                  <button
                    onClick={() => handleDelete(selectedAsset)}
                    className="flex-1 px-3 py-2.5 rounded-[10px] bg-rose-500 text-white hover:bg-rose-600 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Image</span>
                  </button>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};

export default MediaLibrary;
