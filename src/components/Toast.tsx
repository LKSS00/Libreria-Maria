import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const styles: Record<ToastType, { border: string; iconBg: string; iconColor: string; Icon: typeof CheckCircle }> = {
  success: { border: 'border-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-600', Icon: CheckCircle },
  error: { border: 'border-red-200', iconBg: 'bg-red-100', iconColor: 'text-red-600', Icon: AlertCircle },
  info: { border: 'border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', Icon: Info },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 5000);
  }, [remove]);

  const success = useCallback((message: string) => showToast('success', message), [showToast]);
  const error = useCallback((message: string) => showToast('error', message), [showToast]);
  const info = useCallback((message: string) => showToast('info', message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80" aria-live="polite">
        {toasts.map(t => {
          const s = styles[t.type];
          const Icon = s.Icon;
          return (
            <div key={t.id} className={`bg-white border ${s.border} rounded-xl shadow-lg p-3 flex items-start gap-3 animate-[slideIn_.2s_ease-out]`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg} ${s.iconColor}`}>
                <Icon size={18} />
              </div>
              <p className="flex-1 text-sm text-slate-700 pt-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors p-0.5" aria-label="Cerrar">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
