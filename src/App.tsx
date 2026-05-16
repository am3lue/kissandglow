import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { DialogProvider } from './contexts/DialogContext';
import { LocationProvider } from './contexts/LocationContext';
import { ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import AuthPage from './pages/AuthPage';
import Profile from './pages/Profile';
import Category from './pages/Category';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center font-display text-accent italic animate-pulse">KISS & GLOW</div>;
  
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <ToastProvider>
      <DialogProvider>
        <LocationProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <CartDrawer />
            <main className="flex-grow">
              <Routes>
                {/* Storefront Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login" element={<AuthPage />} />
                
                <Route path="/account" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <ProtectedRoute adminOnly>
                    <AdminProducts />
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute adminOnly>
                    <AdminOrders />
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="border-t border-[#FDF6F0]">
              <div className="flex flex-col md:flex-row h-auto md:h-24">
                <Link to="/category/makeup" className="flex-1 border-b md:border-b-0 md:border-r border-[#FDF6F0] flex items-center justify-center gap-4 py-8 md:py-0 hover:bg-[#FDF6F0] transition-colors cursor-pointer group">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">01</span>
                  <span className="font-serif text-lg text-charcoal">Makeup</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-accent" />
                </Link>
                <Link to="/category/skincare" className="flex-1 border-b md:border-b-0 md:border-r border-[#FDF6F0] flex items-center justify-center gap-4 py-8 md:py-0 hover:bg-[#FDF6F0] transition-colors cursor-pointer group">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">02</span>
                  <span className="font-serif text-lg text-charcoal">Skincare</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-accent" />
                </Link>
                <Link to="/category/accessories" className="flex-1 flex items-center justify-center gap-4 py-8 md:py-0 hover:bg-[#FDF6F0] transition-colors cursor-pointer group">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">03</span>
                  <span className="font-serif text-lg text-charcoal">Accessories</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-accent" />
                </Link>
              </div>
              <div className="bg-white py-8 px-4 text-center border-t border-[#FDF6F0]">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal/30">
                  © 2026 Kiss and Glow • Crafted for Tanzania & The World
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
    </LocationProvider>
    </DialogProvider>
  </ToastProvider>
  );
}

export default App;
