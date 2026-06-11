'use client'

interface Props {
  action: () => Promise<void>
  confirm: string
  children: React.ReactNode
  className?: string
  title?: string
}

export default function DeleteButton({ action, confirm: confirmMsg, children, className, title }: Props) {
  return (
    <form action={action}>
      <button
        type="submit"
        title={title}
        className={className}
        onClick={(e) => {
          if (!window.confirm(confirmMsg)) e.preventDefault()
        }}
      >
        {children}
      </button>
    </form>
  )
}
