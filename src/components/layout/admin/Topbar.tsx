import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Sun, Moon, Search, User, ChevronRight, Home } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Get current path splits for breadcrumbs
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Capitalize name helper
  const formatName = (str: string) => {
    return str
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-10 h-16 bg-white/80 dark:bg-admin-dark-surface/80 backdrop-blur-md border-b border-admin-border dark:border-admin-dark-border px-4 flex items-center justify-between transition-colors duration-300">
      
      {/* Left items: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-[8px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-admin-text-primary dark:text-admin-dark-text-primary cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="hidden sm:flex items-center space-x-1.5 text-xs font-medium text-admin-text-secondary dark:text-admin-dark-text-secondary">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-1 hover:text-admin-primary dark:hover:text-admin-secondary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>CMS</span>
          </Link>
          
          {pathnames.slice(1).map((value, index) => {
            const to = `/admin/${pathnames.slice(1, index + 2).join('/')}`;
            const isLast = index === pathnames.slice(1).length - 1;

            return (
              <React.Fragment key={to}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-admin-text-primary dark:text-admin-dark-text-primary">
                    {formatName(value)}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="hover:text-admin-primary dark:hover:text-admin-secondary transition-colors"
                  >
                    {formatName(value)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right items: Search, theme toggle, and user details */}
      <div className="flex items-center gap-3">
        
        {/* Simple search bar placeholder */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search console..."
            disabled
            className="w-48 bg-slate-50 dark:bg-slate-900 border border-admin-border dark:border-admin-dark-border pl-9 pr-3 py-2 rounded-[8px] text-[11px] font-mono font-bold tracking-wider text-slate-400 cursor-not-allowed opacity-80"
          />
          <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-admin-border dark:border-admin-dark-border text-admin-text-secondary dark:text-admin-dark-text-secondary hover:text-admin-primary dark:hover:text-admin-secondary hover:border-admin-primary dark:hover:border-admin-secondary transition-all cursor-pointer"
          title="Toggle UI Theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        {/* User profile capsule */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-admin-border dark:border-admin-dark-border">
          <div className="w-8 h-8 rounded-full bg-admin-primary/10 flex items-center justify-center border border-admin-primary/20 text-admin-primary dark:text-admin-secondary text-sm font-black">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[11px] font-bold text-admin-text-primary dark:text-admin-dark-text-primary leading-tight uppercase">
              {localStorage.getItem('adminName') || 'SUPER ADMIN'}
            </span>
            <span className="text-[9px] font-mono font-bold text-admin-primary dark:text-admin-secondary tracking-widest leading-none">
              SECURED
            </span>
          </div>
        </div>

      </div>

    </header>
  );
};

export default Topbar;
