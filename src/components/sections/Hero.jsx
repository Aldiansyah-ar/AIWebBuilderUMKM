/**
 * Hero — Reusable Section Component
 *
 * Props:
 *   data: {
 *     title            : string
 *     subtitle         : string
 *     ctaText          : string
 *     ctaWhatsappMessage: string
 *   }
 *   contact: {
 *     whatsappNumber   : string  e.g. "628123456789"
 *   }
 *   className : string  — override/extend classes (used by templates)
 *   theme     : "services" | "fnb" | "retail"
 */
import Button from '../ui/Button'
import Container from '../ui/Container'
import { generateWhatsappUrl } from '../../lib/templateSelector'

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 shrink-0"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.113 1.526 5.84L0 24l6.337-1.506A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.677-.502-5.214-1.381l-.374-.215-3.762.894.944-3.666-.237-.387A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
)

export default function Hero({
  data = {},
  contact = {},
  meta = {},
  className = '',
  style = {},
  _theme = 'services',
  mobilePreview = false,
}) {
  const {
    title = 'Selamat Datang',
    subtitle = '',
    ctaText = 'Hubungi Kami via WhatsApp',
    ctaWhatsappMessage = 'Halo, saya tertarik dengan layanan Anda',
  } = data

  const tagline = meta.tagline || data.tagline || ''
  const { whatsappNumber = '' } = contact

  const waUrl = generateWhatsappUrl(whatsappNumber, ctaWhatsappMessage)

  return (
    <div className={['relative overflow-hidden', className].join(' ')} style={style}>
      <Container>
        <div className={['flex flex-col items-center text-center gap-6 relative z-10', mobilePreview ? 'py-16' : 'py-20 md:py-32'].join(' ')}>
          {tagline && (
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/15 backdrop-blur-md border border-white/20 text-white/95 shadow-sm">
              {tagline}
            </div>
          )}

          <h1 className={[mobilePreview ? 'text-4xl' : 'text-4xl sm:text-5xl md:text-6xl', 'font-extrabold leading-tight max-w-4xl tracking-tight text-white drop-shadow-sm'].join(' ')}>
            {title}
          </h1>

          {subtitle && (
            <p className={[mobilePreview ? 'text-base' : 'text-base sm:text-lg md:text-xl', 'max-w-2xl text-white/90 leading-relaxed font-normal'].join(' ')}>
              {subtitle}
            </p>
          )}

          <Button
            href={waUrl}
            variant="whatsapp"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
            className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-base font-bold py-3.5 px-7"
          >
            <WhatsAppIcon />
            {ctaText}
          </Button>
        </div>
      </Container>

      {/* Decorative background subtle glow */}
      <div
        className="absolute inset-0 -z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-15 bg-white blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 bg-white blur-3xl" />
      </div>
    </div>
  )
}
