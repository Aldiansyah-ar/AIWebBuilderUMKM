/**
 * exportWebsite.js — TSK-06A (Dev 1B): standalone ZIP bundle generator, with
 * an HTML-only download and a clipboard-copy fallback (Plan B: "ZIP korup ->
 * tombol fallback 'Salin Kode HTML'").
 */
import JSZip from 'jszip'
import { generateWhatsappUrl, isValidWhatsappNumber, formatWhatsappNumber } from './templateSelector'
import faviconSvgRaw from '../assets/favicon.svg?raw'

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

// issue #29: inlined as a data URI (not bundled as a separate file) so the
// favicon works identically in all 3 export modes (ZIP, single-HTML
// download, clipboard copy) without ever risking a broken relative link
// (issue #21) in the modes that don't ship a second file.
const FAVICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(faviconSvgRaw)}`

// issue #30: JSON.stringify doesn't escape `<`, so a business-supplied
// string containing `</script>` could otherwise break out of the inline
// <script> tag it's embedded in — this is the standard safe encoding for
// JSON-in-HTML.
const safeJsonForScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c')

/** Render a WhatsApp CTA as a real disabled <button> when the number is
 * invalid (mirrors Hero.jsx/Contact.jsx and issue #10 — no aria-disabled
 * links), or a live wa.me link otherwise. `trackLabel` (issue #31) tags the
 * live link for the click-tracking script below — skipped on the disabled
 * button since it isn't clickable. */
function waCtaHtml({ hasValidWhatsapp, waUrl, classes, label, id, ariaLabel, trackLabel }) {
  const idAttr = id ? ` id="${id}"` : ''
  if (!hasValidWhatsapp) {
    return `<button type="button" disabled title="Nomor WhatsApp belum valid" aria-label="Nomor WhatsApp belum valid"${idAttr} class="${classes} opacity-50 cursor-not-allowed pointer-events-none">${label}</button>`
  }
  const ariaAttr = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : ''
  const trackAttr = trackLabel ? ` data-cta-track="${escapeHtml(trackLabel)}"` : ''
  return `<a href="${waUrl}" target="_blank" rel="noopener noreferrer"${idAttr}${ariaAttr}${trackAttr} class="${classes}">${label}</a>`
}

export function buildStandaloneHtml(data = {}, templateId = 'template-fnb') {
  const {
    meta = {},
    hero = {},
    about = {},
    services = [],
    testimonials = [],
    contact = {},
    theme = {},
  } = data

  const businessName = escapeHtml(meta.businessName || 'UMKM Website')
  const tagline = escapeHtml(meta.tagline || '')
  const category = escapeHtml(meta.category || '')
  const title = escapeHtml(hero.title || 'Selamat Datang')
  const subtitle = escapeHtml(hero.subtitle || '')
  const ctaText = escapeHtml(hero.ctaText || 'Pesan via WhatsApp')
  const waNumber = contact.whatsappNumber || '628123456789'
  const hasValidWhatsapp = isValidWhatsappNumber(waNumber)
  const waUrl = generateWhatsappUrl(waNumber, hero.ctaWhatsappMessage || `Halo, saya ingin pesan di ${businessName}`)

  const defaultPrimaryColor = templateId === 'template-fnb' ? '#452821' : templateId === 'template-retail' ? '#6d28d9' : '#1e40af'
  const primaryColor = HEX_COLOR_RE.test(theme.primaryColor || '') ? theme.primaryColor : defaultPrimaryColor

  // issue #29: og:description mirrors the <meta name="description"> logic below.
  const ogDescription = subtitle || tagline || businessName

  // issue #30: schema.org LocalBusiness JSON-LD, built from the same data
  // already on the page (no extra input needed from the user).
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: meta.businessName || 'UMKM Website',
    description: hero.subtitle || meta.tagline || undefined,
    ...(contact.address ? { address: { '@type': 'PostalAddress', streetAddress: contact.address } } : {}),
    ...(hasValidWhatsapp ? { telephone: `+${formatWhatsappNumber(waNumber)}` } : {}),
  }

  // issue #30: Maps needs no API key for a plain embed URL like this one.
  const mapsEmbedHtml = contact.address
    ? `<div class="mt-6 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
        <iframe src="https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed" width="100%" height="220" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Lokasi ${businessName}"></iframe>
      </div>`
    : ''

  const servicesHtml = services
    .map(
      (s) => `
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="text-3xl mb-3">${escapeHtml(s.icon || '✨')}</div>
          <h3 class="font-bold text-lg text-slate-900">${escapeHtml(s.name)}</h3>
          <p class="text-slate-600 text-sm mt-2 leading-relaxed">${escapeHtml(s.description || '')}</p>
        </div>
        ${s.priceEstimate ? `<div class="mt-4 pt-3 border-t border-slate-100 font-bold text-sm" style="color:${primaryColor}">${escapeHtml(s.priceEstimate)}</div>` : ''}
      </div>`
    )
    .join('\n')

  const testimonialsHtml = testimonials
    .map(
      (t) => `
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-3">
        <div class="flex text-amber-400">★★★★★</div>
        <p class="text-slate-600 italic text-sm leading-relaxed">"${escapeHtml(t.text || t.review || '')}"</p>
        <div class="pt-3 border-t border-slate-100 font-semibold text-sm text-slate-800">${escapeHtml(t.name || t.customerName || '')}</div>
      </div>`
    )
    .join('\n')

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} — ${tagline || category || 'Website Resmi'}</title>
  <meta name="description" content="${subtitle || tagline || businessName}">
  <link rel="icon" type="image/svg+xml" href="${FAVICON_DATA_URI}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${businessName} — ${tagline || category || 'Website Resmi'}">
  <meta property="og:description" content="${ogDescription}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
  </style>
  <script type="application/ld+json">${safeJsonForScript(localBusinessSchema)}</script>
</head>
<body class="bg-slate-50 text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900">
  <!-- Navbar -->
  <header class="sticky top-0 z-50 shadow-sm transition-colors" style="background-color: ${primaryColor}">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="font-extrabold text-white text-lg tracking-tight">${businessName}</div>
      <div class="flex items-center gap-6">
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-white/90">
          <a href="#hero" class="hover:text-white">Beranda</a>
          <a href="#services" class="hover:text-white">Katalog</a>
          <a href="#about" class="hover:text-white">Tentang</a>
          <a href="#contact" class="hover:text-white">Kontak</a>
        </nav>
        ${waCtaHtml({
          hasValidWhatsapp,
          waUrl,
          classes: 'inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#128c4a] text-white text-sm font-bold px-4 py-2 rounded-full shadow-sm',
          label: 'Pesan via WA',
          trackLabel: 'whatsapp_header',
        })}
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="hero" class="py-20 md:py-32 text-center text-white px-6 relative overflow-hidden" style="background-color: ${primaryColor}">
    <div class="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">
      ${tagline ? `<div class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/15 backdrop-blur-md border border-white/20 text-white/95">${tagline}</div>` : ''}
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">${title}</h1>
      ${subtitle ? `<p class="text-lg md:text-xl text-white/90 max-w-2xl font-normal leading-relaxed">${subtitle}</p>` : ''}
      ${waCtaHtml({
        hasValidWhatsapp,
        waUrl,
        classes: 'inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#128c4a] text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all',
        label: ctaText,
        trackLabel: 'whatsapp_hero',
      })}
    </div>
  </section>

  <!-- Services / Catalog -->
  <section id="services" class="py-20 px-6 max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-extrabold text-slate-900">Pilihan Produk & Layanan</h2>
      <p class="text-slate-500 mt-2">Disediakan khusus untuk memberikan nilai terbaik bagi Anda</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${servicesHtml}
    </div>
  </section>

  <!-- About -->
  <section id="about" class="py-20 px-6 bg-white border-y border-slate-100">
    <div class="max-w-4xl mx-auto text-center space-y-6">
      <h2 class="text-3xl font-extrabold text-slate-900">Tentang ${businessName}</h2>
      <p class="text-lg text-slate-600 leading-relaxed">${escapeHtml(about.description || about.story || '')}</p>
    </div>
  </section>

  <!-- Testimonials -->
  <section id="testimonials" class="py-20 px-6 max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-extrabold text-slate-900">Apa Kata Pelanggan Kami</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${testimonialsHtml}
    </div>
  </section>

  <!-- Contact -->
  <section id="contact" class="py-20 px-6 text-white" style="background-color: ${primaryColor}">
    <div class="max-w-4xl mx-auto text-center space-y-6">
      <h2 class="text-3xl md:text-4xl font-extrabold">Siap Terhubung dengan ${businessName}?</h2>
      <p class="text-white/80 max-w-xl mx-auto">Hubungi kami langsung via WhatsApp untuk pemesanan cepat dan info lengkap.</p>
      ${waCtaHtml({
        hasValidWhatsapp,
        waUrl,
        classes: 'inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#128c4a] text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg',
        label: ctaText,
        trackLabel: 'whatsapp_contact',
      })}
      <div class="pt-8 text-sm text-white/70 space-y-1">
        ${contact.address ? `<p>📍 ${escapeHtml(contact.address)}</p>` : ''}
        ${contact.instagram ? `<p>📸 ${escapeHtml(contact.instagram)}</p>` : ''}
      </div>
      ${mapsEmbedHtml}
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-slate-950 text-slate-500 py-8 px-6 text-center text-xs">
    © ${new Date().getFullYear()} ${businessName}. Website dibuat dengan AI UMKM Website Builder.
  </footer>

  <!-- Sticky mobile WhatsApp CTA (issue #27): floats once the Hero section
       has scrolled out of view, so the CTA stays reachable on a long
       single-page mobile layout without scrolling back up. -->
  ${waCtaHtml({
    hasValidWhatsapp,
    waUrl,
    id: 'sticky-wa-cta',
    ariaLabel: 'Hubungi kami via WhatsApp',
    trackLabel: 'whatsapp_sticky',
    classes: 'md:hidden fixed bottom-5 right-5 z-50 hidden items-center justify-center w-14 h-14 rounded-full bg-[#25d366] text-white shadow-xl hover:bg-[#128c4a] active:scale-95 transition-all',
    label: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.113 1.526 5.84L0 24l6.337-1.506A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.677-.502-5.214-1.381l-.374-.215-3.762.894.944-3.666-.237-.387A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>`,
  })}
  <script>
    (function () {
      var cta = document.getElementById('sticky-wa-cta');
      var hero = document.getElementById('hero');
      if (!cta || !hero || !('IntersectionObserver' in window)) return;
      var observer = new IntersectionObserver(function (entries) {
        var pastHero = !entries[0].isIntersecting;
        cta.classList.toggle('hidden', !pastHero);
        cta.classList.toggle('flex', pastHero);
      }, { threshold: 0 });
      observer.observe(hero);
    })();
  </script>

  <!-- CTA click tracking (issue #31): fires only if the user has plugged in
       their own GA4/Meta Pixel snippet (see README.txt) — a no-op otherwise. -->
  <script>
    (function () {
      document.querySelectorAll('[data-cta-track]').forEach(function (el) {
        el.addEventListener('click', function () {
          var label = el.getAttribute('data-cta-track');
          if (typeof window.gtag === 'function') window.gtag('event', 'cta_click', { event_label: label });
          if (typeof window.fbq === 'function') window.fbq('trackCustom', 'CtaClick', { label: label });
        });
      });
    })();
  </script>
</body>
</html>`

  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'umkm-website'
  return { html: htmlContent, slug }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Single standalone HTML file download (used as part of the clipboard/zip fallback chain). */
export function exportWebsiteToHtml(data = {}, templateId = 'template-fnb') {
  const { html, slug } = buildStandaloneHtml(data, templateId)
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `${slug}-website.html`)
}

/**
 * TSK-06A: bundle the standalone site into a downloadable .zip (HTML + a
 * short README describing the WhatsApp CTA), satisfying US-09's "Unduh
 * bundle ZIP" acceptance criteria.
 */
export async function exportWebsiteToZip(data = {}, templateId = 'template-fnb') {
  const { html, slug } = buildStandaloneHtml(data, templateId)
  const zip = new JSZip()
  zip.file('index.html', html)
  zip.file(
    'README.txt',
    `Website ${data?.meta?.businessName || 'UMKM'}\n\n` +
    `Cara pakai:\n` +
    `1. Ekstrak file ini.\n` +
    `2. Buka index.html di browser, atau upload ke hosting statis mana pun.\n` +
    `3. Tailwind CSS dimuat via CDN — tidak perlu build step tambahan.\n` +
    // issue #23
    `4. Pastikan hosting Anda mengaktifkan HTTPS (kebanyakan hosting gratis seperti Netlify/Vercel/GitHub Pages sudah otomatis aktif) — browser modern menandai situs tanpa HTTPS sebagai "Tidak Aman".\n\n` +
    // issue #30
    `SEO (opsional):\n` +
    `sitemap.xml dan robots.txt sudah disertakan, tapi masih pakai URL placeholder ` +
    `"https://ganti-dengan-domain-anda.com" — ganti dengan domain asli Anda setelah website live, ` +
    `lalu submit sitemap.xml ke Google Search Console.\n\n` +
    // issue #31
    `Melacak klik tombol WhatsApp (opsional):\n` +
    `Tombol WA/CTA di index.html sudah otomatis mengirim event "cta_click" begitu Anda memasang ` +
    `Google Analytics (GA4) atau Meta Pixel — cukup tempel snippet gtag.js/Meta Pixel Anda sebelum tag </head> ` +
    `di index.html, tidak perlu ubah apa pun yang lain.\n\n` +
    `Dibuat dengan AI UMKM Website Builder.`
  )
  // issue #30: placeholder domain the user edits after they know their real
  // one — export time has no way to know it.
  zip.file(
    'robots.txt',
    `User-agent: *\nAllow: /\n\nSitemap: https://ganti-dengan-domain-anda.com/sitemap.xml\n`
  )
  zip.file(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url>\n` +
    `    <loc>https://ganti-dengan-domain-anda.com/</loc>\n` +
    `    <changefreq>monthly</changefreq>\n` +
    `    <priority>1.0</priority>\n` +
    `  </url>\n` +
    `</urlset>\n`
  )
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `${slug}-website.zip`)
}

/**
 * Fallback for when ZIP generation fails (Plan B, TSK-06A): copy the raw
 * standalone HTML straight to the clipboard so the user isn't blocked.
 */
export async function copyHtmlToClipboard(data = {}, templateId = 'template-fnb') {
  const { html } = buildStandaloneHtml(data, templateId)
  await navigator.clipboard.writeText(html)
}
