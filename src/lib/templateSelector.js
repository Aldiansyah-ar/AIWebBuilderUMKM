/**
 * templateSelector.js
 *
 * Logika Seleksi Template Deterministik (TSK-03D / US-06)
 * Memilih otomatis 1 dari 3 preset template layout berdasarkan kategori/deskripsi bisnis:
 *   - Template B (Warm & Visual): Kuliner & F&B
 *   - Template C (Bold & Compact): Retail & Produk Fisik
 *   - Template A (Modern Clean): Jasa & Konsultan UMKM (Default)
 */

export const TEMPLATE_FNB = 'template-fnb'
export const TEMPLATE_SERVICES = 'template-services'
export const TEMPLATE_RETAIL = 'template-retail'

export const TEMPLATE_META = {
  [TEMPLATE_FNB]: {
    id: TEMPLATE_FNB,
    label: '☕ F&B',
    name: 'Kuliner & F&B',
    desc: 'Warm & Visual',
    defaultTheme: 'modern-warm',
    themes: [
      { id: 'modern-warm', label: '☕ Modern Warm (Cokelat)', primaryColor: '#452821', secondaryColor: '#301b15', accentColor: '#d97706', bg: '#faf5f0' },
      { id: 'warm-amber',  label: '🍯 Warm Amber',            primaryColor: '#92400e', secondaryColor: '#78350f', accentColor: '#f59e0b', bg: '#fffbeb' },
      { id: 'forest-sage', label: '🌿 Forest Sage',           primaryColor: '#2d4a22', secondaryColor: '#1e3317', accentColor: '#10b981', bg: '#f0fdf4' },
    ],
  },
  [TEMPLATE_SERVICES]: {
    id: TEMPLATE_SERVICES,
    label: '🏢 Services',
    name: 'Jasa & Konsultasi',
    desc: 'Clean & Professional',
    defaultTheme: 'corporate-blue',
    themes: [
      { id: 'corporate-blue', label: '💼 Corporate Blue', primaryColor: '#1e40af', secondaryColor: '#1e3a8a', accentColor: '#3b82f6', bg: '#f8fafc' },
      { id: 'modern-navy',    label: '⚓ Modern Navy',    primaryColor: '#0f172a', secondaryColor: '#020617', accentColor: '#38bdf8', bg: '#f8fafc' },
      { id: 'emerald-pro',    label: '💎 Emerald Pro',    primaryColor: '#065f46', secondaryColor: '#064e3b', accentColor: '#10b981', bg: '#f0fdf4' },
    ],
  },
  [TEMPLATE_RETAIL]: {
    id: TEMPLATE_RETAIL,
    label: '🛍️ Retail',
    name: 'Retail & Produk',
    desc: 'Bold & Compact',
    defaultTheme: 'bold-violet',
    themes: [
      { id: 'bold-violet',  label: '🛍️ Bold Violet',   primaryColor: '#6d28d9', secondaryColor: '#5b21b6', accentColor: '#a855f7', bg: '#f5f3ff' },
      { id: 'ruby-crimson', label: '🌹 Ruby Crimson',  primaryColor: '#9f1239', secondaryColor: '#881337', accentColor: '#f43f5e', bg: '#fff1f2' },
      { id: 'midnight-dark',label: '🖤 Midnight Dark', primaryColor: '#18181b', secondaryColor: '#09090b', accentColor: '#f59e0b', bg: '#fafafa' },
    ],
  },
}

/**
 * Mendeteksi sinyal kategori dari teks, TANPA fallback — mengembalikan
 * `null` kalau tidak ada satu pun keyword kategori yang cocok. Dipakai saat
 * pembeda "user memang menyebut kategori lain" vs "teks ini cuma revisi
 * biasa yang kebetulan tidak menyebut kategori apa pun" penting, misalnya
 * guard konfirmasi ganti-kategori (issue #14) — `determineTemplate`
 * sendiri tidak bisa dipakai untuk itu karena de fault-nya ke Services
 * begitu tidak ada match sama sekali.
 */
export function detectCategorySignal(categoryOrText = '') {
  if (!categoryOrText) return null

  const text = String(categoryOrText).toLowerCase()

  // Service phrases take priority over product keywords.  For example,
  // "cuci sepatu" is a service, even though it contains "sepatu".
  const serviceKeywords = [
    'jasa', 'konsultan', 'konsultasi', 'barbershop', 'barber', 'cuci sepatu',
    'laundry', 'servis', 'service', 'fotografi', 'fotografer', 'desain',
    'kursus', 'pelatihan', 'perawatan', 'salon', 'bengkel', 'digital marketing',
  ]
  if (serviceKeywords.some((k) => text.includes(k))) {
    return TEMPLATE_SERVICES
  }

  // F&B / Kuliner keywords
  const fnbKeywords = [
    'kopi', 'coffee', 'cafe', 'kafe', 'warung', 'kuliner', 'fnb', 'makan', 'minum',
    'resto', 'restoran', 'bakso', 'soto', 'mie', 'roti', 'bakery', 'kue', 'catering',
    'snack', 'jajanan', 'kedai', 'angkringan', 'boba', 'tea', 'teh', 'jus', 'juice'
  ]
  if (fnbKeywords.some((k) => text.includes(k))) {
    return TEMPLATE_FNB
  }

  // Retail / Produk Fisik keywords
  const retailKeywords = [
    'retail', 'toko', 'produk', 'fashion', 'baju', 'pakaian', 'batik', 'distro',
    'sepatu', 'tas', 'aksesoris', 'sembako', 'elektronik', 'hijab', 'gamis',
    'merchandise', 'souvenir', 'shop', 'store', 'craft', 'kerajinan', 'alat'
  ]
  if (retailKeywords.some((k) => text.includes(k))) {
    return TEMPLATE_RETAIL
  }

  return null
}

/**
 * Memilih template berdasarkan kategori/teks input secara deterministik.
 * Selalu mengembalikan sebuah template id — default ke Services (Template
 * A) kalau tidak ada keyword kategori yang cocok.
 */
export function determineTemplate(categoryOrText = '') {
  return detectCategorySignal(categoryOrText) || TEMPLATE_SERVICES
}

/**
 * Format nomor WhatsApp ke standar internasional (contoh: 08123... -> 628123...)
 */
export function formatWhatsappNumber(num = '') {
  const clean = String(num).replace(/[^0-9]/g, '').replace(/^00/, '')
  if (clean.startsWith('0')) {
    return `62${clean.slice(1)}`
  }
  if (clean.startsWith('8')) {
    return `62${clean}`
  }
  return clean
}

/** Validate Indonesian WhatsApp numbers after normalisation. */
export function isValidWhatsappNumber(num = '') {
  return /^628\d{7,12}$/.test(formatWhatsappNumber(num))
}

/**
 * Generate link wa.me dengan pesan custom
 */
export function generateWhatsappUrl(phoneNumber = '', message = '') {
  const formattedPhone = formatWhatsappNumber(phoneNumber)
  const defaultMsg = 'Halo, saya tertarik dengan layanan/produk Anda'
  const text = encodeURIComponent(message || defaultMsg)
  return isValidWhatsappNumber(formattedPhone)
    ? `https://wa.me/${formattedPhone}?text=${text}`
    : '#'
}
