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
 */
import Section from '../ui/Section'
import Container from '../ui/Container'
import Card from '../ui/Card'

function ServiceCard({ item, variant = 'default', accentColor }) {
  const { name, description, priceEstimate, icon } = item

  if (variant === 'compact') {
    return (
      <Card hover className="flex items-start gap-4 py-4">
        {icon && <span className="text-3xl shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
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
    <Card hover className="flex flex-col gap-3">
      {icon && <span className="text-4xl">{icon}</span>}
      <h3 className="text-lg font-bold text-slate-900">{name}</h3>
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
  if (!data || data.length === 0) return null

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
            <ServiceCard key={item.name ?? i} item={item} variant={cardVariant} accentColor={accentColor} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
