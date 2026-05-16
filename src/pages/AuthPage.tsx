import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Please fill out your email';
    if (!password) newErrors.password = 'Password is required';
    if (!isLogin && !fullName) newErrors.fullName = 'Please enter your full name';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please correct the highlighted fields', 'warning');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('Welcome back!', 'success');
        navigate('/account');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        showToast('Verification email sent! Check your inbox.', 'info');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-accent/5 border border-gray-50"
      >
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-light text-charcoal mb-3 italic">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Sign in to access your bag and orders' : 'Join Kiss & Glow for premium beauty perks'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6" noValidate>
          {!isLogin && (
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({...errors, fullName: ''});
                  }}
                  className={`w-full bg-secondary-bg border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 transition-all outline-none text-charcoal ${errors.fullName ? 'ring-2 ring-red-200' : 'focus:ring-accent/20'}`}
                />
              </div>
              {errors.fullName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-4">{errors.fullName}</p>}
            </div>
          )}
          
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({...errors, email: ''});
                }}
                className={`w-full bg-secondary-bg border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 transition-all outline-none text-charcoal ${errors.email ? 'ring-2 ring-red-200' : 'focus:ring-accent/20'}`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-4">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({...errors, password: ''});
                }}
                className={`w-full bg-secondary-bg border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 transition-all outline-none text-charcoal ${errors.password ? 'ring-2 ring-red-200' : 'focus:ring-accent/20'}`}
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-4">{errors.password}</p>}
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-accent text-white rounded-2xl font-semibold shadow-xl shadow-accent/20 hover:bg-accent-hover transition-all transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 group"
          >
            <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            {!loading && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-accent font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
