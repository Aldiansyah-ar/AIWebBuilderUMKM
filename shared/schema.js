// UMKMWebsiteState contract (SKILL.md section 5) — shared by the backend
// (server/index.js: validates LLM output, supplies fallbacks) and the
// frontend (src/store/websiteStore.jsx: loadFallback for the offline path).
// ponytail: manual validator — no zod/ajv, switch to zod if schema >10 fields or nested unions
const HEX_RE = /^#([A-Fa-f0-9]{6})$/;
const TEMPLATE_IDS = ["template-services", "template-fnb", "template-retail"];
const FONTS = ["sans", "serif", "display"];

export function validateWebsite(d) {
  const e = [];
  if (!d || typeof d !== "object") return { valid: false, errors: ["root must be object"] };
  for (const k of ["templateId", "theme", "meta", "hero", "about", "services", "contact"]) {
    if (!(k in d)) e.push(`missing ${k}`);
  }
  if (d.templateId && !TEMPLATE_IDS.includes(d.templateId)) e.push("templateId enum");
  if (d.theme) {
    if (!d.theme.primaryColor || !HEX_RE.test(d.theme.primaryColor)) e.push("theme.primaryColor #RRGGBB");
    if (d.theme.accentColor && !HEX_RE.test(d.theme.accentColor)) e.push("theme.accentColor #RRGGBB");
    if (!d.theme.fontFamily || !FONTS.includes(d.theme.fontFamily)) e.push("theme.fontFamily enum");
  }
  if (d.meta) {
    for (const k of ["businessName", "category", "tagline"]) if (!d.meta[k]) e.push(`meta.${k}`);
  }
  if (d.hero) {
    for (const k of ["title", "subtitle", "ctaText", "ctaWhatsappMessage"]) if (!d.hero[k]) e.push(`hero.${k}`);
  }
  if (d.about && !d.about.story) e.push("about.story");
  if (!Array.isArray(d.services) || d.services.length < 3) e.push("services min 3");
  else d.services.forEach((s, i) => { for (const k of ["name", "description", "priceEstimate"]) if (!s[k]) e.push(`services[${i}].${k}`); });
  if (d.testimonials && !Array.isArray(d.testimonials)) e.push("testimonials array");
  if (d.contact) {
    if (!d.contact.whatsappNumber) e.push("contact.whatsappNumber");
    if (!d.contact.address) e.push("contact.address");
  }
  return { valid: e.length === 0, errors: e };
}

// ponytail: fallbacks inline to avoid extra file — split to src/lib/fallback.js if >3 templates
export const FALLBACKS = {
  services: {
    templateId: "template-services",
    theme: { primaryColor: "#1e40af", accentColor: "#3b82f6", fontFamily: "sans" },
    meta: { businessName: "Jasa Konsultasi Sejahtera", category: "Jasa", tagline: "Solusi profesional untuk bisnis Anda" },
    hero: { title: "Konsultasi Bisnis Terpercaya", subtitle: "Bantu UMKM naik kelas dengan strategi tepat", ctaText: "Hubungi via WhatsApp", ctaWhatsappMessage: "Halo, saya tertarik konsultasi" },
    about: { story: "Kami membantu UMKM berkembang dengan layanan konsultasi yang personal dan berpengalaman.", highlights: ["Berpengalaman 5+ tahun", "Konsultasi online & offline"] },
    services: [
      { name: "Konsultasi Strategi", description: "Analisis bisnis menyeluruh", priceEstimate: "Mulai 150rb" },
      { name: "Pendampingan UMKM", description: "Bimbingan intensif 1 bulan", priceEstimate: "Mulai 300rb" },
      { name: "Training Tim", description: "Pelatihan operasional", priceEstimate: "Mulai 200rb" },
    ],
    testimonials: [{ customerName: "Budi", review: "Sangat membantu!" }, { customerName: "Sari", review: "Pelayanan ramah" }],
    contact: { whatsappNumber: "08123456789", address: "Surabaya, Jawa Timur", instagram: "@jasasejahtera" },
  },
  fnb: {
    templateId: "template-fnb",
    theme: { primaryColor: "#9a3412", accentColor: "#fb923c", fontFamily: "serif" },
    meta: { businessName: "Warung Kopi Sejahtera", category: "F&B", tagline: "Kopi tubruk & roti bakar favorit anak nugas" },
    hero: { title: "Ngopi Santai di Warung Sejahtera", subtitle: "Kopi tubruk autentik dan roti bakar hangat di Surabaya", ctaText: "Pesan via WhatsApp", ctaWhatsappMessage: "Halo, mau pesan kopi" },
    about: { story: "Warung kopi rumahan dengan cita rasa tradisional, tempat nongkrong favorit anak muda Surabaya.", highlights: ["Buka 07:00-22:00", "Free WiFi"] },
    services: [
      { name: "Kopi Tubruk", description: "Kopi hitam pekat khas Jawa", priceEstimate: "12rb" },
      { name: "Roti Bakar", description: "Roti bakar coklat keju", priceEstimate: "15rb" },
      { name: "Es Kopi Susu", description: "Kopi susu gula aren", priceEstimate: "18rb" },
    ],
    testimonials: [{ customerName: "Rina", review: "Kopinya mantap!" }, { customerName: "Andi", review: "Tempat nyaman" }],
    contact: { whatsappNumber: "08123456789", address: "Jl. Raya Surabaya No.12", instagram: "@kopisejahtera" },
  },
  retail: {
    templateId: "template-retail",
    theme: { primaryColor: "#065f46", accentColor: "#34d399", fontFamily: "display" },
    meta: { businessName: "Toko Berkah Retail", category: "Retail", tagline: "Produk fisik lengkap harga bersahabat" },
    hero: { title: "Belanja Mudah di Toko Berkah", subtitle: "Sedia sembako, snack, dan kebutuhan harian", ctaText: "Chat WhatsApp", ctaWhatsappMessage: "Halo, mau tanya stok" },
    about: { story: "Toko retail keluarga melayani kebutuhan harian warga dengan harga jujur.", highlights: ["Buka setiap hari", "Bisa antar"] },
    services: [
      { name: "Paket Sembako", description: "Beras, minyak, gula", priceEstimate: "85rb" },
      { name: "Snack Box", description: "Aneka camilan", priceEstimate: "25rb" },
      { name: "Minuman Dingin", description: "Teh, kopi, jus", priceEstimate: "8rb" },
    ],
    testimonials: [{ customerName: "Ibu Ani", review: "Lengkap dan murah" }, { customerName: "Pak Joko", review: "Pelayanan cepat" }],
    contact: { whatsappNumber: "08123456789", address: "Surabaya", instagram: "@tokoberkah" },
  },
};

export function getFallback(category = "") {
  const c = category.toLowerCase();
  if (c.includes("kopi") || c.includes("makan") || c.includes("kuliner") || c.includes("fnb") || c.includes("warung") || c.includes("bakso")) return FALLBACKS.fnb;
  if (c.includes("retail") || c.includes("toko") || c.includes("produk")) return FALLBACKS.retail;
  return FALLBACKS.services;
}
