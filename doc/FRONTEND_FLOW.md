# Alur Frontend — AI UMKM Website Builder

Dokumen ini untuk **Dev 2A (Frontend Core)** dan **Dev 2B (UI Component &
Styling)** memahami bagaimana pesan chat berubah jadi tampilan website di
preview panel, dan — yang paling penting — **bagaimana hasil kerja AI
engineer (`server/`, lihat `AI_FLOW.md`) benar-benar dipakai di sisi
frontend**. Untuk FRD/JSON Schema lengkap lihat `SKILL.md`; untuk alur
backend/prompt/retry lihat `AI_FLOW.md`.

## 1. Peta komponen & state

```
main.jsx
  └─ WebsiteProvider (src/store/websiteStore.jsx)   ← state global + sessionStorage
       └─ App.jsx                                    ← chat panel + preview panel
            ├─ (chat) input → handleSendPrompt()
            └─ (preview) SandboxPreview
                            └─ iframe + React portal
                                 └─ WebsiteRenderer(templateId, data, theme)
                                      └─ FnbTemplate | ServicesTemplate | RetailTemplate
                                           └─ Hero, About, Services, Testimonials, Contact
                                              (src/components/sections/*, dipakai ulang oleh ke-3 template)
```

Semua komponen di bawah `App.jsx` **read-only** terhadap data — mereka
cuma menerima `data`/`theme`/`viewport` sebagai props dan merender.
Satu-satunya tempat yang boleh mengubah data website adalah `App.jsx`
lewat fungsi-fungsi dari `useWebsite()`.

## 2. State: `useWebsite()` (`src/store/websiteStore.jsx`)

```js
const { website, setWebsite, patchWebsite, appendServiceItem, loadFallback, clear } = useWebsite()
```

- `website` — objek JSON lengkap (`UMKMWebsiteState`), sumber kebenaran
  tunggal untuk apa yang dirender di preview.
- `setWebsite(data, {snapshot=true})` — ganti seluruh objek (dipakai
  saat pindah template — lihat `handleSelectTemplate` di `App.jsx`).
  Menerima juga bentuk *updater* `(prev) => next` seperti `useState`.
- `patchWebsite(delta)` — **ganti section top-level yang ada di
  `delta`, section lain tetap** (bukan merge per-field). Ini yang
  dipanggil setelah AI berhasil generate/revisi (lihat §4). Detail
  kenapa full-replace-per-section, bukan deep-merge: `AI_FLOW.md` §5.
- `appendServiceItem(item)` — tambah satu item ke depan `services[]`
  tanpa mengganti field lain. Dipakai untuk quick-action lokal "tambah
  menu" yang tidak lewat AI.
- Semua di atas otomatis tersimpan ke `sessionStorage` (key
  `website_v1`) lewat `useEffect` di `WebsiteProvider` — reload
  halaman tidak menghilangkan hasil kerja user.

**Kalau butuh state lain yang perlu ikut ke-persist** (mis. draft yang
belum di-apply), tambahkan di `WebsiteProvider`, jangan bikin
`useState` terpisah di `App.jsx` — nanti hilang saat reload.

## 3. `App.jsx`: dua jalur setiap pesan chat

Setiap pesan yang dikirim user masuk ke `handleSendPrompt(text)`. Ada
gate `isDeterministicAction` yang mengecek kata kunci (warna, headline,
menu, nomor WA) **sebelum** mempertimbangkan panggil AI:

```mermaid
flowchart TD
    A[User kirim pesan] --> B{cocok kata kunci\nwarna/headline/menu/WA?}
    B -- ya --> C[Jalur lokal: handleThemeChange /\npatchWebsite / appendServiceItem]
    B -- tidak --> D{determineTemplate(text)\nberbeda dari activeTemplate?}
    D -- ya, bisnis baru --> E["generateWebsite(text)\n(src/lib/websiteController.js)"]
    D -- tidak, revisi --> F["reviseWebsite(website, text)\n(src/lib/websiteController.js)"]
    E --> G{ok?}
    F --> G
    G -- ya --> H[patchWebsite(result.data)\n+ sinkron activeTemplate]
    G -- tidak --> I[Toast info + fallback lokal:\ndeteksi kategori / update tagline seadanya]
    C --> J[render ulang SandboxPreview]
    H --> J
    I --> J
```

- **Jalur lokal (C)**: instan (450ms simulasi delay biar terasa natural),
  tidak pernah menyentuh jaringan. Lihat blok `if (isDeterministicAction)`
  di `App.jsx`.
- **Jalur AI (E/F)**: memanggil `src/lib/websiteController.js`, yang
  cuma `fetch('/api/generate' | '/api/revise')` — **tidak ada logic
  prompt/LLM di frontend sama sekali**, semua itu ada di `server/`
  (`AI_FLOW.md`). Frontend hanya perlu tahu kontrak baliknya:
  ```js
  { ok: true, data: UMKMWebsiteState, source: 'llm' }
  // atau
  { ok: false, error: 'not_configured' | 'llm_failed' | 'network', fallback?: UMKMWebsiteState }
  ```
- **Ini titik integrasi AI→backend→frontend yang paling penting**: kalau
  `ok:true`, frontend cukup `patchWebsite(result.data)` — tidak perlu
  tahu apa pun soal Gemini, prompt, atau retry, karena itu semua sudah
  selesai di server sebelum response sampai ke sini.

## 4. Rendering: dari `website` (JSON) ke pixel di layar

`SandboxPreview` (`src/components/SandboxPreview.jsx`) merender website
di dalam **iframe terisolasi** — supaya style Tailwind template tidak
bentrok dengan style workspace/editor. Triknya pakai React portal:

1. Iframe di-load dengan dokumen kosong (`FRAME_DOCUMENT`).
2. Saat `onLoad`, semua `<style>`/`<link rel="stylesheet">` dari
   dokumen utama di-clone ke `<head>` iframe (biar dapat token desain
   yang sama), lalu simpan referensi `#preview-root` di dalam iframe.
3. `createPortal(<WebsiteRenderer .../>, frameRoot)` me-render React
   tree ke dalam iframe itu — jadi state React tetap satu pohon (update
   instan tanpa reload iframe), tapi DOM-nya terisolasi.

`WebsiteRenderer` (`src/components/WebsiteRenderer.jsx`) cuma router
kecil: pilih komponen template dari `templateId`, tampilkan
`LoadingState` kalau `data`/`data.meta` belum ada (mis. sebelum
`WebsiteProvider` selesai seed data pertama kali), atau
`TemplateNotFound` kalau `templateId` tidak dikenal.

Tiap **Template** (`FnbTemplate`/`ServicesTemplate`/`RetailTemplate`)
menyusun ulang komponen **Section** yang sama
(`Hero`/`About`/`Services`/`Testimonials`/`Contact` di
`src/components/sections/`) dengan Navbar/Footer/palet warna khas
masing-masing kategori bisnis. Section-section ini generik — dipakai
oleh ketiga template — jadi kalau menambah field baru ke satu section,
otomatis kepakai di ketiga template sekaligus.

### Kenapa Section komponen baca dua nama field sekaligus

Data yang dirender bisa datang dari 2 sumber dengan konvensi nama
sedikit beda:

| Konsep | Mock data (`src/data/mockWebsiteData.js`) | Skema resmi AI (`shared/schema.js`, dipakai `server/`) |
|---|---|---|
| Deskripsi tentang bisnis | `about.description` | `about.story` |
| Poin unggulan | `about.values[]` | `about.highlights[]` |
| Testimoni | `{name, text, rating}` | `{customerName, review}` |

Makanya `About.jsx` dan `Testimonials.jsx` sengaja destructure
**keduanya** lalu pilih yang ada isinya (`description || story`,
`name || customerName`, dst). **Kalau menambah section/field baru**:
ikuti pola ini, atau — lebih baik — samakan mock data ke nama field
skema resmi supaya tidak ada percabangan sama sekali.

### Warna tema: string preset vs objek bebas dari AI

`activeTheme` di `App.jsx` adalah **id string** preset (`'modern-warm'`,
`'warm-amber'`, dst — daftar preset per template ada di
`src/lib/templateSelector.js:TEMPLATE_META`), dipakai untuk tombol
Theme Palette Switcher di toolbar. Tapi warna asli yang dirender datang
dari `data.theme.primaryColor`/`accentColor` (hex bebas). Tiap template
resolve warnanya begini (lihat `FnbTemplate.jsx`):

```js
if (theme === 'warm-amber' || dataTheme?.primaryColor === '#92400e') primaryColor = '#92400e'
else if (theme === 'forest-sage' || dataTheme?.primaryColor === '#2d4a22') primaryColor = '#2d4a22'
else if (dataTheme?.primaryColor) primaryColor = dataTheme.primaryColor  // ← warna arbitrer dari AI masuk sini
```

Jadi warna hasil generate AI **selalu ikut tampil benar** walau tidak
cocok preset mana pun — cuma pill Theme Switcher-nya yang tidak akan
menyala aktif (tidak ada preset yang match), yang wajar karena memang
bukan salah satu dari 3 preset itu.

## 5. Export & Publish (TSK-06A/06D, sisi UI)

`handleDownload` (`App.jsx`) memanggil `exportWebsiteToZip(websiteData,
activeTemplate)` (`src/lib/exportWebsite.js`) — generate `.zip` berisi
`index.html` standalone + `README.txt`, murni client-side pakai
`jszip`, tidak menyentuh backend sama sekali. Kalau generate zip gagal,
fallback otomatis ke `copyHtmlToClipboard(...)` (Plan B TSK-06A).
Tombol **Publish** di header sengaja `disabled` (stretch goal, Plan B
TSK-06D) — lihat tooltip-nya untuk penjelasan ke user.

## 6. Resep umum ("kalau mau ubah X, sentuh file Y")

- **Tambah quick-action lokal baru** (mis. kata kunci "font" untuk ganti
  `fontFamily`): tambah kondisi di daftar `isDeterministicAction` +
  cabang `if/else` yang sesuai di `App.jsx`, panggil `patchWebsite(...)`
  dengan section lengkap (jangan kirim partial field, karena
  `patchWebsite` replace wholesale — lihat §2).
- **Tambah template kategori bisnis baru** (mis. "Otomotif"): (1)
  tambah entry di `TEMPLATE_META`/`determineTemplate`
  (`src/lib/templateSelector.js`), (2) buat komponen baru di
  `src/components/templates/`, daftarkan di `TEMPLATE_MAP`
  (`WebsiteRenderer.jsx`), (3) tambah dataset mock di
  `mockWebsiteData.js`, (4) tambah entry `FALLBACKS` di
  `shared/schema.js` supaya AI juga punya fallback offline untuk
  kategori itu.
- **Ubah pesan/UX saat AI sukses atau gagal**: semua teks respons ada
  di percabangan `if (result.ok) {...} else {...}` dalam
  `handleSendPrompt` — tidak perlu sentuh `server/` sama sekali untuk
  ini.
- **Ubah bagaimana section me-render field tertentu**: edit langsung
  komponen section terkait di `src/components/sections/` — perubahan
  otomatis berlaku ke ketiga template.

## 7. Known gaps untuk Dev 2A/2B

- `showToast('info', ...)` dipakai di `App.jsx` untuk notifikasi
  fallback AI, tapi `ToastContainer`/`Toast.jsx` cuma punya varian
  `success` dan `error` (`VARIANTS` di `src/components/ui/Toast.jsx`)
  — toast `'info'` saat ini diam-diam jatuh ke styling `success` (hijau
  centang), bukan warna netral. Kalau mau dibedakan, tambah entri
  `info` di `VARIANTS` (mis. ikon `Info` dari `lucide-react`, warna
  biru/slate).
- Pill Theme Switcher tidak pernah "menyala" untuk warna hasil AI yang
  bukan salah satu dari 3 preset per template (lihat §4) — ini
  degradasi yang disengaja/aman, bukan bug, tapi worth didokumentasikan
  supaya tidak ada yang coba "memperbaikinya" tanpa konteks.
- Belum ada indikator loading eksplisit di bubble chat saat menunggu
  respons AI (`isTyping` cuma tampilkan titik-titik generik "Memproses
  perubahan..."), tidak membedakan "sedang menunggu Gemini" vs
  "menjalankan logic lokal". Kalau mau UX lebih jelas, tambahkan state
  terpisah (mis. `aiPending`) di `handleSendPrompt`.
