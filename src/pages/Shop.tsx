import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');
    
    if (category !== 'All') {
      query = query.ilike('category', category);
    }
    
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['All', 'Skincare', 'Makeup', 'Accessories'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-serif text-3xl italic animate-pulse text-accent">KISS & GLOW</div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <header className="space-y-6 text-center">
        <h1 className="font-serif text-6xl md:text-8xl font-light text-charcoal">
          The <span className="italic">Collection</span>
        </h1>
        <p className="text-charcoal/60 max-w-xl mx-auto leading-relaxed">
          Explore our full range of premium beauty essentials. From the heart of Tanzania to your doorstep, anywhere in the world.
        </p>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-secondary-bg/30 p-6 rounded-[2rem] border border-charcoal/5">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                category === cat ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-charcoal/40 hover:text-accent hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/20" />
          <input
            type="text"
            placeholder="Search the shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-charcoal/5 rounded-full text-xs focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div>
        {filteredProducts.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center rounded-[3rem] bg-secondary-bg border border-dashed border-charcoal/10">
            <p className="font-serif italic text-charcoal/40 text-xl">No products found in the shop.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <Link to={`/product/${product.id}`} className="block aspect-[3/4] bg-secondary-bg rounded-[2rem] overflow-hidden mb-5 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30">{product.category}</p>
                  <h3 className="text-sm font-medium text-charcoal group-hover:text-accent transition-colors">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <p className="font-serif text-charcoal font-semibold">${product.price.toFixed(2)}</p>
                    {product.original_price && product.original_price > product.price && (
                      <p className="font-serif text-[10px] text-gray-400 line-through">${product.original_price.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
