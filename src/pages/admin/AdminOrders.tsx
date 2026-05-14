import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, Filter, Search, MoreHorizontal, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  created_at: string;
  profiles: {
    full_name: string;
    address: string;
  };
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (full_name, address)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data as any);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) {
      setOrders(current => 
        current.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o)
      );
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.includes(search) || o.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'All' || o.status === filter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-light text-charcoal italic">Order Manager</h1>
        <p className="text-gray-400">Track and fulfill customer orders globally.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent/20 outline-none shadow-sm"
          />
        </div>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-full sm:w-auto overflow-x-auto">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                filter === s ? "bg-accent text-white" : "text-gray-400 hover:text-accent"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-50 italic text-gray-400">
            No orders found matching your selection.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id}
              className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* ID & Customer */}
                <div className="flex items-start space-x-6">
                  <div className={cn(
                    "p-4 rounded-3xl",
                    order.status === 'Delivered' ? "bg-green-50 text-green-600" : "bg-secondary-bg text-accent"
                  )}>
                    {order.status === 'Shipped' ? <Truck className="w-8 h-8" /> : 
                     order.status === 'Delivered' ? <CheckCircle className="w-8 h-8" /> : 
                     <Package className="w-8 h-8" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-display text-xl font-semibold text-charcoal">#{order.id.slice(0, 8)}</span>
                      <span className="text-xs font-medium text-gray-400">{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-charcoal">{order.profiles?.full_name}</p>
                      <div className="flex items-center text-xs text-gray-400 space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{order.profiles?.address || 'Tanzania Shipping Address'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount & Status Dropdown */}
                <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-12">
                  <div className="text-center sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Amount</p>
                    <p className="text-2xl font-display font-semibold text-accent">${order.total_amount}</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 w-full sm:w-48">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2 text-center sm:text-left">Change Status</label>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={cn(
                          "w-full px-6 py-3 rounded-2xl outline-none font-bold text-xs uppercase tracking-widest appearance-none cursor-pointer transition-colors",
                          order.status === 'Pending' ? "bg-red-50 text-red-500" :
                          order.status === 'Processing' ? "bg-blue-50 text-blue-500" :
                          order.status === 'Shipped' ? "bg-purple-50 text-purple-600" :
                          "bg-green-50 text-green-600"
                        )}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                      <MoreHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
