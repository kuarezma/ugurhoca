'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

export type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
};

export type PromptOptions = {
  title?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type DialogState =
  | {
      type: 'confirm';
      message: string;
      options?: ConfirmOptions;
      resolve: (value: boolean) => void;
    }
  | {
      type: 'prompt';
      message: string;
      defaultValue?: string;
      options?: PromptOptions;
      resolve: (value: string | null) => void;
    }
  | null;

type DialogListener = (state: DialogState) => void;

let activeListener: DialogListener | null = null;
let isHostMounted = false;

export type AdminActionPromise<T> = Promise<T> & {
  syncValue?: T;
};

export function confirmAdminAction(
  message: string,
  options?: ConfirmOptions,
): AdminActionPromise<boolean> {
  if (!isHostMounted || !activeListener) {
    const syncValue =
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm(message)
        : false;
    const promise = Promise.resolve(syncValue) as AdminActionPromise<boolean>;
    promise.syncValue = syncValue;
    return promise;
  }

  const promise = new Promise<boolean>((resolve) => {
    activeListener?.({
      type: 'confirm',
      message,
      options,
      resolve,
    });
  }) as AdminActionPromise<boolean>;
  return promise;
}

export function promptAdminAction(
  message: string,
  defaultValue?: string,
  options?: PromptOptions,
): AdminActionPromise<string | null> {
  if (!isHostMounted || !activeListener) {
    const syncValue =
      typeof window !== 'undefined' && typeof window.prompt === 'function'
        ? window.prompt(message, defaultValue)
        : null;
    const promise = Promise.resolve(syncValue) as AdminActionPromise<
      string | null
    >;
    promise.syncValue = syncValue;
    return promise;
  }

  const promise = new Promise<string | null>((resolve) => {
    activeListener?.({
      type: 'prompt',
      message,
      defaultValue,
      options,
      resolve,
    });
  }) as AdminActionPromise<string | null>;
  return promise;
}

export function AdminActionDialogHost() {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [promptInput, setPromptInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isHostMounted = true;
    activeListener = (state) => {
      setDialog(state);
      if (state?.type === 'prompt') {
        setPromptInput(state.defaultValue ?? '');
      }
    };

    return () => {
      isHostMounted = false;
      activeListener = null;
    };
  }, []);

  const handleClose = () => {
    if (!dialog) return;
    if (dialog.type === 'confirm') {
      dialog.resolve(false);
    } else {
      dialog.resolve(null);
    }
    setDialog(null);
  };

  const handleConfirm = () => {
    if (!dialog) return;
    if (dialog.type === 'confirm') {
      dialog.resolve(true);
    } else {
      dialog.resolve(promptInput);
    }
    setDialog(null);
  };

  const modalRef = useAccessibleModal<HTMLDivElement>(
    Boolean(dialog),
    handleClose,
    { enableHistoryBack: false },
  );

  useEffect(() => {
    if (dialog?.type === 'prompt') {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [dialog]);

  if (!dialog) return null;

  const isDanger =
    dialog.type === 'confirm' && dialog.options?.tone === 'danger';
  const title =
    dialog.options?.title ||
    (dialog.type === 'confirm' ? 'İşlemi Onaylayın' : 'Bilgi Girişi');
  const confirmText =
    dialog.options?.confirmLabel ||
    (dialog.type === 'confirm' ? 'Onayla' : 'Tamam');
  const cancelText = dialog.options?.cancelLabel || 'İptal';

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-action-dialog-title"
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 dark:bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-default dark:border-white/10 bg-surface-1 dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isDanger
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-brand-primary/10 text-brand-primary'
              }`}
            >
              {isDanger ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <HelpCircle className="h-5 w-5" />
              )}
            </div>
            <h2
              id="admin-action-dialog-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Kapat"
            className="rounded-lg p-1 text-slate-400 hover:bg-surface-2 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
          {dialog.message}
        </p>

        {dialog.type === 'prompt' && (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleConfirm();
            }}
            className="mt-4"
          >
            <input
              ref={inputRef}
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={dialog.options?.placeholder}
              className="w-full rounded-xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </form>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-default dark:border-white/10 bg-surface-2 dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-surface-3 dark:hover:bg-white/10 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
              isDanger
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-brand-primary text-slate-950 font-bold hover:brightness-105'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
