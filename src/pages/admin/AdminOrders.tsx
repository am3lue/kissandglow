import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, Filter, Search, MoreHorizontal, MapPin, X, ChevronDown, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/DialogContext';
import { useLocation } from '../../contexts/LocationContext';
import OrderMessages from '../../components/OrderMessages';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    address: string;
  };
  order_items: {
    quantity: number;
    price: number;
    products: {
      name: string;
      image_url: string;
    };
  }[];
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useLocation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name, email, address),
          order_items (
            quantity,
            price,
            products:product_id (name, image_url)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        showToast('Failed to fetch orders', 'error');
        // Fallback
        const { data: simpleData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (simpleData) setOrders(simpleData.map(o => ({ ...o, profiles: { full_name: 'Unknown Customer', email: 'N/A', address: 'No address provided' }, order_items: [] })) as any);
      } else if (data) {
        setOrders(data as any);
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;

      setOrders(current => 
        current.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o)
      );
      showToast(`Order status updated to ${newStatus}`, 'success');
      setActiveDropdown(null);
    } catch (err: any) {
      showToast('Error updating order: ' + err.message, 'error');
    }
  };

  const cancelOrder = async (orderId: string) => {
    const isConfirmed = await confirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? This will notify the user and stop processing.',
      confirmText: 'Yes, Cancel',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', orderId);
      
      if (error) throw error;

      setOrders(current => 
        current.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o)
      );
      showToast('Order cancelled successfully', 'info');
    } catch (err: any) {
      showToast('Error cancelling order: ' + err.message, 'error');
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
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
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
                      <p className="font-semibold text-charcoal">{order.profiles?.full_name || 'Guest Customer'}</p>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{order.profiles?.email}</p>
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
                    <p className="text-2xl font-display font-semibold text-accent">{formatPrice(order.total_amount)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-2 w-full sm:w-48 relative">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2 text-center sm:text-left">Change Status</label>
                      
                      {/* Custom GlowDropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
                          className={cn(
                            "w-full px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-between transition-all border border-transparent shadow-sm hover:shadow-md",
                            order.status === 'Pending' ? "bg-red-50 text-red-500 hover:bg-red-100" :
                            order.status === 'Processing' ? "bg-blue-50 text-blue-500 hover:bg-blue-100" :
                            order.status === 'Shipped' ? "bg-purple-50 text-purple-600 hover:bg-purple-100" :
                            order.status === 'Cancelled' ? "bg-gray-100 text-gray-500" :
                            "bg-green-50 text-green-600 hover:bg-green-100"
                          )}
                        >
                          <span>{order.status}</span>
                          <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === order.id ? "rotate-180" : "")} />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === order.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute z-[100] left-0 right-0 top-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 p-2 overflow-hidden"
                            >
                              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order.id, s)}
                                  className={cn(
                                    "w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors",
                                    order.status === s ? "bg-secondary-bg text-accent" : "text-gray-400 hover:bg-secondary-bg hover:text-charcoal"
                                  )}
                                >
                                  {s}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveChat(order.id)}
                        className="p-4 text-accent hover:bg-accent/5 rounded-2xl transition-all mt-6 flex items-center space-x-2 border border-accent/10"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Chat</span>
                      </button>

                      {order.status !== 'Cancelled' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all mt-6"
                          title="Cancel Order"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {order.status === 'Cancelled' && (
                <div className="mt-6 pt-6 border-t border-dashed border-gray-100 flex items-center space-x-3 text-red-500 bg-red-50/50 p-4 rounded-2xl">
                  <X className="w-5 h-5" />
                  <p className="text-sm font-medium italic">This order has been cancelled and is no longer being processed.</p>
                </div>
              )}

              {/* Order Items */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 px-2">Order Items ({order.order_items.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-4 bg-secondary-bg/30 p-3 rounded-2xl border border-white">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.products?.image_url} alt={item.products?.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-charcoal truncate">{item.products?.name}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity} • {formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <OrderMessages 
        orderId={activeChat || ''} 
        isOpen={!!activeChat} 
        onClose={() => setActiveChat(null)} 
      />
    </div>
  );
};

export default AdminOrders;
