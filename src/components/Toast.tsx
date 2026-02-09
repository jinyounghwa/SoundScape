import { useEffect } from 'react';
import { useStore } from '../store';
import { Icons } from './Icons';

export function Toast() {
  const { toast, clearToast } = useStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 3000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  const colors = {
    success: 'from-emerald-500/90 to-green-600/90',
    info: 'from-primary/90 to-secondary/90',
    error: 'from-red-500/90 to-rose-600/90',
  };

  const icons = {
    success: <Icons.ArrowRight size={16} />,
    info: <Icons.Logo size={16} />,
    error: <Icons.Clear size={16} />,
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r ${colors[toast.type]} text-white text-sm font-medium shadow-2xl backdrop-blur-md`}
      >
        {icons[toast.type]}
        <span>{toast.message}</span>
        <button
          onClick={clearToast}
          className="ml-2 p-1 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Dismiss"
        >
          <Icons.Clear size={14} />
        </button>
      </div>
    </div>
  );
}
