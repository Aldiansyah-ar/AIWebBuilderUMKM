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
import StickyWhatsAppButton from '../ui/StickyWhatsAppButton'
import { generateWhatsappUrl, isValidWhatsappNumber } from '../../lib/templateSelector'
import { getAccessibleTextColor } from '../../lib/contrast'
import { scrollToSectionOnClick } from '../../lib/scrollToSection'

// Warm-style navbar
function Navbar({ businessName, whatsappNumber, ctaWhatsappMessage, primaryColor = '#452821', textColor = '#ffffff', isMobilePreview = false }) {
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
        <a href="#hero" onClick={scrollToSectionOnClick('hero')} className="font-extrabold text-lg sm:text-xl tracking-tight flex items-center gap-2" style={{ color: textColor }}>
          <span>☕</span>
          <span className="truncate max-w-[200px] sm:max-w-xs">{businessName}</span>
        </a>

        <div className="flex items-center gap-5">
          <nav
            className={[isMobilePreview ? 'hidden' : 'hidden md:flex', 'items-center gap-6 text-sm font-medium'].join(' ')}
            style={{ color: textColor, opacity: 0.9 }}
          >
            <a href="#hero" onClick={scrollToSectionOnClick('hero')} className="hover:opacity-100 transition-opacity">Beranda</a>
            <a href="#services" onClick={scrollToSectionOnClick('services')} className="hover:opacity-100 transition-opacity">Menu</a>
            <a href="#about" onClick={scrollToSectionOnClick('about')} className="hover:opacity-100 transition-opacity">Tentang</a>
            <a href="#contact" onClick={scrollToSectionOnClick('contact')} className="hover:opacity-100 transition-opacity">Kontak</a>
          </nav>
          {hasValidWhatsapp ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#128c4a] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all active:scale-95"
            >
              <span>Pesan via WA</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Nomor WhatsApp belum valid"
              className="inline-flex items-center gap-2 bg-[#25d366] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-sm opacity-50 cursor-not-allowed"
            >
              <span>Pesan via WA</span>
            </button>
          )}
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

function Footer({ businessName, tagline, instagram, primaryColor = '#452821', textColor = '#ffffff' }) {
  return (
    <footer className="py-10" style={{ backgroundColor: primaryColor, color: textColor }}>
      <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-3 text-sm text-center">
        <span className="text-2xl">☕</span>
        <span className="font-bold text-lg" style={{ color: textColor }}>{businessName}</span>
        {tagline && <span className="italic max-w-md" style={{ opacity: 0.85 }}>{tagline}</span>}
        {instagram && <span className="font-medium" style={{ opacity: 0.85 }}>{instagram}</span>}
        <span className="text-xs mt-3" style={{ opacity: 0.6 }}>
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

  // AI-generated theme colors can be any arbitrary hex — validate contrast
  // instead of assuming white text always works on top of primaryColor
  // (WCAG AA, issue #22).
  const onPrimaryText = getAccessibleTextColor(primaryColor)

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: pageBg }}>
      {/* Navbar */}
      <Navbar
        businessName={meta.businessName || 'Warung Kopi Sejahtera'}
        whatsappNumber={contact.whatsappNumber}
        ctaWhatsappMessage={hero.ctaWhatsappMessage}
        primaryColor={primaryColor}
        textColor={onPrimaryText}
        isMobilePreview={viewport === 'mobile'}
      />

      {/* Hero — Classic Warm with Tagline Pill */}
      <div id="hero">
        <Hero
          data={hero}
          meta={meta}
          contact={contact}
          className="min-h-[65vh] flex flex-col justify-center"
          style={{ backgroundColor: primaryColor }}
          _theme="fnb"
          mobilePreview={viewport === 'mobile'}
          textColor={onPrimaryText}
        />
      </div>

      {/* Wave into Content */}
      <WaveDivider color={pageBg} />

      {/* Menu section — culinary menu focus (Services itself carries id="services") */}
      <div>
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

      {/* About — white bg (About itself carries id="about") */}
      <div className="bg-white">
        <About
          data={about}
          meta={meta}
          className="text-amber-900"
        />
      </div>

      <WaveDivider color={pageBg} />

      {/* Testimonials (Testimonials itself carries id="testimonials") */}
      <div>
        <Testimonials
          data={testimonials}
          className="text-amber-900"
          accentColor={_accentColor}
        />
      </div>

      {/* Contact Section (Contact itself carries id="contact") */}
      <div style={{ backgroundColor: primaryColor }}>
        <Contact
          data={contact}
          hero={hero}
          meta={meta}
          className="border-t border-white/10"
          textColor={onPrimaryText}
        />
      </div>

      <Footer
        businessName={meta.businessName || 'Warung Kopi Sejahtera'}
        tagline={meta.tagline}
        instagram={contact.instagram}
        primaryColor={primaryColor}
        textColor={onPrimaryText}
      />

      <StickyWhatsAppButton
        whatsappNumber={contact.whatsappNumber}
        message={hero.ctaWhatsappMessage || 'Halo, saya ingin memesan menu di ' + (meta.businessName || 'Warung Kopi Sejahtera')}
      />
    </div>
  )
}
