/**
 * FnbTemplate — Template B
 * Karakter: Warm, Visual, Menu-focused, Large hero
 * Color palette: Cokelat Klasik / Amber warm tones
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

// Warm-style navbar
function Navbar({ businessName, whatsappNumber, ctaWhatsappMessage, primaryColor = '#452821', isMobilePreview = false }) {
  const hasValidWhatsapp = isValidWhatsappNumber(whatsappNumber)
  const waUrl = generateWhatsappUrl(
    whatsappNumber,
    ctaWhatsappMessage || 'Halo, saya ingin memesan menu di ' + businessName
  )

  return (
    <header
      className="sticky top-0 z-50 shadow-md backdrop-blur-sm transition-colors duration-300"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
          <span>☕</span>
          <span className="truncate max-w-[200px] sm:max-w-xs">{businessName}</span>
        </a>

        <div className="flex items-center gap-5">
          <nav className={[isMobilePreview ? 'hidden' : 'hidden md:flex', 'items-center gap-6 text-sm font-medium text-amber-100/90'].join(' ')}>
            <a href="#hero" className="hover:text-white transition-colors">Beranda</a>
            <a href="#services" className="hover:text-white transition-colors">Menu</a>
            <a href="#about" className="hover:text-white transition-colors">Tentang</a>
            <a href="#contact" className="hover:text-white transition-colors">Kontak</a>
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
            <span>Pesan via WA</span>
          </a>
        </div>
      </div>
    </header>
  )
}

// Decorative wavy divider
function WaveDivider({ flip = false, color = '#faf5f0' }) {
  return (
    <div className={flip ? 'rotate-180' : ''} style={{ color }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-10 sm:h-14 block" aria-hidden="true">
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

function Footer({ businessName, tagline, instagram, primaryColor = '#452821' }) {
  return (
    <footer className="text-amber-100 py-10" style={{ backgroundColor: primaryColor }}>
      <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-3 text-sm text-center">
        <span className="text-2xl">☕</span>
        <span className="font-bold text-white text-lg">{businessName}</span>
        {tagline && <span className="text-amber-200/90 italic max-w-md">{tagline}</span>}
        {instagram && <span className="text-amber-300 font-medium">{instagram}</span>}
        <span className="text-amber-400/70 text-xs mt-3">
          © {new Date().getFullYear()} {businessName}. Hak Cipta Dilindungi.
        </span>
      </div>
    </footer>
  )
}

export default function FnbTemplate({ data = {}, theme, viewport = 'desktop' }) {
  const {
    meta = {},
    hero = {},
    about = {},
    services = [],
    testimonials = [],
    contact = {},
    theme: dataTheme = {},
  } = data

  // Resolve palette colors (default to Classic Warm Chocolate as in image.png)
  const isAmber = theme === 'warm-amber' || dataTheme?.primaryColor === '#92400e'
  const isSage = theme === 'forest-sage' || dataTheme?.primaryColor === '#2d4a22'

  let primaryColor = '#452821'
  let _accentColor = '#d97706'
  let pageBg = '#faf5f0'

  if (isAmber) {
    primaryColor = '#92400e'
    _accentColor = '#f59e0b'
    pageBg = '#fffbeb'
  } else if (isSage) {
    primaryColor = '#2d4a22'
    _accentColor = '#10b981'
    pageBg = '#f0fdf4'
  } else if (dataTheme?.primaryColor) {
    primaryColor = dataTheme.primaryColor
    if (dataTheme.accentColor) _accentColor = dataTheme.accentColor
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: pageBg }}>
      {/* Navbar */}
      <Navbar
        businessName={meta.businessName || 'Warung Kopi Sejahtera'}
        whatsappNumber={contact.whatsappNumber}
        ctaWhatsappMessage={hero.ctaWhatsappMessage}
        primaryColor={primaryColor}
        isMobilePreview={viewport === 'mobile'}
      />

      {/* Hero — Classic Warm with Tagline Pill */}
      <div id="hero">
        <Hero
          data={hero}
          meta={meta}
          contact={contact}
          className="text-white min-h-[65vh] flex flex-col justify-center"
          style={{ backgroundColor: primaryColor }}
          _theme="fnb"
          mobilePreview={viewport === 'mobile'}
        />
      </div>

      {/* Wave into Content */}
      <WaveDivider color={pageBg} />

      {/* Menu section — culinary menu focus */}
      <div id="services">
        <Services
          data={services}
          sectionLabel="Menu Pilihan Kami"
          sectionDesc="Pilihan sajian terbaik dengan cita rasa autentik dan bahan berkualitas setiap hari"
          className="text-amber-900"
          cardVariant="default"
          accentColor={_accentColor}
        />
      </div>

      {/* Wave into About */}
      <div className="rotate-180">
        <WaveDivider color="#ffffff" />
      </div>

      {/* About — white bg */}
      <div id="about" className="bg-white">
        <About
          data={about}
          meta={meta}
          className="text-amber-900"
        />
      </div>

      <WaveDivider color={pageBg} />

      {/* Testimonials */}
      <div id="testimonials">
        <Testimonials
          data={testimonials}
          className="text-amber-900"
          accentColor={_accentColor}
        />
      </div>

      {/* Contact Section */}
      <div id="contact" style={{ backgroundColor: primaryColor }}>
        <Contact
          data={contact}
          hero={hero}
          meta={meta}
          className="text-white [&_h2]:text-white [&_p]:text-amber-100 [&_.bg-slate-50]:bg-white/10 [&_.text-slate-800]:text-white [&_.text-slate-700]:text-amber-100 [&_.text-slate-400]:text-amber-300 [&_.text-slate-500]:text-amber-200 border-t border-white/10"
        />
      </div>

      <Footer
        businessName={meta.businessName || 'Warung Kopi Sejahtera'}
        tagline={meta.tagline}
        instagram={contact.instagram}
        primaryColor={primaryColor}
      />
    </div>
  )
}
