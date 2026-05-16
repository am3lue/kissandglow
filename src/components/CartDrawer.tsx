import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';

const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeItem, total } = useCart();
  const { formatPrice } = useLocation();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[101] h-full w-full sm:w-[400px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display text-xl font-semibold text-charcoal tracking-wide">
                Your Bag
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-secondary-bg transition-colors"
                id="close-cart-btn"
              >
                <X className="w-6 h-6 text-charcoal" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-10 py-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-secondary-bg rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium font-serif italic text-lg">Your bag is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-8 py-3 bg-accent text-white rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex space-x-6 group">
                      <div className="w-20 h-24 flex-shrink-0 bg-secondary-bg rounded-2xl overflow-hidden shadow-sm">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xs font-semibold text-charcoal tracking-wide uppercase">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-accent transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-serif text-charcoal mt-1 italic">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 bg-secondary-bg w-fit rounded-full px-3 py-1 scale-90 -ml-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-accent transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-accent transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Styled as Bag Summary in Vibrant Palette */}
            {items.length > 0 && (
              <div className="p-10 bg-charcoal text-white rounded-tl-[40px] space-y-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] tracking-widest uppercase font-semibold opacity-60">Bag Summary</p>
                  <p className="text-[10px] opacity-40">{items.length} items</p>
                </div>
                
                <div className="flex justify-between items-end border-b border-white/10 pb-6">
                  <span className="text-white/60 text-xs font-medium tracking-wide">Subtotal</span>
                  <span className="text-3xl font-serif font-light">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-4 bg-accent text-white rounded-full text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center space-x-2 shadow-xl shadow-accent/40 hover:bg-accent-hover transition-all group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <p className="text-center text-[10px] text-white/30 italic">
                    Free global shipping on orders over $150
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
