import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#C0171E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#FAFAF8',
            fontSize: 22,
            fontWeight: 900,
            fontFamily: 'serif',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          H
        </span>
      </div>
    ),
    { ...size }
  )
}
