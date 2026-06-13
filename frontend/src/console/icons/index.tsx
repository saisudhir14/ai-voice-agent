import type { CSSProperties, ReactNode, SVGProps } from 'react'

type IconProps = {
  size?: number
  stroke?: string
  fill?: string
  sw?: number
  style?: CSSProperties
} & Omit<SVGProps<SVGSVGElement>, 'fill' | 'stroke' | 'd'>

type IconBaseProps = IconProps & { d: string | ReactNode }

function IconBase({
  d,
  size = 16,
  stroke = 'currentColor',
  fill = 'none',
  sw = 1.75,
  style,
  ...rest
}: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
      {...rest}
    >
      {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
  )
}

export type IconComponent = (props: IconProps) => ReactNode

export const Icon = {
  logo: (p: IconProps) => (
    <IconBase {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1.2" /><rect x="14" y="3" width="7" height="7" rx="1.2" /><rect x="3" y="14" width="7" height="7" rx="1.2" /><path d="M14 17.5h7M17.5 14v7" /></>} />
  ),
  dashboard: (p: IconProps) => (
    <IconBase {...p} d={<><rect x="3" y="3" width="8" height="10" rx="1.2" /><rect x="13" y="3" width="8" height="5" rx="1.2" /><rect x="13" y="10" width="8" height="11" rx="1.2" /><rect x="3" y="15" width="8" height="6" rx="1.2" /></>} />
  ),
  agents: (p: IconProps) => (
    <IconBase {...p} d={<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>} />
  ),
  phone: (p: IconProps) => (
    <IconBase {...p} d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z" />
  ),
  chat: (p: IconProps) => (
    <IconBase {...p} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  ),
  chart: (p: IconProps) => <IconBase {...p} d={<><path d="M3 3v18h18" /><path d="M7 14l4-4 4 3 5-7" /></>} />,
  hash: (p: IconProps) => <IconBase {...p} d={<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />} />,
  key: (p: IconProps) => (
    <IconBase {...p} d={<><circle cx="7.5" cy="14.5" r="4.5" /><path d="M10.7 11.3 21 1m-4 4 3 3m-6-1 3 3" /></>} />
  ),
  settings: (p: IconProps) => (
    <IconBase {...p} d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>} />
  ),
  search: (p: IconProps) => <IconBase {...p} d={<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>} />,
  plus: (p: IconProps) => <IconBase {...p} d="M12 5v14M5 12h14" />,
  close: (p: IconProps) => <IconBase {...p} d="M18 6 6 18M6 6l12 12" />,
  check: (p: IconProps) => <IconBase {...p} d="M20 6 9 17l-5-5" />,
  chevronDown: (p: IconProps) => <IconBase {...p} d="m6 9 6 6 6-6" />,
  chevronRight: (p: IconProps) => <IconBase {...p} d="m9 18 6-6-6-6" />,
  chevronLeft: (p: IconProps) => <IconBase {...p} d="m15 18-6-6 6-6" />,
  arrowRight: (p: IconProps) => <IconBase {...p} d="M5 12h14M13 5l7 7-7 7" />,
  arrowUp: (p: IconProps) => <IconBase {...p} d="M12 19V5M5 12l7-7 7 7" />,
  arrowDown: (p: IconProps) => <IconBase {...p} d="M12 5v14M5 12l7 7 7-7" />,
  more: (p: IconProps) => (
    <IconBase {...p} d={<><circle cx="12" cy="12" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>} />
  ),
  filter: (p: IconProps) => <IconBase {...p} d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />,
  download: (p: IconProps) => <IconBase {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  play: (p: IconProps) => <IconBase {...p} d="m6 3 14 9-14 9V3z" fill="currentColor" />,
  pause: (p: IconProps) => (
    <IconBase {...p} d={<><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" /><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" /></>} />
  ),
  mic: (p: IconProps) => (
    <IconBase {...p} d={<><rect x="9" y="2" width="6" height="13" rx="3" /><path d="M19 10a7 7 0 0 1-14 0M12 19v3" /></>} />
  ),
  micOff: (p: IconProps) => (
    <IconBase {...p} d={<><path d="M1 1l22 22" /><path d="M9 9v4a3 3 0 0 0 5.1 2.1M15 9V5a3 3 0 0 0-6-.7" /><path d="M17 16.9A7 7 0 0 1 5 12M12 19v3" /></>} />
  ),
  phoneOff: (p: IconProps) => (
    <IconBase {...p} d={<><path d="M10.7 13.3a16 16 0 0 1-3-4.7" /><path d="M2 2l20 20" /><path d="M8.5 2.5a19 19 0 0 1 13 13 2 2 0 0 1-1.2 2.3c-.6.2-1.2.4-1.8.4M5 17a2 2 0 0 0-.5 2.3A19 19 0 0 1 3.1 4a2 2 0 0 1 2.3-1.2" /></>} />
  ),
  user: (p: IconProps) => <IconBase {...p} d={<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>} />,
  bot: (p: IconProps) => (
    <IconBase {...p} d={<><rect x="4" y="7" width="16" height="12" rx="2" /><path d="M12 3v4M9 12h.01M15 12h.01M2 14h2M20 14h2" /></>} />
  ),
  clock: (p: IconProps) => <IconBase {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} />,
  copy: (p: IconProps) => (
    <IconBase {...p} d={<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />
  ),
  edit: (p: IconProps) => (
    <IconBase {...p} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 1 1 3 3L12 15l-4 1 1-4z" /></>} />
  ),
  refresh: (p: IconProps) => (
    <IconBase {...p} d={<><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>} />
  ),
  bolt: (p: IconProps) => <IconBase {...p} d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
  shield: (p: IconProps) => <IconBase {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  globe: (p: IconProps) => (
    <IconBase {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>} />
  ),
  book: (p: IconProps) => (
    <IconBase {...p} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5H6.5A2.5 2.5 0 0 0 4 19.5z" />
  ),
  bell: (p: IconProps) => (
    <IconBase {...p} d={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></>} />
  ),
  moon: (p: IconProps) => <IconBase {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  sun: (p: IconProps) => (
    <IconBase {...p} d={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" /></>} />
  ),
  sidebar: (p: IconProps) => (
    <IconBase {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></>} />
  ),
  external: (p: IconProps) => (
    <IconBase {...p} d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  ),
  eye: (p: IconProps) => (
    <IconBase {...p} d={<><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>} />
  ),
  eyeOff: (p: IconProps) => (
    <IconBase {...p} d={<><path d="M17.9 17.9A10 10 0 0 1 12 20c-6 0-10-8-10-8a19 19 0 0 1 5.2-6" /><path d="M9.9 5.1A10 10 0 0 1 12 4c6 0 10 8 10 8a19 19 0 0 1-2.2 3.3M14.1 14.1a3 3 0 1 1-4.2-4.2" /><path d="M1 1l22 22" /></>} />
  ),
  flag: (p: IconProps) => <IconBase {...p} d="M4 22V4a2 2 0 0 1 2-2h11l-2 5 2 5H6a2 2 0 0 0-2 2" />,
  sparkle: (p: IconProps) => (
    <IconBase {...p} d="M12 3l1.8 4.8L18.5 9.5l-4.8 1.8L12 16l-1.8-4.8L5.5 9.5l4.7-1.7L12 3zM19 15l.9 2.4 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.4z" />
  ),
  alert: (p: IconProps) => <IconBase {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>} />,
  command: (p: IconProps) => (
    <IconBase {...p} d="M18 3a3 3 0 1 0-3 3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12" />
  ),
  circle: (p: IconProps) => <IconBase {...p} d={<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />} />,
  trash: (p: IconProps) => (
    <IconBase {...p} d={<><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>} />
  ),
  toggle: (p: IconProps) => (
    <IconBase {...p} d={<><rect x="1" y="5" width="22" height="14" rx="7" /><circle cx="16" cy="12" r="3" fill="currentColor" stroke="none" /></>} />
  ),
}

export type IconName = keyof typeof Icon
