import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Package, User, MapPin, Phone, LogOut, ChevronRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
}

const Profile: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    const [profileRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user?.id).single(),
      supabase.from('orders').select('*').eq('user_id', user?.id).order('created_at', { ascending: false })
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    setLoading(false);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center font-display text-accent italic animate-pulse">Loading Account...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 lg:flex lg:space-x-16">
      {/* Sidebar Info */}
      <div className="lg:w-1/3 mb-12 lg:mb-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-accent/5 border border-gray-50 sticky top-32 space-y-8"
        >
          {isAdmin && (
            <Link 
              to="/admin" 
              className="group flex items-center justify-between p-6 bg-accent rounded-[1.5rem] text-white shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">System Access</p>
                  <p className="font-display text-lg italic">Admin Console</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
          )}

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-secondary-bg rounded-full flex items-center justify-center overflow-hidden">
              <User className="w-12 h-12 text-accent/20" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-charcoal">{profile?.full_name || 'Glow Member'}</h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-secondary-bg rounded-2xl text-accent">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Shipping Address</p>
                <p className="text-sm text-charcoal">{profile?.address || 'Dar es Salaam, Tanzania'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-secondary-bg rounded-2xl text-accent">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Phone Number</p>
                <p className="text-sm text-charcoal">{profile?.phone || '+255 (0) 700 000 000'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="mt-10 w-full py-4 border border-red-50 text-red-500 rounded-2xl font-medium flex items-center justify-center space-x-2 hover:bg-red-50 transition-all transform active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </motion.div>
      </div>

      {/* Main Content (Order History) */}
      <div className="lg:w-2/3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-light text-charcoal italic">Order History</h2>
            <div className="px-4 py-1 bg-accent/5 text-accent rounded-full text-xs font-bold uppercase tracking-widest">
              {orders.length} Orders
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-secondary-bg/50 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-medium text-charcoal">No orders yet</h3>
              <p className="text-sm text-gray-500 max-w-xs px-4">Ready to start your glow journey? Your first order is just a few clicks away.</p>
              <button className="px-8 py-3 bg-accent text-white rounded-full font-medium shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all">
                Shop New Arrivals
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-secondary-bg rounded-2xl text-accent">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-charcoal font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-display font-semibold text-charcoal">${order.total_amount}</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                        order.status === 'Delivered' ? "bg-green-50 text-green-600" : "bg-accent/5 text-accent"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
