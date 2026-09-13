/**
 * WebsiteRenderer — Entry Point untuk Dev 2A
 *
 * Komponen ini adalah bridge antara state/JSON dari Dev 1 (LLM)
 * dengan template UI dari Dev 2B.
 *
 * Props:
 *   templateId : "template-services" | "template-fnb" | "template-retail"
 *   data       : object  — full website JSON (meta, hero, about, services, testimonials, contact)
 *   theme      : string  — optional theme hint (future use)
 *
 * Usage (Dev 2A):
 *   <WebsiteRenderer
 *     templateId="template-fnb"
 *     data={websiteState.data}
 *     theme={websiteState.theme}
 *   />
 */
import ServicesTemplate from './templates/ServicesTemplate'
import FnbTemplate      from './templates/FnbTemplate'
import RetailTemplate   from './templates/RetailTemplate'

// Template registry — tambah template baru di sini
const TEMPLATE_MAP = {
  'template-services': ServicesTemplate,
  'template-fnb':      FnbTemplate,
  'template-retail':   RetailTemplate,
}

// Fallback error state
function TemplateNotFound({ templateId }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-3 p-8">
        <p className="text-4xl">🤔</p>
        <h2 className="text-xl font-bold text-slate-800">Template tidak ditemukan</h2>
        <p className="text-slate-500 text-sm">
          Template ID <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{templateId}</code> belum terdaftar.
        </p>
        <p className="text-slate-400 text-xs mt-2">
          Tersedia: {Object.keys(TEMPLATE_MAP).join(', ')}
        </p>
      </div>
    </div>
  )
}

// Loading state — ditampilkan saat data belum tersedia
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Memuat website...</p>
      </div>
    </div>
  )
}

export default function WebsiteRenderer({ templateId, data, theme, viewport = 'desktop' }) {
  // Guard: data belum tersedia (loading state dari LLM)
  if (!data || !data.meta) {
    return <LoadingState />
  }

  // Resolve template component
  const TemplateComponent = TEMPLATE_MAP[templateId]

  if (!TemplateComponent) {
    return <TemplateNotFound templateId={templateId} />
  }

  return (
    <TemplateComponent
      data={data}
      theme={theme}
      viewport={viewport}
    />
  )
}

// Re-export template IDs sebagai constants untuk Dev 2A
export const TEMPLATE_IDS = Object.keys(TEMPLATE_MAP)
