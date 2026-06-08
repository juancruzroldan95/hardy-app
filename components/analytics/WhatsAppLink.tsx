'use client'

/**
 * Wrapper de enlace a WhatsApp que dispara el evento Lead del Meta Pixel.
 * Reemplaza los <a href="wa.me/..."> en páginas clave para medir conversiones.
 *
 * Uso:
 *   <WhatsAppLink href={`${WA_NUMBER}?text=...`} className="...">
 *     Consultar por WhatsApp
 *   </WhatsAppLink>
 */

interface WhatsAppLinkProps {
  href: string
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}

export default function WhatsAppLink({ href, className, children, 'aria-label': ariaLabel }: WhatsAppLinkProps) {
  function handleClick() {
    window.fbq?.('track', 'Lead', { content_name: 'WhatsApp' })
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
