import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Heart, Share2, ShieldCheck, Truck, RefreshCw, Plus, Minus, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  description: string;
  stock_count: number;
  how_to_use?: string;
  ingredients?: string;
  variants?: { name: string; value: string }[];
  result_images?: string[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) {
      setProduct(data);
    } else {
      // Mock for demo
      setProduct({
        id: '1',
        name: 'Dewy Finish Tint',
        price: 28,
        image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80',
        category: 'Makeup',
        description: 'A weightless, breathable skin tint that blends seamlessly to provide a natural, dewy finish. Infused with skin-loving ingredients like hyaluronic acid and squalane to keep your skin hydrated all day. Available in 15 flexible shades.',
        stock_count: 50,
        result_images: [
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&q=80'
        ]
      });
    }
    setLoading(false);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center font-display text-accent italic animate-pulse">Loading...</div>;
  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <Link to="/products" className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-accent mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Collection</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-[4/5] bg-secondary-bg rounded-3xl overflow-hidden shadow-sm">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 px-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-secondary-bg rounded-xl overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
                <img src={product.image_url} alt="Gallery" className="w-full h-full object-cover grayscale opacity-50" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            <p className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase mb-4">{product.category}</p>
            <h1 className="font-serif text-5xl md:text-6xl font-light text-charcoal mb-6 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-6 mb-8">
              <div className="flex flex-col">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-gray-400 line-through mb-1">${product.original_price.toFixed(2)}</span>
                )}
                <span className="text-4xl font-serif font-light text-charcoal/80">${product.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-accent/5 rounded-full text-[10px] font-bold tracking-widest uppercase text-accent">
                <Star className="w-3 h-3 fill-accent" />
                <span>4.9 / 5.0</span>
              </div>
              {product.original_price && product.original_price > product.price && (
                <div className="px-3 py-1 bg-red-50 text-red-500 text-[8px] font-bold uppercase tracking-widest rounded-full">
                  Save {Math.round((1 - product.price / product.original_price) * 100)}%
                </div>
              )}
            </div>
            <p className="text-charcoal/60 leading-relaxed text-base mb-10 max-w-lg">
              {product.description}
            </p>
          </div>

          <div className="space-y-10">
            {/* Variants */}
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Available Options</p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v, i) => (
                    <button key={i} className="px-6 py-2 border border-gray-100 rounded-full text-xs font-medium hover:border-accent hover:text-accent transition-all">
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center justify-between border border-charcoal/5 rounded-full px-8 py-5 w-full sm:w-auto min-w-[160px]">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-accent transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-serif text-xl w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="hover:text-accent transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => addItem({ ...product, quantity })}
                className="flex-1 py-5 bg-accent text-white rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all transform active:scale-95 flex items-center justify-center space-x-3"
              >
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "p-5 rounded-full border transition-all duration-300 flex items-center justify-center",
                  isFavorite ? "border-accent bg-accent/5 text-accent" : "border-gray-100 hover:border-accent/30 text-gray-400"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-accent")} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-[#FDF6F0]">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-charcoal/40 leading-tight">Global Express <br />Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-accent" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-charcoal/40 leading-tight">30-Day Effortless <br />Returns</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-charcoal/40 leading-tight">Verified <br />Purity</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* More Details */}
      <div className="mt-32 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {product.how_to_use && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-light italic text-charcoal">How to Use</h3>
              <p className="text-charcoal/60 leading-relaxed italic text-sm">
                "{product.how_to_use}"
              </p>
            </div>
          )}
          {product.ingredients && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-light italic text-charcoal">Ingredients</h3>
              <p className="text-charcoal/40 font-mono text-[10px] leading-loose tracking-wider bg-secondary-bg p-8 rounded-3xl">
                {product.ingredients}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Testing Results */}
      {Array.isArray(product.result_images) && product.result_images.length > 0 && (
        <section className="mt-32">
          <div className="text-center mb-16">
            <h3 className="font-display text-4xl font-light text-charcoal italic mb-4">Testing Results</h3>
            <p className="text-gray-400 text-sm tracking-widest uppercase font-bold">Real results from our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.result_images.map((img, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-sm"
              >
                <img src={img} alt={`Result ${idx}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Products Placeholder */}
      <section className="mt-32">
        <h3 className="font-display text-2xl font-light text-charcoal mb-10 italic">Complete the Look</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4 group">
              <div className="aspect-[3/4] bg-secondary-bg rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-4 w-1/2 bg-secondary-bg rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-secondary-bg rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
