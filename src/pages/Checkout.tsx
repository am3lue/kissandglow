import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle, CreditCard, Truck, MapPin } from 'lucide-react';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [address, setAddress] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.id === 'template-user-id') {
      // Mock success for template mode
      setTimeout(() => {
        clearCart();
        setOrderComplete(true);
        setLoading(false);
      }, 1500);
      return;
    }
    
    setLoading(true);
    
    // Create order
    const { data: order, error: orderError } = await supabase.from('orders').insert([
      {
        user_id: user.id,
        total_amount: total,
        status: 'Pending'
      }
    ]).select().single();

    if (orderError) {
      console.error(orderError);
      setLoading(false);
      return;
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error(itemsError);
      setLoading(false);
      return;
    }

    // Update user address
    await supabase.from('profiles').update({ address }).eq('id', user.id);

    clearCart();
    setOrderComplete(true);
    setLoading(false);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-gray-50"
        >
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-4xl font-light text-charcoal mb-4 italic">Thank You!</h1>
          <p className="text-charcoal/60 mb-10 leading-relaxed">
            Your order has been received and is being processed for global shipping. We've sent a confirmation email to {user?.email}.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-10 py-4 bg-accent text-white rounded-full text-[10px] font-bold tracking-widest uppercase shadow-xl shadow-accent/20 hover:bg-accent-hover transition-all"
          >
            Return to Store
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* Left: Checkout Form */}
        <div className="space-y-12">
          <header>
            <h1 className="font-serif text-5xl font-light text-charcoal mb-4">Checkout</h1>
            <p className="text-charcoal/40 text-[10px] font-bold uppercase tracking-[0.2em]">Secure Checkout • Global Shipping</p>
          </header>

          <form onSubmit={handleCheckout} className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-secondary-bg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal">Shipping Destination</h2>
              </div>
              
              <div className="space-y-4">
                <textarea
                  required
                  rows={4}
                  placeholder="Street, City, State/Province, Country, ZIP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-8 py-5 bg-secondary-bg border-none rounded-[2rem] outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-charcoal"
                />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-secondary-bg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal">Payment Method</h2>
              </div>
              <div className="p-8 border-2 border-accent/20 rounded-[2rem] bg-accent/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm italic font-serif text-accent font-bold">K & G Pay</div>
                  <div>
                    <p className="text-sm font-bold text-charcoal">KISS & GLOW Direct</p>
                    <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">Supports Global Cards & Mobile Money</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-4 border-accent flex items-center justify-center">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                </div>
              </div>
            </section>

            <button
              disabled={loading || items.length === 0}
              className="w-full py-6 bg-accent text-white rounded-full text-xs font-bold tracking-[0.3em] uppercase shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Purchase</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <aside className="bg-charcoal text-white rounded-[3rem] p-10 lg:p-14 sticky top-24">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mb-10">Order Summary</h2>
          
          <div className="space-y-8 mb-12">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-[10px] opacity-40">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-serif italic">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-10 border-t border-white/10">
            <div className="flex justify-between text-xs opacity-60">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs opacity-60">
              <span>Shipping</span>
              <span className="italic font-serif text-accent">Complimentary</span>
            </div>
            <div className="flex justify-between items-end pt-6">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Due</span>
              <span className="text-4xl font-serif font-light">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center space-x-4">
            <Truck className="w-5 h-5 text-accent" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 leading-relaxed">
              Arrives in 3-5 business days <br /> (Tanzania & Worldwide)
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
