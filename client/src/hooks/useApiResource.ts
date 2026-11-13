import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { thaiError } from '../utils/errors';

// Keep request state in one place. Explicit refresh always starts a fresh
// request (including after mutations); obsolete responses cannot overwrite it.
export function useApiResource<T>(url: string | null, fallback: string) {
  const [state, setState] = useState<{
    url: string | null;
    data: T | null;
    loading: boolean;
    error: string;
  }>({ url, data: null, loading: !!url, error: '' });
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  const refresh = useCallback(async (): Promise<void> => {
    // A save may finish after its page has been left. Do not start a new load.
    if (!mounted.current) return;
    if (!url) {
      setState({ url, data: null, loading: false, error: '' });
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState((previous) => ({
      url,
      data: previous.url === url ? previous.data : null,
      loading: true,
      error: '',
    }));
    try {
      const response = await api.get<T>(url, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setState({ url, data: response.data, loading: false, error: '' });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: thaiError(error, fallback),
        }));
      }
    } finally {
      if (request.current === controller) request.current = null;
    }
  }, [url, fallback]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      request.current?.abort();
      request.current = null;
    };
  }, [refresh]);

  return {
    data: state.url === url ? state.data : null,
    loading: !!url && (state.url !== url || state.loading),
    error: state.url === url ? state.error : '',
    refresh,
  };
}
