import { useState, useEffect } from "react";

// Checked reference examples bundled in public/; also supplies the report register.
export function useReferenceData() {
  const [db, setDb] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    const controller = new AbortController();
    fetch("/reference-data.json", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("Could not load reference data.");
        return r.json();
      })
      .then((data) => { if (!controller.signal.aborted) setDb(data); })
      .catch((error) => { if (!controller.signal.aborted) setError(error); });
    return () => controller.abort();
  }, []);
  return { db, error };
}
