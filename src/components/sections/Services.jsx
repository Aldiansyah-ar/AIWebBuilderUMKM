/**
 * Services — Reusable Section Component
 *
 * Renders layanan/menu/produk sebagai grid cards.
 * Label disesuaikan berdasarkan prop `sectionLabel`.
 *
 * Props:
 *   data         : Array<{ name, description, priceEstimate?, icon? }>
 *   sectionLabel : string  — e.g. "Layanan Kami", "Menu Kami", "Produk Kami"
 *   sectionDesc  : string  — optional subtitle
 *   className    : string
 *   cardVariant  : "default" | "compact" | "featured"
 *
 * Also renders per-card Edit/Delete controls wired straight to
 * websiteStore's updateServiceItem/removeServiceItem (#52) — this makes it
 * the one section component that isn't purely presentational, since it must
 * be rendered inside a WebsiteProvider (true for the live preview; see
 * SandboxPreview.jsx's portal).
 */
import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import Section from '../ui/Section'
import Container from '../ui/Container'
import Card from '../ui/Card'
import { useWebsite, MIN_SERVICE_ITEMS } from '../../store/websiteStore.jsx'

// Small always-visible (not hover-only — this preview can be viewed at a
// simulated mobile width where "hover" isn't discoverable) icon-button pair
// used to signal "this card is editable" (#52 / UX audit §11: the preview
// should read as an editor, not a screenshot).
function CardActions({ onEdit, onDelete, deleteDisabled, deleteTitle }) {
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        title="Edit item"
        aria-label="Edit item"
        className="p-1.5 rounded-full bg-white/90 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white shadow-xs transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleteDisabled}
        title={deleteTitle}
        aria-label="Hapus item"
        className="p-1.5 rounded-full bg-white/90 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-white shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-500"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function EditForm({ draft, onChange, onSave, onCancel }) {
  const canSave = draft.name.trim() && draft.description.trim() && draft.priceEstimate.trim()
  return (
    <div className="flex flex-col gap-2 text-sm">
      <input
        value={draft.name}
        onChange={(e) => onChange({ ...draft, name: e.target.value })}
        placeholder="Nama"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
      />
      <textarea
        value={draft.description}
        onChange={(e) => onChange({ ...draft, description: e.target.value })}
        placeholder="Deskripsi"
        rows={2}
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
      />
      <input
        value={draft.priceEstimate}
        onChange={(e) => onChange({ ...draft, priceEstimate: e.target.value })}
        placeholder="Harga (mis. Rp15.000)"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
      />
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Batal
        </button>
      </div>
    </div>
  )
}

function ServiceCard({ item, index, variant = 'default', accentColor, onUpdate, onRemove, deleteDisabled }) {
  const { name, description, priceEstimate, icon } = item
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)

  const startEdit = () => {
    setDraft({ name: name || '', description: description || '', priceEstimate: priceEstimate || '' })
    setEditing(true)
  }
  const save = () => {
    onUpdate(index, {
      name: draft.name.trim(),
      description: draft.description.trim(),
      priceEstimate: draft.priceEstimate.trim(),
    })
    setEditing(false)
  }

  const deleteTitle = deleteDisabled ? 'Minimal 3 menu wajib ada' : 'Hapus item'
  const cardPadding = variant === 'compact' ? 'py-4' : ''

  if (editing) {
    return (
      <Card className={cardPadding}>
        <EditForm draft={draft} onChange={setDraft} onSave={save} onCancel={() => setEditing(false)} />
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card hover className="relative flex items-start gap-4 py-4">
        <CardActions onEdit={startEdit} onDelete={() => onRemove(index)} deleteDisabled={deleteDisabled} deleteTitle={deleteTitle} />
        {icon && <span className="text-3xl shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0 pr-14">
          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{description}</p>
          )}
          {priceEstimate && (
            <p className="text-sm font-bold mt-1" style={{ color: accentColor }}>{priceEstimate}</p>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card hover className="relative flex flex-col gap-3">
      <CardActions onEdit={startEdit} onDelete={() => onRemove(index)} deleteDisabled={deleteDisabled} deleteTitle={deleteTitle} />
      {icon && <span className="text-4xl">{icon}</span>}
      <h3 className="text-lg font-bold text-slate-900 pr-14">{name}</h3>
      {description && (
        <p className="text-slate-600 text-sm leading-relaxed flex-1">{description}</p>
      )}
      {priceEstimate && (
        <p className="font-bold text-base mt-auto pt-2 border-t border-slate-100" style={{ color: accentColor }}>
          {priceEstimate}
        </p>
      )}
    </Card>
  )
}

export default function Services({
  data = [],
  sectionLabel = 'Layanan Kami',
  sectionDesc = '',
  className = '',
  cardVariant = 'default',
  accentColor,
}) {
  // Reads the store directly rather than taking onUpdate/onRemove as props:
  // this section is rendered inside the sandboxed preview via a React portal
  // (SandboxPreview.jsx), which keeps it in the same component tree as
  // WebsiteProvider despite the different DOM/iframe location — so context
  // works normally, and threading callbacks through 3 template components
  // just to reach this one section would be pure boilerplate.
  const { updateServiceItem, removeServiceItem } = useWebsite()

  if (!data || data.length === 0) return null

  const deleteDisabled = data.length <= MIN_SERVICE_ITEMS

  return (
    <Section id="services" className={className}>
      <Container>
        {/* Section header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: accentColor }}>{sectionLabel}</h2>
          {sectionDesc && (
            <p className="text-slate-500 max-w-xl mx-auto">{sectionDesc}</p>
          )}
        </div>

        {/* Grid */}
        <div
          className={
            cardVariant === 'compact'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          }
        >
          {data.map((item, i) => (
            <ServiceCard
              key={item.name ?? i}
              item={item}
              index={i}
              variant={cardVariant}
              accentColor={accentColor}
              onUpdate={updateServiceItem}
              onRemove={removeServiceItem}
              deleteDisabled={deleteDisabled}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
