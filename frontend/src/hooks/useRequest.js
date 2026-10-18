import { useState, useEffect } from "react";

export function useRequest(client, path, params) {
  const key = JSON.stringify(params);
  const [state, set] = useState({ loading: true });
  useEffect(() => {
    const a = new AbortController();
    set({ client, key, path, loading: true });
    client
      .get(path, params, a.signal)
      .then((result) => {
        if (!a.signal.aborted) set({ client, key, path, result, loading: false });
      })
      .catch((error) => {
        if (!a.signal.aborted) set({ client, key, path, error, loading: false });
      });
    return () => a.abort();
  }, [client, path, key]);
  // Effects run after rendering: never label the previous result with new filters.
  return state.client === client && state.key === key && state.path === path
    ? state : { loading: true };
}
