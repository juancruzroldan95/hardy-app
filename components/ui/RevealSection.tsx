'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

interface RevealSectionProps {
  children: ReactNode
  /** Extra classes appended alongside reveal-hidden / reveal-visible */
  className?: string
  /** Stagger delay in ms (used for grid cards) */
  delay?: number
  style?: CSSProperties
}

/**
 * Wraps children in a div that fades-in + slides up once it enters the viewport.
 * Fires once per element (IntersectionObserver is disconnected after first trigger).
 * prefers-reduced-motion is handled via CSS in globals.css — no JS branching needed.
 */
export default function RevealSection({
  children,
  className = '',
  delay = 0,
  style,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal-hidden${className ? ` ${className}` : ''}`}
      style={{
        ...style,
        transitionDelay: delay > 0 ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  )
}
