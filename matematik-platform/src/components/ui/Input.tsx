'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  leadingIcon?: ReactNode;
  trailingSlot?: ReactNode;
  fullWidth?: boolean;
};

const FIELD_BASE =
  'w-full h-11 rounded-xl border bg-white/70 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500';

const BORDER_OK = 'border-slate-200 dark:border-white/10';
const BORDER_ERR = 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/40';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, leadingIcon, trailingSlot, fullWidth = true, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `in-${autoId}`;
  const describedBy: string[] = [];
  if (hint) describedBy.push(`${inputId}-hint`);
  if (error) describedBy.push(`${inputId}-err`);

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy.length > 0 ? describedBy.join(' ') : undefined}
          className={cn(
            FIELD_BASE,
            error ? BORDER_ERR : BORDER_OK,
            leadingIcon && 'pl-10',
            trailingSlot && 'pr-12',
            className,
          )}
          {...rest}
        />
        {trailingSlot ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">{trailingSlot}</div>
        ) : null}
      </div>
      {error ? (
        <p id={`${inputId}-err`} role="alert" className="text-xs font-medium text-rose-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, fullWidth = true, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `ta-${autoId}`;
  const describedBy: string[] = [];
  if (hint) describedBy.push(`${inputId}-hint`);
  if (error) describedBy.push(`${inputId}-err`);

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy.length > 0 ? describedBy.join(' ') : undefined}
        className={cn(
          'w-full min-h-[7rem] rounded-xl border bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500',
          error ? BORDER_ERR : BORDER_OK,
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-err`} role="alert" className="text-xs font-medium text-rose-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldProps;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, hint, error, leadingIcon, fullWidth = true, id, children, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `sel-${autoId}`;
  const describedBy: string[] = [];
  if (hint) describedBy.push(`${inputId}-hint`);
  if (error) describedBy.push(`${inputId}-err`);

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy.length > 0 ? describedBy.join(' ') : undefined}
          className={cn(
            FIELD_BASE,
            error ? BORDER_ERR : BORDER_OK,
            'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M5.5%207.5%2010%2012l4.5-4.5%22%2F%3E%3C%2Fsvg%3E")] bg-[length:20px_20px] bg-[right_0.5rem_center] bg-no-repeat pr-9',
            leadingIcon && 'pl-10',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
      </div>
      {error ? (
        <p id={`${inputId}-err`} role="alert" className="text-xs font-medium text-rose-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
