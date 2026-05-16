import React, { useState, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, HelpCircle, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: DialogOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(value);
  };

  return (
    <DialogContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
                options.type === 'danger' ? "bg-red-50 text-red-500" :
                options.type === 'warning' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
              )}>
                {options.type === 'danger' ? <AlertCircle className="w-8 h-8" /> : 
                 options.type === 'warning' ? <AlertCircle className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
              </div>

              <h3 className="font-display text-2xl font-semibold text-charcoal mb-2 italic">{options.title}</h3>
              <p className="text-gray-400 text-sm mb-10 leading-relaxed">{options.message}</p>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 py-4 bg-secondary-bg text-charcoal rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  {options.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={cn(
                    "flex-1 py-4 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all transform active:scale-95",
                    options.type === 'danger' ? "bg-red-500 shadow-red-500/20 hover:bg-red-600" : "bg-accent shadow-accent/20 hover:bg-accent-hover"
                  )}
                >
                  {options.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a DialogProvider');
  }
  return context.confirm;
};
