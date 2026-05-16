import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[200] space-y-4 pointer-events-none w-full max-w-sm">
        <AnimatePresence mode="multiple">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                relative overflow-hidden bg-white rounded-[1.5rem] p-5 shadow-2xl border border-gray-50 flex items-start space-x-4
                ${toast.type === 'success' ? 'border-l-4 border-l-green-500' : ''}
                ${toast.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
                ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' : ''}
                ${toast.type === 'info' ? 'border-l-4 border-l-accent' : ''}
              `}>
                <div className={`
                  p-2 rounded-xl
                  ${toast.type === 'success' ? 'bg-green-50 text-green-500' : ''}
                  ${toast.type === 'error' ? 'bg-red-50 text-red-500' : ''}
                  ${toast.type === 'warning' ? 'bg-amber-50 text-amber-500' : ''}
                  ${toast.type === 'info' ? 'bg-accent/5 text-accent' : ''}
                `}>
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                  {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-charcoal leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-300 hover:text-charcoal transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Progress bar */}
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-0.5 opacity-20
                    ${toast.type === 'success' ? 'bg-green-500' : ''}
                    ${toast.type === 'error' ? 'bg-red-500' : ''}
                    ${toast.type === 'warning' ? 'bg-amber-500' : ''}
                    ${toast.type === 'info' ? 'bg-accent' : ''}
                  `}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
