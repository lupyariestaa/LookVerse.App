import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Auth Guard
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  if (!isAuthenticated) {
    // Redirect to login page if unauthorized
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-admin-bg dark:bg-admin-dark-bg text-admin-text-primary dark:text-admin-dark-text-primary transition-colors duration-300 font-sans flex">
      
      {/* CMS Navigation Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Pane */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {/* Dynamic Topbar Header */}
        <Topbar onMenuClick={() => setIsOpenMobile(true)} />

        {/* Dynamic Inner Router Views */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* CMS Console Footer */}
        <footer className="py-6 px-8 border-t border-admin-border dark:border-admin-dark-border bg-white dark:bg-admin-dark-sidebar flex flex-col sm:flex-row justify-between items-center gap-2 transition-colors duration-300 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-600">
          <span>LOOKVERSE CONTENT MANAGEMENT SYSTEM // ALL RIGHTS RESERVED</span>
          <span>BUILD // V1.0.0-PROD</span>
        </footer>
      </div>

    </div>
  );
};

export default AdminLayout;
