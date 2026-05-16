import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Send, User, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  is_admin_message: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface OrderMessagesProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const OrderMessages: React.FC<OrderMessagesProps> = ({ orderId, isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchMessages();
      const subscription = supabase
        .channel(`order_messages:${orderId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'order_messages',
          filter: `order_id=eq.${orderId}` 
        }, payload => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('order_messages')
      .select('*, profiles:sender_id(full_name)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      showToast('Error loading messages', 'error');
    } else {
      setMessages(data as any);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    
    // Auto-introduction for admins
    let finalContent = newMessage.trim();
    if (isAdmin) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const adminName = profile?.full_name || 'Admin';
      finalContent = `Hello! This is ${adminName} from Kiss & Glow support. ${finalContent}`;
    }

    try {
      const { error } = await supabase
        .from('order_messages')
        .insert([{
          order_id: orderId,
          sender_id: user.id,
          content: finalContent,
          is_admin_message: isAdmin
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (err: any) {
      showToast('Error sending message', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-end p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="relative w-full max-w-md h-full sm:h-[90vh] bg-white sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-l border-gray-50"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-accent/5 rounded-2xl text-accent">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-charcoal italic">Order Chat</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order #{orderId.slice(0, 8)}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary-bg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafafa]/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <MessageCircle className="w-12 h-12 text-gray-400" />
                  <p className="text-sm font-medium italic">No messages yet. Send a note to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col",
                      msg.sender_id === user?.id ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-[1.5rem] text-sm",
                      msg.sender_id === user?.id 
                        ? "bg-accent text-white rounded-br-none shadow-lg shadow-accent/10" 
                        : "bg-white text-charcoal rounded-bl-none shadow-sm border border-gray-50"
                    )}>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
                      {msg.profiles?.full_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-gray-50">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  placeholder={isAdmin ? "Type a message to customer..." : "Type a message to support..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-secondary-bg border-none rounded-2xl py-4 pl-6 pr-16 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all text-charcoal font-medium"
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all disabled:opacity-50 disabled:scale-100 transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="mt-4 text-[10px] text-center text-gray-400 font-medium">
                {isAdmin ? 'Your name will be automatically added to the message.' : 'We typically reply within a few hours.'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderMessages;
