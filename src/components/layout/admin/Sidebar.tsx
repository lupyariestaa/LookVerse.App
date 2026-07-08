import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Award,
  Image as ImageIcon,
  Link as LinkIcon,
  FolderOpen,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const navigate = useNavigate();

  const menuGroups = [
    {
      group: 'Dashboard',
      items: [
        { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Analytics Stream', path: '/admin/analytics', icon: Sparkles }
      ]
    },
    {
      group: 'Content',
      items: [
        { name: 'Products', path: '/admin/products', icon: ShoppingBag },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Brands', path: '/admin/brands', icon: Award },
        { name: 'Banners', path: '/admin/banners', icon: ImageIcon }
      ]
    },
    {
      group: 'Website',
      items: [
        { name: 'Affiliate Links', path: '/admin/affiliate', icon: LinkIcon },
        { name: 'Media Library', path: '/admin/media', icon: FolderOpen },
        { name: 'Settings', path: '/admin/settings', icon: Settings }
      ]
    },
    {
      group: 'Account',
      items: [
        { name: 'Profile', path: '/admin/profile', icon: User }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-admin-dark-sidebar border-r border-admin-border dark:border-admin-dark-border transition-colors duration-300">
      
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-admin-border dark:border-admin-dark-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 bg-admin-primary rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(255,77,0,0.25)]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-sans font-black text-xs uppercase tracking-wider text-admin-text-primary dark:text-admin-dark-text-primary leading-none">
                LOOKVERSE
              </span>
              <span className="text-[10px] font-mono font-bold text-admin-primary tracking-[0.2em]">
                CMS V1.0
              </span>
            </motion.div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-full border border-admin-border dark:border-admin-dark-border text-admin-text-secondary dark:text-admin-dark-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="text-[9px] font-mono font-black uppercase tracking-[0.25em] pl-3 text-admin-text-secondary dark:text-admin-dark-text-secondary"
              >
                {group.group}
              </motion.p>
            )}
            <div className="space-y-1">
              {group.items.map((item, iIdx) => (
                <NavLink
                  key={iIdx}
                  to={item.path}
                  onClick={() => setIsOpenMobile(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3 py-2.5 rounded-[10px] text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-admin-primary text-white shadow-[0_4px_12px_rgba(255,77,0,0.2)]'
                        : 'text-admin-text-secondary dark:text-admin-dark-text-secondary hover:text-admin-primary dark:hover:text-admin-secondary hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`
                  }
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer / Logout */}
      <div className="p-3 border-t border-admin-border dark:border-admin-dark-border">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-[10px] text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 text-red-500" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold"
            >
              Sign Out
            </motion.span>
          )}
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-20 h-full transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar overlay drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-50 h-full md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
