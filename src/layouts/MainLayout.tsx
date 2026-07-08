import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useScrollTop from '../hooks/useScrollTop';

export const MainLayout: React.FC = () => {
  // Automatically scroll back to top on path changes
  useScrollTop();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-brand-black text-brand-black dark:text-brand-white transition-colors duration-300">
      {/* Header Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
};
export default MainLayout;
