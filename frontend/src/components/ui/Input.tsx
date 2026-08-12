"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 text-sm text-foreground placeholder:text-[var(--muted)] transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="block font-mono text-xs font-semibold tracking-widest text-[var(--muted)]">
            {label.toUpperCase()}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              fieldClasses,
              "h-11",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-danger-600 focus:border-danger-600 focus:ring-danger-500/10",
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">{rightIcon}</span>
          ) : null}
        </div>
        {error ? <p className="font-mono text-xs text-[var(--err)]">{error}</p> : hint ? <p className="font-mono text-xs text-[var(--muted)]">{hint}</p> : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ className, label, error, id, ...props }, ref) => (
  <div className="space-y-1.5">
    {label ? (
      <label htmlFor={id ?? props.name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
    ) : null}
    <textarea
      ref={ref}
      id={id ?? props.name}
      className={cn(fieldClasses, "min-h-[100px] py-2.5", error && "border-danger-600", className)}
      {...props}
    />
    {error ? <p className="text-xs text-[var(--err)]">{error}</p> : null}
  </div>
));
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id ?? props.name} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={id ?? props.name}
        className={cn(fieldClasses, "h-11 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23667f00%22%20stroke-width%3D%222.5%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-10", error && "border-danger-600", className)}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-[var(--err)]">{error}</p> : null}
    </div>
  ),
);
Select.displayName = "Select";

export function Checkbox({
  label,
  description,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; description?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-[var(--line-strong)] bg-[var(--surface)] accent-primary-600"
        {...props}
      />
      <span>
        {label ? <span className="block text-sm font-medium text-foreground">{label}</span> : null}
        {description ? <span className="block text-xs text-[var(--muted)]">{description}</span> : null}
      </span>
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex items-center gap-3"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-primary-500" : "bg-[var(--line-strong)]",
        )}
      >
        <span
          className={cn(
            "inline-block h-4.5 w-4.5 translate-x-1 rounded-full bg-[var(--surface-3)] shadow transition-transform duration-200",
            checked && "translate-x-[22px]",
          )}
        />
      </span>
      {label ? <span className="font-mono text-xs tracking-wider text-[var(--muted)]">{label}</span> : null}
    </button>
  );
}
