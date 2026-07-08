import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import Categories from '../pages/Categories';
import Brands from '../pages/Brands';
import ProductDetail from '../pages/ProductDetail';
import Wishlist from '../pages/Wishlist';
import About from '../pages/About';
import NotFound from '../pages/NotFound';
import SpecimenMatcher from '../pages/SpecimenMatcher';

// LookVerse CMS Admin Imports (Milestone 01)
import AdminLayout from '../components/layout/admin/AdminLayout';
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/DashboardOverview';
import AdminProducts from '../pages/admin/Products';
import AdminCategories from '../pages/admin/Categories';
import AdminBrands from '../pages/admin/Brands';
import AdminBanners from '../pages/admin/Banners';
import AdminAffiliate from '../pages/admin/Affiliate';
import AdminAnalytics from '../pages/admin/AnalyticsDashboard';
import AdminMedia from '../pages/admin/MediaLibrary';
import AdminSettings from '../pages/admin/Settings';
import AdminProfile from '../pages/admin/Profile';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public storefront routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="categories" element={<Categories />} />
        <Route path="brands" element={<Brands />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="about" element={<About />} />
        <Route path="specimen-matcher" element={<SpecimenMatcher />} />
      </Route>

      {/* LookVerse CMS Admin Console routes */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="affiliate" element={<AdminAffiliate />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Catch-all Not Found pages under storefront wrapper */}
      <Route path="*" element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
export default AppRoutes;

