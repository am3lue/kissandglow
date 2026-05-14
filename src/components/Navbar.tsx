import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Shop All', path: '/products' },
    { name: 'Skincare', path: '/category/skincare' },
    { name: 'Makeup', path: '/category/makeup' },
    { name: 'Accessories', path: '/category/accessories' },
  ];

  const adminLink = { name: 'Admin Console', path: '/admin' };

  return (
    <nav className="sticky top-0 z-50 w-full premium-blur border-b border-[#FDF6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-secondary-bg transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Nav Links (Left) */}
          <div className="hidden md:flex flex-1 items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-[10px] font-bold tracking-[0.2em] uppercase transition-colors",
                  location.pathname === link.path ? "text-accent" : "text-charcoal/60 hover:text-charcoal"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Logo (Center) */}
          <div className="flex-shrink-0 flex justify-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-light tracking-[0.2em] uppercase text-charcoal">
                KISS & GLOW
              </span>
            </Link>
          </div>

          {/* Icons (Right) */}
          <div className="flex flex-1 justify-end items-center space-x-6">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-[10px] font-bold tracking-widest uppercase text-accent bg-accent/5 px-3 py-1 rounded-full hover:bg-accent/10 transition-all hidden lg:block"
              >
                Admin Console
              </Link>
            )}
            <Link
              to={user ? (isAdmin ? "/admin" : "/account") : "/login"}
              className="p-2 rounded-full hover:bg-secondary-bg transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-full hover:bg-secondary-bg transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 bg-accent text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full translate-x-1/2 -translate-y-1/2 font-bold"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-charcoal hover:text-accent"
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to={adminLink.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-accent pt-4 border-t border-gray-50"
                >
                  {adminLink.name}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
