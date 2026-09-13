/**
 * About — Reusable Section Component
 *
 * Props:
 *   data: {
 *     description : string
 *     vision      : string   (optional)
 *     values      : string[] (optional)
 *   }
 *   meta: {
 *     businessName: string
 *     category    : string
 *   }
 *   className : string
 */
import Section from '../ui/Section'
import Container from '../ui/Container'
import Badge from '../ui/Badge'

export default function About({ data = {}, meta = {}, className = '' }) {
  const {
    description = '',
    story = '',
    vision = '',
    values = [],
    highlights = [],
  } = data
  const { businessName = 'Bisnis Kami', category = '' } = meta
  const body = description || story
  const valueList = values.length > 0 ? values : highlights

  return (
    <Section id="about" className={className}>
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text column */}
          <div className="space-y-5">
            {category && (
              <Badge variant="info">{category}</Badge>
            )}
            <h2 className="text-3xl md:text-4xl font-bold">
              Tentang {businessName}
            </h2>
            {body && (
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                {body}
              </p>
            )}
            {vision && (
              <div className="border-l-4 border-current pl-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Visi Kami
                </p>
                <p className="text-slate-700 italic">{vision}</p>
              </div>
            )}
          </div>

          {/* Values column */}
          {valueList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Nilai Kami</h3>
              <ul className="space-y-3">
                {valueList.map((val, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-5 h-5 rounded-full bg-current opacity-80 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{val}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fallback if no values — decorative visual */}
          {valueList.length === 0 && (
            <div className="hidden md:flex items-center justify-center">
              <div className="w-64 h-64 rounded-3xl bg-current opacity-10 flex items-center justify-center">
                <span className="text-7xl select-none">🏢</span>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
