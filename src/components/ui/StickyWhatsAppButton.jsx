/**
 * StickyWhatsAppButton — floating WhatsApp CTA for mobile viewports.
 *
 * On a long single-page mobile layout, the WA CTA is otherwise only
 * reachable inline in Hero/Contact — user has to scroll back up/down to
 * find it (GitHub issue #27). This renders a fixed floating button that
 * appears once the Hero section has scrolled out of view, mobile-only
 * (`md:hidden`).
 *
 * The preview renders templates via a React portal into a sandboxed
 * iframe's document (see SandboxPreview.jsx), so the global `document`
 * here would resolve to the *parent* page, not the iframe — `#hero` would
 * never be found. We instead read `ownerDocument` off our own DOM node,
 * which always points at whichever document the node actually lives in.
 */
import { useEffect, useRef, useState } from 'react'
import { generateWhatsappUrl, isValidWhatsappNumber } from '../../lib/templateSelector'

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.113 1.526 5.84L0 24l6.337-1.506A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.677-.502-5.214-1.381l-.374-.215-3.762.894.944-3.666-.237-.387A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
)

export default function StickyWhatsAppButton({ whatsappNumber = '', message = '' }) {
  const anchorRef = useRef(null)
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const doc = anchorRef.current?.ownerDocument
    const hero = doc?.getElementById('hero')
    if (!hero || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), { threshold: 0 })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  const hasValidWhatsapp = isValidWhatsappNumber(whatsappNumber)
  const visible = hasValidWhatsapp && pastHero
  const waUrl = generateWhatsappUrl(whatsappNumber, message)

  return (
    <a
      ref={anchorRef}
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi kami via WhatsApp"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={[
        'md:hidden fixed bottom-5 right-5 z-50 items-center justify-center w-14 h-14 rounded-full bg-[#25d366] text-white shadow-xl hover:bg-[#128c4a] active:scale-95 transition-all',
        visible ? 'flex' : 'hidden pointer-events-none',
      ].join(' ')}
    >
      <WhatsAppIcon />
    </a>
  )
}
