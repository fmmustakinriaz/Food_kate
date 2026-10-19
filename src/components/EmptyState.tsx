import { AlertCircle } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-ink-100 text-ink-400">
        <AlertCircle size={28} />
      </div>
      <h3 className="font-display font-semibold text-lg text-ink-900">{title}</h3>
      {description && <p className="text-sm text-ink-500 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card p-6 flex items-start gap-3 border-error-500/30 bg-error-500/5">
      <AlertCircle className="text-error-500 shrink-0 mt-0.5" size={20} />
      <div>
        <p className="font-semibold text-error-700">Something went wrong</p>
        <p className="text-sm text-error-600/80 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
