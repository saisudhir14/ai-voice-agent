interface LogosMarqueeProps {
  label?: string
  logos?: string[]
}

const defaultLogos = [
  'Northwind Health',
  'Vertex Bank',
  'Apex Logistics',
  'Lumen Hotels',
  'Helio Retail',
  'Cascade Care',
  'Atlas Mutual',
  'Beacon Studios',
]

export function LogosMarquee({
  label = 'Trusted by teams shipping voice AI to production',
  logos = defaultLogos,
}: LogosMarqueeProps) {
  const track = [...logos, ...logos]
  return (
    <div>
      <p className="mb-8 text-center text-eyebrow uppercase text-ink-3">{label}</p>
      <div className="relative mx-auto max-w-5xl overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-paper to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-paper to-transparent"
          aria-hidden
        />
        <div className="mk-marquee flex w-max items-center gap-x-14" aria-hidden>
          {track.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-ink-3"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
