/**
 * RetailTemplate — Template C (Bold & Compact)
 * Karakter: Bold, Compact, Product-focused
 * Color palette: Indigo / Violet / Ruby / Midnight
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
import Container from '../ui/Container'
import StickyWhatsAppButton from '../ui/StickyWhatsAppButton'
import { generateWhatsappUrl, isValidWhatsappNumber } from '../../lib/templateSelector'
import { getAccessibleTextColor } from '../../lib/contrast'
import { scrollToSectionOnClick } from '../../lib/scrollToSection'

// Bold navbar
function Navbar({ businessName, whatsappNumber, ctaWhatsappMessage, primaryColor = '#6d28d9', textColor = '#ffffff', isMobilePreview = false }) {
  const hasValidWhatsapp = isValidWhatsappNumber(whatsappNumber)
  const waUrl = generateWhatsappUrl(
    whatsappNumber,
    ctaWhatsappMessage || 'Halo, saya ingin memesan produk dari ' + businessName
  )

  return (
    <header
      className="sticky top-0 z-50 shadow-md transition-colors duration-300"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <a href="#hero" onClick={scrollToSectionOnClick('hero')} className="font-black text-lg sm:text-xl tracking-tight uppercase flex items-center gap-2" style={{ color: textColor }}>
          <span>🛍️</span>
          <span className="truncate max-w-[200px] sm:max-w-xs">{businessName}</span>
        </a>
        <div className="flex items-center gap-4">
          <nav
            className={[isMobilePreview ? 'hidden' : 'hidden md:flex', 'items-center gap-5 text-sm font-semibold'].join(' ')}
            style={{ color: textColor, opacity: 0.8 }}
          >
            <a href="#hero" onClick={scrollToSectionOnClick('hero')} className="hover:opacity-100 transition-opacity">Beranda</a>
            <a href="#services" onClick={scrollToSectionOnClick('services')} className="hover:opacity-100 transition-opacity">Koleksi</a>
            <a href="#advantages" onClick={scrollToSectionOnClick('advantages')} className="hover:opacity-100 transition-opacity">Keunggulan</a>
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
              <span>Belanja via WA</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Nomor WhatsApp belum valid"
              className="inline-flex items-center gap-2 bg-[#25d366] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-sm opacity-50 cursor-not-allowed"
            >
              <span>Belanja via WA</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

// Keunggulan / advantages section — retail specific
function Advantages({ _primaryColor = '#6d28d9' }) {
  const items = [
    { icon: '🚚', title: 'Pengiriman Cepat', desc: 'Kirim ke seluruh Indonesia dengan proteksi packing aman' },
    { icon: '✅', title: '100% Autentik', desc: 'Produk asli berkualitas terbaik dari pengrajin lokal' },
    { icon: '🔄', title: 'Garansi Retur', desc: 'Jaminan garansi uang kembali jika pesanan tidak sesuai' },
    { icon: '💬', title: 'Respon Cepat', desc: 'Customer service ramah & siap melayani konsultasi pesanan' },
  ]
  return (
    <section id="advantages" className="py-16 bg-slate-50 border-y border-slate-100">
      <Container>
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Kenapa Pilih Kami?</h2>
          <p className="text-slate-500 text-sm mt-2">Komitmen kami memberikan pengalaman belanja terbaik untuk Anda</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-5 text-center shadow-xs hover:shadow-md transition-shadow border border-slate-100"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Footer({ businessName, tagline, instagram, _primaryColor = '#6d28d9' }) {
  return (
    <footer className="text-slate-300 py-10" style={{ backgroundColor: '#0f172a' }}>
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-black text-white uppercase tracking-widest">{businessName}</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">{tagline}</span>
        </div>
        {instagram && (
          <span className="text-amber-400 font-medium">{instagram}</span>
        )}
        <span className="text-xs text-slate-500">© {new Date().getFullYear()} {businessName}. Semua Hak Dilindungi.</span>
      </div>
    </footer>
  )
}

export default function RetailTemplate({ data = {}, theme, viewport = 'desktop' }) {
  const {
    meta = {},
    hero = {},
    about = {},
    services = [],
    testimonials = [],
    contact = {},
    theme: dataTheme = {},
  } = data

  const isRuby = theme === 'ruby-crimson' || dataTheme?.primaryColor === '#9f1239'
  const isMidnight = theme === 'midnight-dark' || dataTheme?.primaryColor === '#18181b'

  let primaryColor = '#6d28d9'
  let _accentColor = '#a855f7'

  if (isRuby) {
    primaryColor = '#9f1239'
    _accentColor = '#f43f5e'
  } else if (isMidnight) {
    primaryColor = '#18181b'
    _accentColor = '#f59e0b'
  } else if (dataTheme?.primaryColor) {
    primaryColor = dataTheme.primaryColor
    if (dataTheme.accentColor) _accentColor = dataTheme.accentColor
  }

  // AI-generated theme colors can be any arbitrary hex — validate contrast
  // instead of assuming white text always works on top of primaryColor
  // (WCAG AA, issue #22).
  const onPrimaryText = getAccessibleTextColor(primaryColor)

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <Navbar
        businessName={meta.businessName || 'Batik Nusantara'}
        whatsappNumber={contact.whatsappNumber}
        ctaWhatsappMessage={hero.ctaWhatsappMessage}
        primaryColor={primaryColor}
        textColor={onPrimaryText}
        isMobilePreview={viewport === 'mobile'}
      />

      {/* Hero — bold vibrant with Tagline Pill */}
      <div id="hero">
        <Hero
          data={hero}
          meta={meta}
          contact={contact}
          className="min-h-[65vh] flex flex-col justify-center"
          style={{ backgroundColor: primaryColor }}
          _theme="retail"
          mobilePreview={viewport === 'mobile'}
          textColor={onPrimaryText}
        />
      </div>

      {/* Products — compact grid (Services itself carries id="services") */}
      <div>
        <Services
          data={services}
          sectionLabel="Koleksi Produk Pilihan"
          sectionDesc="Koleksi terbaik dengan standar mutu tinggi yang siap dikirim langsung ke rumah Anda"
          className="bg-slate-50 text-slate-900"
          cardVariant="default"
          accentColor={_accentColor}
        />
      </div>

      {/* Keunggulan — static retail-specific section */}
      <Advantages primaryColor={primaryColor} />

      {/* About — compact, violet accent (About itself carries id="about") */}
      <div>
        <About
          data={about}
          meta={meta}
          className="bg-white text-slate-900"
        />
      </div>

      {/* Testimonials (Testimonials itself carries id="testimonials") */}
      <div>
        <Testimonials
          data={testimonials}
          className="bg-slate-50 text-slate-900"
          accentColor={_accentColor}
        />
      </div>

      {/* Contact — primary color (Contact itself carries id="contact") */}
      <div style={{ backgroundColor: primaryColor }}>
        <Contact
          data={contact}
          hero={hero}
          meta={meta}
          textColor={onPrimaryText}
        />
      </div>

      <Footer
        businessName={meta.businessName || 'Batik Nusantara'}
        tagline={meta.tagline}
        instagram={contact.instagram}
        primaryColor={primaryColor}
      />

      <StickyWhatsAppButton
        whatsappNumber={contact.whatsappNumber}
        message={hero.ctaWhatsappMessage || 'Halo, saya ingin memesan produk dari ' + (meta.businessName || 'Batik Nusantara')}
      />
    </div>
  )
}
