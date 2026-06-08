'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/components/contexts/cart-context'
import { formatARS, WA_NUMBER } from '@/consts/products'
import type { Product } from '@/types'

export interface ProductRating {
  avg:   number
  count: number
}

// Compact star rating — fills whole/half/empty based on avg
function Stars({ avg, size = 12 }: { avg: number; size?: number }) {
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, avg - (i - 1)))
        return (
          <span key={i} className="relative inline-block leading-none" style={{ width: size, height: size, fontSize: size }}>
            <span className="absolute inset-0 text-ink/15">★</span>
            <span className="absolute inset-0 overflow-hidden text-amber-500" style={{ width: `${fill * 100}%` }}>★</span>
          </span>
        )
      })}
    </span>
  )
}

export default function ProductCard({ product, rating }: { product: Product; rating?: ProductRating }) {
  const { addItem } = useCart()
  const [imgIdx,        setImgIdx]        = useState(0)
  const [modalMounted,  setModalMounted]  = useState(false)  // controls DOM presence
  const [modalVisible,  setModalVisible]  = useState(false)  // controls CSS opacity/scale
  const [modalImgIdx,   setModalImgIdx]   = useState(0)

  const images = product.images ?? [product.image]

  // ── URL param: auto-open on mount if ?producto=id matches ────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('producto') === product.id) {
      openModal()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Open: mount → next frame → show (two-frame trick for CSS transitions) ────
  const openModal = useCallback(() => {
    setModalImgIdx(0)
    setModalMounted(true)
    window.history.replaceState({}, '', `?producto=${product.id}`)
    // Two rAFs: first paints the mounted-but-invisible state, second triggers transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setModalVisible(true))
    })
  }, [product.id])

  // ── Close: fade out → unmount ────────────────────────────────────────────────
  const closeModal = useCallback(() => {
    setModalVisible(false)
    window.history.replaceState({}, '', window.location.pathname)
    setTimeout(() => setModalMounted(false), 280)
  }, [])

  // Close on Escape key
  useEffect(() => {
    if (!modalMounted) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalMounted, closeModal])

  return (
    <>
      {/* Card */}
      <article
        className="group bg-paper-2 border border-ink/10 hover:border-transparent hover:bg-ink overflow-hidden flex flex-col cursor-pointer transition-colors duration-[220ms]"
        onClick={openModal}
      >
        {/* Image area */}
        <div className="relative bg-paper-2 group-hover:bg-[#1a1a1a] transition-colors duration-[220ms]">
          <div className="aspect-square overflow-hidden">
            <Image
              src={images[imgIdx]}
              alt={`${product.name} ${product.variant}`}
              width={280}
              height={280}
              className="w-full h-full object-contain block p-4"
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 flex gap-[6px]">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setImgIdx(i) }}
                  className={`w-[26px] h-[26px] p-0 border-2 overflow-hidden rounded-[2px] bg-white group-hover:bg-[#222] transition-colors cursor-pointer ${
                    i === imgIdx ? 'border-ink group-hover:border-white' : 'border-[#ccc]'
                  }`}
                >
                  <Image src={src} alt="" width={22} height={22} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 pb-6 flex flex-col flex-1">
          <div className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-1">
            {product.variant} · {product.size}
          </div>
          <div className="font-heading text-[18px] font-medium mb-[6px] leading-[1.2] group-hover:text-paper transition-colors duration-[220ms]">
            {product.name}
          </div>
          {rating && rating.count > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <Stars avg={rating.avg} />
              <span className="font-mono text-[10px] text-ink/50 group-hover:text-[#aaa] transition-colors duration-[220ms]">
                {rating.avg.toFixed(1)} · {rating.count}
              </span>
            </div>
          )}
          <div className="text-[13px] leading-[1.5] mb-4 text-[#666] group-hover:text-[#aaa] transition-colors duration-[220ms]">
            {product.desc}
          </div>
          <div className="flex-1" />
          <div className="pt-[14px] border-t border-ink/15 group-hover:border-white/15 flex justify-between items-center gap-2 transition-colors duration-[220ms] max-md:flex-col max-md:items-stretch max-md:gap-3">
            {product.price ? (
              <>
                <div className="font-heading text-[22px] font-medium whitespace-nowrap group-hover:text-paper transition-colors duration-[220ms]">
                  {formatARS(product.price)}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); addItem(product.id) }}
                  className="bg-red text-paper font-mono text-[10px] tracking-[0.08em] uppercase px-[14px] py-[10px] whitespace-nowrap flex-shrink-0 cursor-pointer border-none max-md:w-full"
                >
                  + Agregar
                </button>
              </>
            ) : (
              <>
                <span className="font-mono text-[11px] text-[#888] group-hover:text-[#aaa] tracking-[0.1em] transition-colors duration-[220ms]">
                  A consultar
                </span>
                <a
                  href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20info%20del%20${encodeURIComponent(product.name + ' ' + product.size)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-red text-paper font-mono text-[10px] tracking-[0.08em] uppercase px-[14px] py-[10px] whitespace-nowrap flex-shrink-0 no-underline text-center max-md:w-full"
                >
                  Consultar →
                </a>
              </>
            )}
          </div>
        </div>
      </article>

      {/* Product modal — mount/unmount controlled separately from visibility */}
      {modalMounted && (
        <div
          className={[
            'fixed inset-0 z-[300] flex items-center justify-center p-5 overflow-y-auto max-md:items-start',
            'transition-opacity duration-[260ms]',
            modalVisible ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          style={{ background: 'rgba(0,0,0,0.82)' }}
          onClick={closeModal}
        >
          <div
            className={[
              'bg-ink max-w-[920px] w-full grid grid-cols-2 max-md:grid-cols-1 rounded-[2px] overflow-hidden relative md:max-h-[92vh] max-md:overflow-visible',
              'transition-all duration-[260ms]',
              modalVisible ? 'scale-100 translate-y-0' : 'scale-[0.96] translate-y-4',
            ].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image panel */}
            <div className="flex flex-col bg-[#111]">
              <div className="flex-1 overflow-hidden relative" style={{ minHeight: '320px' }}>
                <Image
                  src={images[modalImgIdx]}
                  alt={product.name}
                  width={460}
                  height={460}
                  className="w-full h-full object-contain block p-6 transition-opacity duration-200"
                />
              </div>
              <div className="flex gap-2 p-3 px-4 justify-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setModalImgIdx(i)}
                    className={`w-[52px] h-[52px] p-1 border-2 bg-[#1a1a1a] cursor-pointer rounded-[2px] overflow-hidden ${
                      i === modalImgIdx ? 'border-red' : 'border-white/20'
                    }`}
                  >
                    <Image src={src} alt="" width={44} height={44} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Content panel */}
            <div className="p-9 px-8 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Close button */}
                <div className="flex justify-end mb-5">
                  <button
                    onClick={closeModal}
                    className="bg-white/10 border-none text-white w-8 h-8 rounded-full cursor-pointer text-[18px] flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="font-mono text-[9px] tracking-[0.25em] text-red uppercase mb-[6px]">
                  {product.variant} · {product.size}
                </div>
                <h3
                  className="font-heading text-white m-0 mb-2 font-medium leading-[1.1]"
                  style={{ fontSize: 'clamp(20px,2.5vw,28px)' }}
                >
                  {product.name}
                </h3>

                {rating && rating.count > 0 && (
                  <a
                    href="/tienda/resenas"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 mb-3 group/r"
                  >
                    <Stars avg={rating.avg} size={13} />
                    <span className="font-mono text-[11px] text-white/60 group-hover/r:text-white transition-colors">
                      {rating.avg.toFixed(1)} · {rating.count} {rating.count === 1 ? 'reseña' : 'reseñas'} →
                    </span>
                  </a>
                )}

                {product.tagline && (
                  <p className="font-heading text-[13px] text-red italic m-0 mb-[14px]">
                    &ldquo;{product.tagline}&rdquo;
                  </p>
                )}

                {product.detail && (
                  <p className="font-body text-[13px] leading-[1.75] m-0 mb-4" style={{ color: 'rgba(255,255,255,0.68)' }}>
                    {product.detail}
                  </p>
                )}

                {product.diferencial && (
                  <div
                    className="border-l-2 border-red px-3 py-2 mb-5"
                    style={{ background: 'rgba(192,23,30,0.08)' }}
                  >
                    <span className="font-mono text-[10px] tracking-[0.05em]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {product.diferencial}
                    </span>
                  </div>
                )}

                {product.nutri && (
                  <div className="mb-5">
                    <div className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-2">
                      ── Información nutricional · {product.nutriLabel ?? 'por porción'}
                    </div>
                    <table className="w-full border-collapse font-body">
                      <tbody>
                        {product.nutri.map(([k, v], i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                            }}
                          >
                            <td className="p-[6px] px-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{k}</td>
                            <td className="p-[6px] px-2 text-[12px] text-white text-right font-medium">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                {product.price ? (
                  <>
                    <div className="font-heading text-[26px] text-white font-medium mb-[14px] tracking-[-0.02em]">
                      {formatARS(product.price)}
                      <span className="font-mono text-[9px] ml-2 tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        + IVA
                      </span>
                    </div>
                    <button
                      onClick={() => { addItem(product.id); closeModal() }}
                      className="w-full bg-red text-white border-none p-[15px] cursor-pointer font-mono text-[11px] tracking-[0.15em] uppercase"
                    >
                      + Agregar al carrito
                    </button>
                  </>
                ) : (
                  <a
                    href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20info%20del%20${encodeURIComponent(product.name + ' ' + product.size)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-white p-[15px] font-mono text-[11px] tracking-[0.15em] uppercase no-underline text-center"
                    style={{ background: '#25D366' }}
                  >
                    Consultar por WhatsApp →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
