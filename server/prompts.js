// ponytail: single string prompt, no template engine — add i18n if multi-language needed
export const SYSTEM_PROMPT_V1 = `Kamu generator JSON untuk AI Website Builder UMKM Indonesia.
ATURAN KETAT:
- Output HANYA JSON valid, tanpa markdown, tanpa \`\`\`json, tanpa komentar.
- Ikuti skema UMKMWebsiteState persis. Jangan tambah field di luar skema.
- Bahasa Indonesia santai, relevan UMKM lokal.
- templateId: "template-services" (Jasa), "template-fnb" (F&B/Kuliner), "template-retail" (Retail/Produk)
- theme.primaryColor format "#RRGGBB", fontFamily: "sans"|"serif"|"display"
- services minimal 3 item {name, description, priceEstimate}
- testimonials minimal 2 {customerName, review}
- contact.whatsappNumber format "08..." (akan dinormalisasi ke 62)
- hero.ctaWhatsappMessage pesan custom untuk link wa.me
Skema: {templateId, theme{primaryColor, accentColor, fontFamily}, meta{businessName, category, tagline}, hero{title, subtitle, ctaText, ctaWhatsappMessage}, about{story, highlights}, services[], testimonials[], contact{whatsappNumber, address, instagram}}`;

function formatHistory(history = []) {
  return trimHistory(history)
    .map((turn) => {
      const role = turn?.role === 'assistant' ? 'ASSISTANT': 'USER'
      const text = String(turn?.content ?? '').slice(0, 500)
      return `${role}: ${text}`
    }).join('\n')
}

export function buildInitialPrompt(userInput) {
  return `${SYSTEM_PROMPT_V1}\n\nInput user: """${userInput.slice(0, 1000)}"""\n\nBalas JSON saja.`;
}

export function buildRevisionPrompt(oldJson, userMsg, history = []) {
  const historyBlock = formatHistory(history)
  const historySection = historyBlock
  ? `\nRiwayat percakapan:\n${historyBlock}\n`
  : `\n(Tidak ada riwayat percakapan sebelumnya)\n`
  return `${SYSTEM_PROMPT_V1}\n${historySection}\n\nState website saat ini:\n${JSON.stringify(oldJson).slice(0, 3500)}\n\nRevisi diminta: """${userMsg.slice(0, 500)}"""\nAturan revisi: Gunakan riwayat percakapan untuk memahami konteks. Ubah HANYA field yang diminta. Jangan hapus section lain. Jika minta warna → ubah theme.primaryColor/accentColor saja. Jika minta tambah menu → append ke services[]. Jika minta hapus menu tertentu (mis. "hapus menu es kopi") → hapus item itu dari services[], TAPI services[] wajib tetap berisi minimal 3 item — kalau menghapus akan membuat kurang dari 3, JANGAN hapus, biarkan services[] apa adanya. Jika minta ubah nama/deskripsi/harga menu tertentu (mis. "ubah harga es kopi jadi Rp20.000") → ubah field item itu saja di services[], item lain tetap sama persis.\nBalas JSON lengkap yang sudah direvisi.`;
}

export function trimHistory(history, max = 3) {
  return history.slice(-max);
}
