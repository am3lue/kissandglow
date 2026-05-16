import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Filter, ArrowRight } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const Category: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useLocation();

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');
    if (slug) {
      query = query.ilike('category', slug);
    }
    const { data } = await query;
    if (data) setProducts(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-serif text-3xl italic animate-pulse text-accent">KISS & GLOW</div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <header className="space-y-6">
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/30">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span>/</span>
          <span className="text-accent">{slug}</span>
        </div>
        <h1 className="font-serif text-6xl md:text-8xl font-light text-charcoal capitalize">
          {slug}
        </h1>
        <p className="text-charcoal/60 max-w-md leading-relaxed">
          Premium beauty essentials curated for your unique glow. Starting from Tanzania, reaching the global heart.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Simple Sidebar Filter */}
        <aside className="w-full md:w-64 space-y-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/40 flex items-center">
              <Filter className="w-3 h-3 mr-2" />
              Filter By
            </h3>
            <div className="w-8 h-[1px] bg-accent/20" />
          </div>
          
          <div className="space-y-4">
            <button className="block text-sm font-medium text-charcoal hover:text-accent transition-colors">Best Sellers</button>
            <button className="block text-sm font-medium text-charcoal hover:text-accent transition-colors">Price: Low to High</button>
            <button className="block text-sm font-medium text-charcoal hover:text-accent transition-colors">Price: High to Low</button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center rounded-[3rem] bg-secondary-bg border border-dashed border-charcoal/10">
              <p className="font-serif italic text-charcoal/40 text-xl">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <Link to={`/product/${product.id}`} className="block aspect-[3/4] bg-secondary-bg rounded-[2.5rem] overflow-hidden mb-6 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-charcoal group-hover:text-accent transition-colors">{product.name}</h3>
                      <div className="flex flex-col items-end">
                        <span className="font-serif text-charcoal/80 italic font-semibold">{formatPrice(product.price)}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.original_price)}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/20">{product.category}</p>
                    {product.is_featured && (
                      <span className="inline-block mt-2 px-2 py-1 bg-accent/5 text-accent text-[8px] font-bold uppercase tracking-widest rounded">Featured</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
