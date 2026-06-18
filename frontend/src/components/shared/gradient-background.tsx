interface GradientBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function GradientBackground({
  className = '',
  intensity = 'medium',
}: GradientBackgroundProps) {
  const opacityMap = {
    low: '0.03',
    medium: '0.05',
    high: '0.07',
  }
  const opacity = opacityMap[intensity]

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]"
        style={{ background: `rgba(59, 130, 246, ${opacity})` }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px]"
        style={{ background: `rgba(59, 130, 246, ${Number(opacity) * 0.5})` }}
      />
    </div>
  )
}
