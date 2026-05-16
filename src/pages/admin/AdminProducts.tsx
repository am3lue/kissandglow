import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Edit3, Trash2, X, Image as ImageIcon, Check, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/DialogContext';
import { useLocation } from '../../contexts/LocationContext';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  stock_count: number;
  category: string;
  image_url: string;
  description: string;
  is_featured: boolean;
  how_to_use?: string;
  ingredients?: string;
  variants?: { name: string; value: string }[];
  result_images?: string[];
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    original_price: 0,
    stock_count: 0,
    category: 'Makeup',
    image_url: '',
    description: '',
    how_to_use: '',
    ingredients: '',
    is_featured: false,
    variants: [] as { name: string; value: string }[],
    result_images: [] as string[]
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useLocation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProducts(data);
    } catch (err: any) {
      showToast('Error loading products: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, image_url: url }));
      if (formErrors.image_url) setFormErrors({...formErrors, image_url: ''});
      showToast('Main image uploaded', 'success');
    } catch (error: any) {
      showToast('Error uploading: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleResultImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = (Array.from(files) as File[]).map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ 
        ...prev, 
        result_images: [...prev.result_images, ...urls] 
      }));
      showToast(`${urls.length} images added`, 'success');
    } catch (error: any) {
      showToast('Error uploading results', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeResultImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      result_images: prev.result_images.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: 'Color', value: '' }]
    }));
  };

  const updateVariant = (index: number, name: string, value: string) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { name, value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom Validation
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Product name is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.image_url) errors.image_url = 'Please upload a main image';
    if (!formData.description) errors.description = 'Description is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please complete all required fields', 'warning');
      return;
    }

    setLoading(true);
    setFormErrors({});

    const payload = {
      ...formData,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      stock_count: Number(formData.stock_count)
    };
    
    try {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) throw error;

      showToast('Product created successfully', 'success');
      setIsModalOpen(false);
      setFormData({ 
        name: '', price: 0, original_price: 0, stock_count: 0, category: 'Makeup',
        image_url: '', description: '', how_to_use: '', ingredients: '',
        is_featured: false, variants: [], result_images: []
      });
      fetchProducts();
    } catch (err: any) {
      showToast('Error saving product: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Product',
      message: 'Are you sure? This action cannot be undone.',
      confirmText: 'Delete Forever',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      showToast('Product deleted', 'info');
      fetchProducts();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-light text-charcoal italic">Inventory Manager</h1>
          <p className="text-gray-400">Manage your product catalog and stock levels.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-accent text-white rounded-full font-semibold shadow-xl shadow-accent/20 hover:bg-accent-hover transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Product</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent/20 outline-none transition-all shadow-sm"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-gray-500 flex items-center space-x-2 hover:bg-secondary-bg transition-colors shadow-sm">
          <Filter className="w-5 h-5" />
          <span>Filer</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-bg/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Product</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Category</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Price</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Stock</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">No products found in inventory.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary-bg/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary-bg overflow-hidden flex-shrink-0">
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-charcoal">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-accent/5 text-accent rounded-full text-xs font-medium">{p.category}</span>
                    </td>
                    <td className="px-8 py-5 text-charcoal font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-8 py-5 text-gray-500">{p.stock_count} units</td>
                    <td className="px-8 py-5">
                      {p.stock_count > 0 ? (
                        <div className="flex items-center space-x-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full w-fit">
                          <Check className="w-3 h-3" />
                          <span>In Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full w-fit">
                          <X className="w-3 h-3" />
                          <span>Out of Stock</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-12">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-display text-3xl font-light text-charcoal italic">New Product</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-secondary-bg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Product Name</label>
                      <input
                        placeholder="e.g. Satin Silk Lipstick"
                        value={formData.name}
                        onChange={e => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name) setFormErrors({...formErrors, name: ''});
                        }}
                        className={cn(
                          "w-full px-6 py-4 bg-secondary-bg border-none rounded-2xl outline-none focus:ring-2 transition-all font-medium",
                          formErrors.name ? "ring-2 ring-red-200" : "focus:ring-accent/20"
                        )}
                      />
                      {formErrors.name && <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest pl-2">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-6 py-4 bg-secondary-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium appearance-none"
                      >
                        <option>Makeup</option>
                        <option>Skincare</option>
                        <option>Accessories</option>
                        <option>Tools</option>
                        <option>Sets</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Sale Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={e => {
                          setFormData({ ...formData, price: parseFloat(e.target.value) });
                          if (formErrors.price) setFormErrors({...formErrors, price: ''});
                        }}
                        className={cn(
                          "w-full px-6 py-4 bg-secondary-bg border-none rounded-2xl outline-none focus:ring-2 transition-all font-medium",
                          formErrors.price ? "ring-2 ring-red-200" : "focus:ring-accent/20"
                        )}
                      />
                      {formErrors.price && <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest pl-2">{formErrors.price}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Original Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        value={formData.original_price || ''}
                        onChange={e => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
                        className="w-full px-6 py-4 bg-secondary-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Stock Level</label>
                      <input
                        type="number"
                        value={formData.stock_count}
                        onChange={e => setFormData({ ...formData, stock_count: parseInt(e.target.value) })}
                        className="w-full px-6 py-4 bg-secondary-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-secondary-bg rounded-2xl">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.is_featured}
                      onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-5 h-5 accent-accent"
                    />
                    <label htmlFor="featured" className="text-sm font-bold uppercase tracking-widest text-charcoal">Featured Product</label>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Color/Style Variants</label>
                      <button 
                        type="button" 
                        onClick={addVariant}
                        className="text-[10px] font-bold text-accent bg-accent/5 px-3 py-1 rounded-full hover:bg-accent/10 transition-all"
                      >
                        + Add Variant
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.variants.map((variant, idx) => (
                        <div key={idx} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <input 
                            placeholder="Name (e.g. Shade)"
                            value={variant.name}
                            onChange={(e) => updateVariant(idx, e.target.value, variant.value)}
                            className="w-1/3 bg-secondary-bg border-none rounded-lg px-3 py-2 text-xs outline-none"
                          />
                          <input 
                            placeholder="Value (e.g. Ruby Red)"
                            value={variant.value}
                            onChange={(e) => updateVariant(idx, variant.name, e.target.value)}
                            className="flex-1 bg-secondary-bg border-none rounded-lg px-3 py-2 text-xs outline-none"
                          />
                          <button 
                            type="button" 
                            onClick={() => removeVariant(idx)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Product Image</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className={cn(
                          "relative group cursor-pointer h-40 bg-secondary-bg rounded-2xl overflow-hidden border-2 border-dashed transition-all",
                          formErrors.image_url ? "border-red-200" : "border-gray-100 hover:border-accent/40"
                        )}>
                          {formData.image_url ? (
                            <>
                              <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white text-xs font-bold uppercase tracking-widest">Change Image</p>
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 text-gray-400">
                              <ImageIcon className="w-8 h-8 opacity-20" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">
                                {uploading ? 'Uploading...' : 'Upload Image'}
                              </p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={uploading}
                          />
                        </div>
                        {formErrors.image_url && <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest px-2">{formErrors.image_url}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-300">Or use Image URL</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                          <input
                            placeholder="https://images.com/photo.jpg"
                            value={formData.image_url}
                            onChange={e => {
                              setFormData({ ...formData, image_url: e.target.value });
                              if (formErrors.image_url) setFormErrors({...formErrors, image_url: ''});
                            }}
                            className="w-full bg-secondary-bg border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Testing Results Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Testing Result Images (Before/After)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.result_images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                          <img src={url} alt={`Result ${idx}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeResultImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square bg-secondary-bg rounded-xl border-2 border-dashed border-gray-100 hover:border-accent/20 transition-all flex flex-col items-center justify-center cursor-pointer group">
                        <Plus className="w-6 h-6 text-gray-300 group-hover:text-accent" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-2">Add Result</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handleResultImageUpload} 
                          className="hidden" 
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Tell the story of this product..."
                        value={formData.description}
                        onChange={e => {
                          setFormData({ ...formData, description: e.target.value });
                          if (formErrors.description) setFormErrors({...formErrors, description: ''});
                        }}
                        className={cn(
                          "w-full px-6 py-4 bg-secondary-bg border-none rounded-2xl outline-none focus:ring-2 transition-all font-medium resize-none",
                          formErrors.description ? "ring-2 ring-red-200" : "focus:ring-accent/20"
                        )}
                      />
                      {formErrors.description && <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest pl-2">{formErrors.description}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">How to Use</label>
                      <textarea
                        rows={3}
                        placeholder="Steps to apply..."
                        value={formData.how_to_use}
                        onChange={e => setFormData({ ...formData, how_to_use: e.target.value })}
                        className="w-full px-6 py-4 bg-secondary-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Ingredients</label>
                      <textarea
                        rows={3}
                        placeholder="Full ingredient list..."
                        value={formData.ingredients}
                        onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                        className="w-full px-6 py-4 bg-secondary-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium resize-none"
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full py-5 bg-accent text-white rounded-2xl font-semibold shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all transform active:scale-95 disabled:opacity-50 sticky bottom-0"
                  >
                    {loading ? 'Creating Product...' : 'Create Listing'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
