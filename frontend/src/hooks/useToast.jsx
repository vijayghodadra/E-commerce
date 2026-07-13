import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5s
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-primary text-cream';
          let Icon = Info;
          if (toast.type === 'success') {
            bgColor = 'bg-primary text-cream border-l-4 border-secondary';
            Icon = CheckCircle;
          } else if (toast.type === 'error') {
            bgColor = 'bg-red-900 text-white border-l-4 border-red-500';
            Icon = AlertCircle;
          }

          return (
            <div
              key={toast.id}
              className={`${bgColor} px-4 py-3.5 shadow-premium flex items-center justify-between rounded-sm pointer-events-auto animate-slide-in text-sm font-medium`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={18} className="shrink-0 text-secondary-light" />
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-cream/70 hover:text-cream ml-4 p-1 rounded-full hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
