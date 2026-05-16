import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useLocation } from '../contexts/LocationContext';
import { cn } from '../lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  description: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const { formatPrice } = useLocation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(8);
    
    if (data && data.length > 0) {
      setProducts(data);
    } else {
      // Fallback/Mock data if database is empty or error
      setProducts([
        { id: '1', name: 'Satin Silk Lipstick', price: 28, original_price: 35, image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80', category: 'Makeup', description: 'Weightless coverage for a natural glow.' },
        { id: '2', name: 'Hydra-Silk Serum', price: 42, original_price: 55, image_url: 'https://c.pxhere.com/photos/da/a2/deo_creme_mint_eucalyptus_lemon_sage_skin_care-543148.jpg!d', category: 'Skincare', description: 'Intensive hydration with silk proteins.' },
        { id: '3', name: 'Azure Mineral Mask', price: 28, original_price: 38, image_url: 'https://images.unsplash.com/photo-1725695788066-34e372183231?auto=format&fit=crop&q=80', category: 'Skincare', description: 'Creamy matte finish that lasts all day.' },
        { id: '4', name: 'Quartz Facial Roller', price: 22, image_url: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80', category: 'Accessories', description: 'Refreshing face mist for instant radiance.' },
      ]);
    }
  };

  const categories = [
    { name: 'Makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=70&w=800&auto=format&fit=crop', count: 24 },
    { name: 'Skincare', image: 'https://c.pxhere.com/photos/da/a2/deo_creme_mint_eucalyptus_lemon_sage_skin_care-543148.jpg!d', count: 18 },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1552046122-03184de85e08?q=70&w=800&auto=format&fit=crop', count: 12 },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-secondary-bg">
        <div className="absolute right-[-10%] top-[10%] w-[500px] h-[600px] bg-white rounded-[100px] rotate-12 shadow-2xl opacity-40 blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-6 block">
              New Arrivals • Tanzanian Heart
            </span>
            <h1 className="font-serif text-6xl md:text-8xl font-light text-charcoal leading-[1.1] mb-8">
              Radiance in <br /><span className="italic">Every Glow</span>
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 mb-12 leading-relaxed max-w-md">
              Discover premium beauty crafted for the global glow. Starting from the heart of Tanzania, we bring you minimalist, pure, and airy essentials.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-12 py-5 bg-accent text-white rounded-full text-xs font-bold tracking-[0.2em] uppercase shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all transform hover:-translate-y-1 active:scale-95 group"
            >
              <span>Shop the Collection</span>
              <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="hidden md:block relative h-[600px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-white rounded-[4rem] shadow-2xl overflow-hidden rotate-3"
            >
              <img
                src="https://images.unsplash.com/photo-1725695788066-34e372183231?q=75&w=1000&auto=format&fit=crop"
                alt="Radiant Skin"
                loading="eager"
                className="w-full h-full object-cover grayscale-[20%] opacity-90"
              />
            </motion.div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-serif text-4xl font-light text-charcoal mb-3">Featured Highlights</h2>
            <div className="w-12 h-[1px] bg-accent/30" />
          </div>
          <Link to="/products" className="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 hover:text-accent transition-colors border-b border-charcoal/10 pb-1">
            Explore Full Shop
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.filter(p => p.is_featured).slice(0, 4).length > 0 ? (
            products.filter(p => p.is_featured).slice(0, 4).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <Link to={`/product/${product.id}`} className="block aspect-[3/4] bg-secondary-bg rounded-[2rem] overflow-hidden mb-5 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img
                    src={`${product.image_url}${product.image_url.includes('?') ? '&' : '?'}q=70&w=500&auto=format&fit=crop`}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30">{product.category}</p>
                  <h3 className="text-sm font-medium text-charcoal group-hover:text-accent transition-colors">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <p className="font-serif text-charcoal font-semibold">{formatPrice(product.price)}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            products.slice(0, 4).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <Link to={`/product/${product.id}`} className="block aspect-[3/4] bg-secondary-bg rounded-[2rem] overflow-hidden mb-5 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img
                    src={`${product.image_url}${product.image_url.includes('?') ? '&' : '?'}q=70&w=500&auto=format&fit=crop`}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                </Link>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30">{product.category}</p>
                  <h3 className="text-sm font-medium text-charcoal group-hover:text-accent transition-colors">{product.name}</h3>
                  <p className="font-serif text-charcoal font-semibold">{formatPrice(product.price)}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Category Grid */}
      <section className="bg-secondary-bg/50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-light text-charcoal mb-4 italic">Shop by Category</h2>
            <div className="w-12 h-[1px] bg-accent mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase()}`}
                className="relative overflow-hidden group rounded-3xl aspect-[4/5] block"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="h-full w-full"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <span className="text-white/60 text-xs font-medium tracking-[0.2em] uppercase mb-2">
                      {category.count} Products
                    </span>
                    <h3 className="text-white text-3xl font-display font-light mb-4">{category.name}</h3>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <ArrowRight className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
