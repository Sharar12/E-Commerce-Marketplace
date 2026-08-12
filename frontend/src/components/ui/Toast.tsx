"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { dismissToast, selectToasts, pushToast } from "@/features/ui/uiSlice";
import { cn } from "@/lib/utils";

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-success-600" />,
  error: <XCircle className="h-5 w-5 text-danger-600" />,
  info: <Info className="h-5 w-5 text-info-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-accent-500" />,
};

const led = {
  success: "bg-success-500 shadow-[0_0_6px_rgb(25_209_98/0.7)]",
  error: "bg-danger-500 shadow-[0_0_6px_rgb(255_65_65/0.7)]",
  info: "bg-info-500 shadow-[0_0_6px_rgb(77_157_255/0.7)]",
  warning: "bg-accent-500 shadow-[0_0_6px_rgb(183_255_0/0.7)]",
};

function ToastCard({ id, type, title, message }: { id: string; type: keyof typeof icons; title: string; message?: string }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const t = setTimeout(() => dispatch(dismissToast(id)), 4200);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-white/10 bg-dark-800 p-4 shadow-overlay animate-[slideIn_0.2s_ease-out]",
      )}
    >
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-[1px]", led[type])} />
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {message ? <p className="mt-0.5 font-mono text-xs tracking-wider text-slate-500">{message}</p> : null}
      </div>
      <button
        onClick={() => dispatch(dismissToast(id))}
        className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-slate-200"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export function Toaster() {
  const toasts = useAppSelector(selectToasts);
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <ToastCard key={t.id} id={t.id} type={t.type} title={t.title} message={t.message} />
      ))}
    </div>
  );
}

export function useToast() {
  const dispatch = useAppDispatch();
  return {
    success: (title: string, message?: string) => dispatch(pushToast({ type: "success", title, message })),
    error: (title: string, message?: string) => dispatch(pushToast({ type: "error", title, message })),
    info: (title: string, message?: string) => dispatch(pushToast({ type: "info", title, message })),
    warning: (title: string, message?: string) => dispatch(pushToast({ type: "warning", title, message })),
  };
}
