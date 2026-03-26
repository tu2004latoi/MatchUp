import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trophy, UserPlus, X } from "lucide-react";

type ToastType = "invite" | "friend" | "system" | "success" | "error" | "info";

export type ToastOptions = {
  type?: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
  onResolve?: () => void;
  onDismiss?: () => void;
  resolveLabel?: string;
  dismissLabel?: string;
  // Backward-compatible props
  variant?: "success" | "error" | "info";
  description?: string;
};

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs: number;
  onResolve?: () => void;
  onDismiss?: () => void;
  resolveLabel?: string;
  dismissLabel?: string;
};

type ToastContextValue = {
  showToast: (opts: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastConfigs: Record<ToastType, { icon: typeof Trophy; color: string; label: string; progress: string }> = {
  invite: { icon: Trophy, color: "bg-blue-600", label: "Room Invite", progress: "bg-blue-600/30" },
  friend: { icon: UserPlus, color: "bg-emerald-500", label: "Friend Request", progress: "bg-emerald-500/30" },
  system: { icon: Bell, color: "bg-amber-500", label: "System Alert", progress: "bg-amber-500/30" },
  success: { icon: Check, color: "bg-emerald-500", label: "Success", progress: "bg-emerald-500/30" },
  error: { icon: X, color: "bg-rose-500", label: "Error", progress: "bg-rose-500/30" },
  info: { icon: Bell, color: "bg-blue-600", label: "Info", progress: "bg-blue-600/30" },
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
      const durationMs = opts.durationMs ?? 5000;

      const resolvedType: ToastType = opts.type
        ?? (opts.variant === "success" ? "success" : opts.variant === "error" ? "error" : opts.variant === "info" ? "info" : "system");

      const item: ToastItem = {
        id: randomId(),
        type: resolvedType,
        title: opts.title,
        message: opts.message ?? opts.description,
        durationMs,
        onResolve: opts.onResolve,
        onDismiss: opts.onDismiss,
        resolveLabel: opts.resolveLabel,
        dismissLabel: opts.dismissLabel,
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
    <div className="fixed top-5 right-5 z-[9999] flex w-80 max-w-[calc(100vw-2.5rem)] flex-col">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <NotificationToast
            key={t.id}
            type={t.type}
            title={t.title}
            message={t.message}
            durationMs={t.durationMs}
            onResolve={t.onResolve}
            onDismiss={() => {
              t.onDismiss?.();
              onDismiss(t.id);
            }}
            resolveLabel={t.resolveLabel}
            dismissLabel={t.dismissLabel}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationToast = ({
  type,
  title,
  message,
  durationMs,
  onResolve,
  onDismiss,
  resolveLabel,
  dismissLabel,
}: {
  type: ToastType;
  title: string;
  message?: string;
  durationMs: number;
  onResolve?: () => void;
  onDismiss: () => void;
  resolveLabel?: string;
  dismissLabel?: string;
}) => {
  const { icon: Icon, color, label, progress } = toastConfigs[type] || toastConfigs.system;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="relative w-80 mb-4 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[20px] shadow-2xl overflow-hidden group"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
              <button onClick={onDismiss} className="text-slate-300 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">{title}</h4>
            {message ? (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{message}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {type === "invite" || type === "friend" ? (
            <>
              <button
                onClick={() => {
                  onResolve?.();
                  onDismiss();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Check size={14} /> {resolveLabel ?? "Accept"}
              </button>
              <button
                onClick={onDismiss}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold py-2 rounded-lg transition-all"
              >
                {dismissLabel ?? "Decline"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: durationMs / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 ${progress}`}
      />
    </motion.div>
  );
};
