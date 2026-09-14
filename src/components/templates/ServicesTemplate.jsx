/**
 * ServicesTemplate — Template A (Modern Clean / Professional)
 * Karakter: Clean, Professional, Lots of whitespace, Strong CTA
 * Color palette: Corporate Blue / Navy / Emerald
 *
 * Props:
 *   data  : object  — full website data
 *   theme : string | object
 */
import Hero from '../sections/Hero'
import About from '../sections/About'
import Services from '../sections/Services'
import Testimonials from '../sections/Testimonials'
import Contact from '../sections/Contact'
import { generateWhatsappUrl, isValidWhatsappNumber } from '../../lib/templateSelector'

// Minimal navbar untuk template profesional
function Navbar({ businessName, whatsappNumber, ctaWhatsappMessage, primaryColor = '#1e40af', isMobilePreview = false }) {
  const hasValidWhatsapp = isValidWhatsappNumber(whatsappNumber)
  const waUrl = generateWhatsappUrl(
    whatsappNumber,
    ctaWhatsappMessage || 'Halo, saya ingin konsultasi gratis mengenai layanan ' + businessName
  )

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
          <span style={{ color: primaryColor }}>🏢</span>
          <span className="truncate max-w-[200px] sm:max-w-xs">{businessName}</span>
        </a>

        <div className="flex items-center gap-6">
          <nav className={[isMobilePreview ? 'hidden' : 'hidden md:flex', 'items-center gap-6 text-sm font-medium text-slate-600'].join(' ')}>
            <a href="#hero" className="hover:text-blue-600 transition-colors">Beranda</a>
            <a href="#services" className="hover:text-blue-600 transition-colors">Layanan</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">Tentang</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimoni</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Kontak</a>
          </nav>
          <a
            href={waUrl}
            target={hasValidWhatsapp ? '_blank' : undefined}
            rel={hasValidWhatsapp ? 'noopener noreferrer' : undefined}
            aria-disabled={!hasValidWhatsapp}
            className={[
              'inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#128c4a] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all active:scale-95',
              !hasValidWhatsapp ? 'pointer-events-none opacity-50' : '',
            ].join(' ')}
          >
            <span>Konsultasi WA</span>
          </a>
        </div>
      </div>
    </header>
  )
}

function Footer({ businessName, tagline, _primaryColor = '#1e40af' }) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-base">{businessName}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-xs sm:text-sm">{tagline}</span>
        </div>
        <span className="text-xs text-slate-500">
          © {new Date().getFullYear()} {businessName}. Dibuat profesional untuk kemajuan UMKM.
        </span>
      </div>
    </footer>
  )
}

export default function ServicesTemplate({ data = {}, theme, viewport = 'desktop' }) {
  const {
    meta = {},
    hero = {},
    about = {},
    services = [],
    testimonials = [],
    contact = {},
    theme: dataTheme = {},
  } = data

  const isNavy = theme === 'modern-navy' || dataTheme?.primaryColor === '#0f172a'
  const isEmerald = theme === 'emerald-pro' || dataTheme?.primaryColor === '#065f46'

  let primaryColor = '#1e40af'
  let _secondaryColor = '#1e3a8a'
  let _accentColor = '#3b82f6'

  if (isNavy) {
    primaryColor = '#0f172a'
    _secondaryColor = '#020617'
    _accentColor = '#38bdf8'
  } else if (isEmerald) {
    primaryColor = '#065f46'
    _secondaryColor = '#064e3b'
    _accentColor = '#10b981'
  } else if (dataTheme?.primaryColor) {
    primaryColor = dataTheme.primaryColor
    if (dataTheme.accentColor) _accentColor = dataTheme.accentColor
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navbar */}
      <Navbar
        businessName={meta.businessName || 'Solusi Digital Pro'}
        whatsappNumber={contact.whatsappNumber}
        ctaWhatsappMessage={hero.ctaWhatsappMessage}
        primaryColor={primaryColor}
        isMobilePreview={viewport === 'mobile'}
      />

      {/* Hero — clean gradient with dynamic primary */}
      <div id="hero">
        <Hero
          data={hero}
          meta={meta}
          contact={contact}
          className="text-white min-h-[65vh] flex flex-col justify-center"
          style={{ backgroundColor: primaryColor }}
          _theme="services"
          mobilePreview={viewport === 'mobile'}
        />
      </div>

      {/* Services — light slate bg */}
      <div id="services">
        <Services
          data={services}
          sectionLabel="Layanan Unggulan Kami"
          sectionDesc="Solusi komprehensif dan terukur untuk mendorong percepatan bisnis Anda"
          className="bg-slate-50 text-blue-600"
          cardVariant="default"
          accentColor={_accentColor}
        />
      </div>

      {/* About — white bg */}
      <div id="about" className="bg-white border-t border-slate-100">
        <About
          data={about}
          meta={meta}
          className="text-blue-600"
        />
      </div>

      {/* Testimonials — slate 50 */}
      <div id="testimonials">
        <Testimonials
          data={testimonials}
          className="bg-slate-50 text-blue-600"
          accentColor={_accentColor}
        />
      </div>

      {/* Contact — primary color accent */}
      <div id="contact" style={{ backgroundColor: primaryColor }}>
        <Contact
          data={contact}
          hero={hero}
          meta={meta}
          className="text-white [&_h2]:text-white [&_p]:text-blue-100 [&_.bg-slate-50]:bg-white/10 [&_.text-slate-800]:text-white [&_.text-slate-700]:text-blue-100 [&_.text-slate-400]:text-blue-200 [&_.text-slate-500]:text-blue-200"
        />
      </div>

      <Footer
        businessName={meta.businessName || 'Solusi Digital Pro'}
        tagline={meta.tagline}
        primaryColor={primaryColor}
      />
    </div>
  )
}
