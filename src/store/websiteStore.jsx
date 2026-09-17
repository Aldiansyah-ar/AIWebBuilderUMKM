import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getFallback } from "../../shared/schema.js";

const WebsiteContext = createContext(null);
const STORAGE_KEY = "website_v1";

export function WebsiteProvider({ children }) {
  const [website, setWebsiteState] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  // Save-state indicator (#49) — 'idle' until a draft exists, then 'saved' or
  // 'error' depending on the sessionStorage write. Previously a quota-exceeded
  // write failure was silently swallowed ("memory still holds") — that's still
  // true, but the user now gets told their change isn't actually persisted.
  const [saveStatus, setSaveStatus] = useState(() => (website ? 'saved' : 'idle'));

  useEffect(() => {
    if (!website) { setSaveStatus('idle'); return; }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(website));
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [website]);

  const setWebsite = useCallback((next, { snapshot = true } = {}) => {
    setWebsiteState((prev) => {
      const data = typeof next === 'function' ? next(prev) : next;
      if (snapshot && prev) setHistory((h) => [...h.slice(-10), prev]);
      return data;
    });
    setError(null);
  }, []);

  // TSK-05B: diff-and-patch merge. `delta` may be a partial local edit or a
  // full revised UMKMWebsiteState from the LLM (prompts.js asks for the full
  // object back). Only top-level sections present in `delta` change — every
  // section absent from `delta` is preserved untouched. Each provided
  // section REPLACES the old one wholesale (not a key-by-key merge): mock
  // data and LLM output use different field names for the same concept
  // (about.description vs about.story), so merging them would let a stale
  // old key silently win over a fresh one. Callers that only want to tweak
  // part of a section (e.g. just hero.title) must spread the rest of that
  // section in themselves. The one exception is contact.whatsappNumber,
  // which is never dropped even if a revision omits/blanks it (US-07).
  const patchWebsite = useCallback((delta) => {
    if (!delta) return;
    if (!website) { setWebsite(delta); return; }
    const next = { ...website, ...delta };
    if (delta.contact) {
      next.contact = { ...delta.contact };
      if (!next.contact.whatsappNumber) next.contact.whatsappNumber = website.contact?.whatsappNumber;
    }
    setWebsite(next);
  }, [website, setWebsite]);

  // Dedicated append action for local "quick add" UI flows (e.g. one-click
  // "tambah menu" demo buttons) — distinct from patchWebsite's full-array
  // replace semantics, which assumes the caller already has the complete list.
  const appendServiceItem = useCallback((item) => {
    if (!item) return;
    setWebsite((prev) => prev ? { ...prev, services: [item, ...(prev.services || [])] } : prev);
  }, [setWebsite]);

  const loadFallback = useCallback((category) => {
    const fb = getFallback(category);
    setWebsite(fb);
    return fb;
  }, [setWebsite]);

  const clear = useCallback(() => {
    setWebsiteState(null);
    setHistory([]);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  // Undo (#48) — MVP scope is a single-step "undo last change", not full
  // version control: pop the most recent snapshot and make it current,
  // without pushing the (now-discarded) state back onto history as a redo
  // slot. Repeated calls keep walking back through whatever snapshots
  // `setWebsite` already accumulated (up to the last 10 changes).
  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setWebsiteState(previous);
      return h.slice(0, -1);
    });
    setError(null);
  }, []);

  return (
    <WebsiteContext.Provider value={{ website, history, error, setError, setWebsite, patchWebsite, appendServiceItem, loadFallback, clear, undo, saveStatus }}>
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const ctx = useContext(WebsiteContext);
  if (!ctx) throw new Error("useWebsite must be inside WebsiteProvider");
  return ctx;
}
