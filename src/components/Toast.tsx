import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

let toastFn: ((msg: string) => void) | null = null;

export function toast(message: string) {
  toastFn?.(message);
}

export function Toaster() {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);

  useEffect(() => {
    toastFn = (msg: string) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, msg }]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 2600);
    };
    return () => { toastFn = null; };
  }, []);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none">
      {items.map((i) => (
        <div
          key={i.id}
          className="pointer-events-auto flex items-center gap-2 rounded-xl bg-ink-900 text-white px-4 py-2.5 shadow-lg animate-fade-up"
        >
          <CheckCircle2 size={17} className="text-success-500" />
          <span className="text-sm font-medium">{i.msg}</span>
          <button
            onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}
            className="ml-1 text-ink-400 hover:text-white"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
