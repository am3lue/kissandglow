import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Package, ShoppingCart, Users, TrendingUp, ChevronRight, Clock, CheckCircle, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useToast } from '../../contexts/ToastContext';
import { useLocation } from '../../contexts/LocationContext';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalSales: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { formatPrice } = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const [productsRes, ordersRes, profilesRes] = await Promise.all([
      supabase.from('products').select('count', { count: 'exact' }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('profiles').select('count', { count: 'exact' })
    ]);

    const pending = await supabase.from('orders').select('count', { count: 'exact' }).eq('status', 'Pending');

    setStats({
      totalProducts: productsRes.count || 0,
      pendingOrders: pending.count || 0,
      totalUsers: profilesRes.count || 0,
      totalSales: 0 // Initialize at 0
    });

    if (ordersRes.data) setRecentOrders(ordersRes.data);
    setLoading(false);
  };

  const seedSampleOrders = async () => {
    try {
      const { data: profile } = await supabase.from('profiles').select('id, full_name, email').limit(1).single();
      const { data: products } = await supabase.from('products').select('id, price').limit(2);
      
      if (!profile) {
        showToast('No customers found. Please sign up an account first.', 'warning');
        return;
      }
      if (!products || products.length === 0) {
        showToast('No products found. Please seed products first.', 'warning');
        return;
      }

      // 1. Create Order
      const { data: order, error: orderError } = await supabase.from('orders').insert([
        { user_id: profile.id, total_amount: products[0].price * 2, status: 'Pending' }
      ]).select().single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const { error: itemError } = await supabase.from('order_items').insert([
        { order_id: order.id, product_id: products[0].id, quantity: 2, price: products[0].price }
      ]);

      if (itemError) throw itemError;

      showToast(`Complete order seeded for ${profile.full_name || profile.email}`, 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast('Error seeding orders: ' + err.message, 'error');
    }
  };

  const seedSampleProducts = async () => {
    setLoading(true);
    showToast("Seeding professional catalog...", "info");
    const samples = [
      {
        name: "Satin Silk Lipstick",
        description: "A luxury matte lipstick that feels like silk on the lips. Long-wearing and high-pigment.",
        price: 28.00,
        original_price: 35.00,
        category: "Makeup",
        stock_count: 120,
        image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=800&auto=format&fit=crop",
        is_featured: true,
        how_to_use: "Apply starting from the center of the upper lip towards the corners.",
        ingredients: "Candelilla Wax, Jojoba Oil, Vitamin E, Mineral Pigments.",
        variants: [{ name: "Shade", value: "Rose Petal" }, { name: "Shade", value: "Midnight Red" }],
        result_images: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80"]
      },
      {
        name: "Liquid Gold Facial Oil",
        description: "24k Gold infused facial oil for a radiant, youthful glow. Restores moisture and reduces fine lines.",
        price: 52.00,
        original_price: 68.00,
        category: "Skincare",
        stock_count: 45,
        image_url: "https://c.pxhere.com/photos/da/a2/deo_creme_mint_eucalyptus_lemon_sage_skin_care-543148.jpg!d",
        is_featured: true,
        how_to_use: "Massage 2-3 drops onto clean skin before moisturizer.",
        ingredients: "Argan Oil, Rosehip Oil, 24k Gold Flakes, Lavender Extract.",
        variants: [{ name: "Size", value: "30ml" }, { name: "Size", value: "60ml" }],
        result_images: ["https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&q=80"]
      },
      {
        name: "Pro-Glow Blender Set",
        description: "Professional makeup sponges for a flawless airbrushed finish. Set of 3.",
        price: 18.00,
        original_price: 24.00,
        category: "Accessories",
        stock_count: 200,
        image_url: "https://images.unsplash.com/photo-1552046122-03184de85e08?q=80&w=800&auto=format&fit=crop",
        is_featured: false,
        how_to_use: "Dampen with water, squeeze out excess, and bounce over skin.",
        ingredients: "Latex-free hydrophilic foam.",
        variants: [{ name: "Color", value: "Rose/Slate" }]
      },
      {
        name: "Velvet Matte Foundation",
        description: "Full coverage foundation that stays matte for 24 hours. Waterproof and smudge-proof.",
        price: 36.00,
        original_price: 45.00,
        category: "Makeup",
        stock_count: 85,
        image_url: "https://images.unsplash.com/photo-1599733589046-10c005739ef0?q=80&w=800&auto=format&fit=crop",
        is_featured: false,
        how_to_use: "Apply with a brush or sponge, blending outwards from the center of the face.",
        ingredients: "Water, Cyclopentasiloxane, Silica, Dimethicone.",
        variants: [{ name: "Shade", value: "Fair Ivory" }, { name: "Shade", value: "Honey Beige" }]
      },
      {
        name: "Crystal Quartz Roller",
        description: "Natural rose quartz facial roller to reduce puffiness and improve circulation.",
        price: 22.00,
        original_price: 30.00,
        category: "Accessories",
        stock_count: 60,
        image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        is_featured: false,
        how_to_use: "Roll in an upward and outward motion over the face and neck.",
        ingredients: "100% Brazilian Rose Quartz.",
        variants: [{ name: "Stone", value: "Rose Quartz" }]
      },
      {
        name: "Azure Mineral Mask",
        description: "Deep sea mineral mud mask for detoxification and pore tightening.",
        price: 28.00,
        category: "Skincare",
        stock_count: 55,
        image_url: "https://images.unsplash.com/photo-1725695788066-34e372183231?auto=format&fit=crop&q=80",
        is_featured: false,
        how_to_use: "Apply even layer, wait 10 mins, rinse with warm water.",
        ingredients: "Dead Sea Mud, Kaolin Clay, Aloe Vera.",
        variants: [{ name: "Pack", value: "Single Jar" }]
      }
    ];

    const { error } = await supabase.from('products').insert(samples);
    if (error) {
      showToast("Seeding failed: " + error.message, "error");
    } else {
      showToast("Professional catalog seeded!", "success");
      fetchDashboardData();
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'Inventory', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', path: '/admin/products' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-accent', bg: 'bg-accent/5', path: '/admin/orders' },
    { label: 'Total Customers', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', path: '#' },
    { label: 'Revenue (Mock)', value: formatPrice(stats.totalSales), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', path: '#' },
  ];

  if (loading) return <div className="p-8 font-display text-accent animate-pulse italic">Loading Dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-light text-charcoal italic">Admin Console</h1>
          <p className="text-gray-400">Welcome back. Here's what's happening today at Kiss & Glow.</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex space-x-3">
            <Link
              to="/"
              className="px-6 py-3 bg-white text-charcoal rounded-full font-medium border border-gray-100 hover:bg-secondary-bg transition-all flex items-center space-x-2"
            >
              <span>View Storefront</span>
            </Link>
            <button
              onClick={seedSampleOrders}
              className="px-6 py-3 bg-white text-accent rounded-full font-medium border border-accent/10 hover:bg-accent/5 transition-all"
            >
              Seed Sample Orders
            </button>
            <button
              onClick={seedSampleProducts}
              className="px-6 py-3 bg-secondary-bg text-accent rounded-full font-medium border border-accent/10 hover:bg-accent/5 transition-all"
            >
              Seed Sample Products
            </button>
            <Link to="/admin/products" className="px-6 py-3 bg-accent text-white rounded-full font-medium shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all">
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link key={card.label} to={card.path}>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6 h-full"
            >
              <div className={cn("p-4 rounded-2xl", card.bg, card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-display font-semibold text-charcoal">{card.value}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Activity and Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent Orders */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-display font-semibold text-charcoal">Recent Orders</h2>
            <Link to="/admin/orders" className="text-accent text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No recent orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-secondary-bg/30 rounded-2xl group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "p-2 rounded-full",
                      order.status === 'Delivered' ? "bg-green-100 text-green-600" : "bg-accent/10 text-accent"
                    )}>
                      {order.status === 'Delivered' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-sm font-bold text-charcoal">{formatPrice(order.total_amount)}</p>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Setup Guide */}
        <section className="bg-accent/5 p-8 rounded-[2.5rem] border border-accent/10">
          <h2 className="text-xl font-display font-semibold text-accent mb-6 italic">Store Quick Start</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">1</div>
              <div>
                <p className="font-semibold text-charcoal">Add Your Products</p>
                <p className="text-xs text-gray-500 leading-relaxed">Go to 'Inventory' to add your beauty products. Remember to upload high-quality images!</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">2</div>
              <div>
                <p className="font-semibold text-charcoal">Manage Orders</p>
                <p className="text-xs text-gray-500 leading-relaxed">Check 'Pending Orders' daily. Update their status as you ship them to customers.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">3</div>
              <div>
                <p className="font-semibold text-charcoal">Branding</p>
                <p className="text-xs text-gray-500 leading-relaxed">To change the name 'Kiss & Glow', search for it in the code (src/App.tsx, Home.tsx) and replace with your brand.</p>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-white/50 rounded-2xl border border-accent/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Need Help?</p>
            <p className="text-xs text-gray-400">Refer to the <span className="font-bold">docs/supabase-setup.md</span> file for technical setup instructions.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
