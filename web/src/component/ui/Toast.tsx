import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

export type ToastOptions = {
  variant?: ToastVariant;
  title: string;
  description?: string;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  expiresAt: number;
};

type ToastContextValue = {
  showToast: (opts: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, { bar: string; title: string; border: string; bg: string }> = {
  success: {
    bar: "bg-emerald-500",
    title: "text-emerald-700",
    border: "border-emerald-200",
    bg: "bg-white",
  },
  error: {
    bar: "bg-rose-500",
    title: "text-rose-700",
    border: "border-rose-200",
    bg: "bg-white",
  },
  info: {
    bar: "bg-blue-500",
    title: "text-blue-700",
    border: "border-blue-200",
    bg: "bg-white",
  },
};

function randomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    (opts: ToastOptions) => {
      const now = Date.now();
      const durationMs = opts.durationMs ?? 2500;
      const item: ToastItem = {
        id: randomId(),
        variant: opts.variant ?? "info",
        title: opts.title,
        description: opts.description,
        expiresAt: now + durationMs,
      };

      setToasts((prev) => [item, ...prev].slice(0, 3));

      timersRef.current[item.id] = window.setTimeout(() => {
        removeToast(item.id);
      }, durationMs);
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((t) => window.clearTimeout(t));
      timersRef.current = {};
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastViewport = ({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) => {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex w-[360px] max-w-[calc(100vw-2.5rem)] flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const s = variantStyles[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={`relative overflow-hidden rounded-2xl border ${s.border} ${s.bg} shadow-xl`}
            >
              <div className={`absolute left-0 top-0 h-full w-1.5 ${s.bar}`} />
              <div className="flex items-start gap-3 p-4 pl-5">
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-extrabold tracking-tight ${s.title}`}>{t.title}</div>
                  {t.description ? (
                    <div className="mt-1 text-xs font-medium text-slate-500">{t.description}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(t.id)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
