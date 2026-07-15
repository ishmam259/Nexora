import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAsyncResult<T> {
  data: T | undefined;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}

/**
 * Fetches `fn()` on mount and whenever `deps` change. `refresh()` re-runs it
 * without flashing the full-screen loading state (for pull-to-refresh).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList): UseAsyncResult<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const load = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount/deps-change pattern. load() flips the loading
    // flag synchronously so the spinner shows immediately, before awaiting
    // the network call — an intentional, well-established exception to this
    // experimental rule.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(false);
    // `deps` is forwarded from the hook's caller by design, so this array
    // can't be a literal here — the caller decides what triggers a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, refreshing, error, refresh, setData };
}
