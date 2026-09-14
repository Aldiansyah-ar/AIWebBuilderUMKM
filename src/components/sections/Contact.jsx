/**
 * Contact — Reusable Section Component
 *
 * Props:
 *   data: {
 *     whatsappNumber : string  — "628123456789"
 *     address        : string
 *     instagram      : string  — "@handle"
 *     email          : string
 *   }
 *   hero: {
 *     ctaText              : string  — reuse CTA text
 *     ctaWhatsappMessage   : string
 *   }
 *   meta: {
 *     businessName : string
 *   }
 *   className : string
 */
import Section from '../ui/Section'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { formatWhatsappNumber, generateWhatsappUrl, isValidWhatsappNumber } from '../../lib/templateSelector'

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.113 1.526 5.84L0 24l6.337-1.506A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.677-.502-5.214-1.381l-.374-.215-3.762.894.944-3.666-.237-.387A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
)

function ContactItem({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-xl shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-slate-700 text-sm mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Contact({ data = {}, hero = {}, meta = {}, className = '' }) {
  const {
    whatsappNumber = '',
    address = '',
    instagram = '',
    email = '',
  } = data

  const {
    ctaText = 'Hubungi Kami via WhatsApp',
    ctaWhatsappMessage = 'Halo, saya ingin bertanya lebih lanjut',
  } = hero

  const { businessName = 'Kami' } = meta

  const normalizedWhatsapp = formatWhatsappNumber(whatsappNumber)
  const hasValidWhatsapp = isValidWhatsappNumber(whatsappNumber)
  const waUrl = generateWhatsappUrl(whatsappNumber, ctaWhatsappMessage)

  return (
    <Section id="contact" className={className}>
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* CTA column */}
          <div className="space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold">
              Siap Berbicara dengan {businessName}?
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Hubungi kami langsung via WhatsApp. Kami siap membantu!
            </p>
            <Button
              href={waUrl}
              variant="whatsapp"
              size="lg"
              target={hasValidWhatsapp ? '_blank' : undefined}
              rel={hasValidWhatsapp ? 'noopener noreferrer' : undefined}
              aria-disabled={!hasValidWhatsapp}
              className={!hasValidWhatsapp ? 'pointer-events-none opacity-50' : ''}
            >
              <WhatsAppIcon />
              {ctaText}
            </Button>
          </div>

          {/* Info column */}
          <div className="bg-slate-50 rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-slate-800">Informasi Kontak</h3>
            <ContactItem icon="📞" label="WhatsApp" value={hasValidWhatsapp ? `+${normalizedWhatsapp}` : 'Nomor WhatsApp belum valid'} />
            <ContactItem icon="📍" label="Alamat" value={address} />
            <ContactItem icon="📸" label="Instagram" value={instagram} />
            <ContactItem icon="✉️" label="Email" value={email} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
