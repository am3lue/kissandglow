import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Github } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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
        alert('Verification email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.message);
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

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-4 rounded-2xl mb-6 flex items-start space-x-2">
            <span className="font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-secondary-bg border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent/20 transition-all outline-none text-charcoal"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary-bg border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent/20 transition-all outline-none text-charcoal"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary-bg border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent/20 transition-all outline-none text-charcoal"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-accent text-white rounded-2xl font-semibold shadow-xl shadow-accent/20 hover:bg-accent-hover transition-all transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 group"
          >
            <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            {!loading && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>



        {/* Social login removed */}

        <p className="mt-10 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
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
