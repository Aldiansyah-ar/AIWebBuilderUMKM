/**
 * scrollToSection.js — Dev 1B: smooth-scroll handler for in-page nav links
 * (Navbar in each template).
 *
 * These navbars render inside a sandboxed srcDoc preview iframe
 * (SandboxPreview.jsx) — a plain `<a href="#id">` click there reliably
 * reloads the iframe back to its pristine empty srcdoc template instead of
 * scrolling (a browser quirk with fragment navigation inside sandboxed
 * srcdoc frames), wiping the whole preview until the page is reloaded.
 * `href` is kept on the element for keyboard focus/semantics; this handler
 * intercepts the click and does the scroll itself instead of letting the
 * browser navigate. Resolved against the link's own `ownerDocument` (not
 * whatever document this module's code happens to execute in) since the
 * target section lives in the iframe's document, not the parent app's.
 */
export function scrollToSectionOnClick(id) {
  return (e) => {
    e.preventDefault()
    e.currentTarget.ownerDocument.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
