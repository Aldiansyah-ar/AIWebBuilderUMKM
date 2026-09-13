/**
 * Testimonials — Reusable Section Component
 *
 * Props:
 *   data      : Array<{ name, text, rating? }>
 *   className : string
 */
import Section from '../ui/Section'
import Container from '../ui/Container'
import Card from '../ui/Card'

function StarRating({ rating = 5, accentColor }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={['w-4 h-4', i < rating ? '' : 'text-slate-200'].join(' ')}
          style={i < rating ? { color: accentColor } : undefined}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ item, accentColor }) {
  const { name, text, customerName, review, rating = 5 } = item
  const customer = name || customerName || 'Pelanggan'
  const quote = text || review || ''
  return (
    <Card hover className="flex flex-col gap-4">
      <StarRating rating={rating} accentColor={accentColor} />
      <p className="text-slate-600 italic leading-relaxed flex-1">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        {/* Avatar placeholder */}
        <div className="w-9 h-9 rounded-full bg-current opacity-20 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {customer[0]?.toUpperCase() ?? '?'}
        </div>
        <span className="font-semibold text-slate-800 text-sm">{customer}</span>
      </div>
    </Card>
  )
}

export default function Testimonials({ data = [], className = '', accentColor }) {
  if (!data || data.length === 0) return null

  return (
    <Section id="testimonials" className={className}>
      <Container>
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: accentColor }}>Apa Kata Pelanggan</h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Pengalaman nyata dari pelanggan setia kami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, i) => (
            <TestimonialCard key={item.name ?? item.customerName ?? i} item={item} accentColor={accentColor} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
