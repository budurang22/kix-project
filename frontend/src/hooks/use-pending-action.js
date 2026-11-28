import { useEffect, useRef, useState } from 'react';
export function usePendingAction() {
  const pending = useRef(false);
  const active = useRef(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function run(action) {
    if (pending.current) return;
    pending.current = true;
    setIsPending(true);
    setError('');
    try {
      const result = await action();
      return active.current ? result : undefined;
    } catch (failure) {
      if (active.current) setError(failure.message);
    } finally {
      pending.current = false;
      if (active.current) setIsPending(false);
    }
  }
  return { run, isPending, error };
}
