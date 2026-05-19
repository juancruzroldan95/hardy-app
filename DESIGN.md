# Hardy Design System

Marca argentina de crema de maní y miel 100% naturales. Estética minimalista, alta tipografía, alto contraste. Tagline: **"Alimentá tu instinto"**.

---

## Brand Identity

- **Nombre**: HARDY
- **País**: Argentina
- **Fundación**: 2015
- **Voz**: Directa, sin vueltas, auténtica. Sin adjetivos vacíos. El producto habla solo.
- **Tagline**: Alimentá tu instinto
- **WhatsApp**: `https://wa.me/5491135736956`
- **Instagram**: `https://www.instagram.com/hardy.arg/`

---

## Color Tokens

```css
--color-red:     #C0171E   /* Acento principal — CTAs, highlights, tags */
--color-ink:     #1A1A1A   /* Backgrounds oscuros, texto sobre claro */
--color-paper:   #FAFAF8   /* Background principal claro, texto sobre oscuro */
--color-paper-2: #F1EFE9   /* Background secundario — cards, secciones alternadas */
```

### Uso de colores

| Token | Uso |
|-------|-----|
| `red` | Botón CTA primario, etiquetas de categoría, énfasis en texto (em italic), íconos de check, numeración |
| `ink` | Nav, footer, backgrounds de secciones oscuras, botones secundarios |
| `paper` | Background principal, texto sobre ink, superficies de cards |
| `paper-2` | Background alternado en secciones, cards de recetas, secciones de contenido |

### Transparencias frecuentes

```
ink con 10% opacidad → bordes y divisores claros: rgba(26,26,26,0.10)
ink con 15% opacidad → bordes estándar:           rgba(26,26,26,0.15)
ink con 20% opacidad → bordes más definidos:      rgba(26,26,26,0.20)
paper con 65% opacidad → texto secundario sobre ink
```

### Colores externos

```
WhatsApp green: #25D366
Footer dark:    #111111
```

---

## Typography

### Fuentes

| Familia | Rol | Weights |
|---------|-----|---------|
| **Anton** | Logo "HARDY", titulares de display muy grandes | 400 |
| **Fraunces** | Headings de sección, nombres de producto, precios | 400, 500, 600 (+ italic) |
| **JetBrains Mono** | Labels, CTAs, tags, anuncios, monospace UI | 400, 500 |
| **Manrope** | Body text, descripciones, párrafos | 300, 400, 500, 600, 700 |

### Escala tipográfica

```
Hero H1:         clamp(52px, 8vw, 112px)  — Fraunces 500, line-height: 0.92, letter-spacing: -0.02em
Section H2:      clamp(36px, 5vw, 56px)   — Fraunces 500, line-height: 1.1
Section H2 sm:   clamp(32px, 4vw, 48px)   — Fraunces 500
Product name H3: 18px–22px               — Fraunces 500, line-height: 1.2
Price:           22px–28px               — Fraunces 500
Body large:      17px                    — Manrope 300, line-height: 1.6
Body standard:   15px                    — Manrope 400, line-height: 1.6–1.8
Body small:      13px–14px              — Manrope 400, line-height: 1.5–1.6
Label/tag:       9px–11px               — JetBrains Mono 400–500, letter-spacing: 0.2em–0.25em, UPPERCASE
Announcement:    11px                   — JetBrains Mono, letter-spacing: 0.2em, UPPERCASE
Logo display:    28px–48px              — Anton, letter-spacing: 0.04em
```

### Patrones de texto recurrentes

```
// Eyebrow label (sobre un heading)
<div style="font-family: JetBrains Mono; font-size: 11px; letter-spacing: 0.25em; color: RED; text-transform: uppercase;">
  ── Categoría · Subtítulo
</div>

// Heading con énfasis en rojo
<h2 style="font-family: Fraunces; font-size: clamp(36px, 5vw, 56px); font-weight: 500;">
  Texto <em style="font-style: italic; color: RED">énfasis.</em>
</h2>

// Subtag de producto
<div style="font-family: JetBrains Mono; font-size: 9px; letter-spacing: 0.2em; color: RED; text-transform: uppercase;">
  Natural · 380g
</div>
```

---

## Spacing

### Secciones

```
padding: 80px 40px   — sección estándar (desktop)
padding: 60px 40px   — footer principal
padding: 20px 24px   — mobile (breakpoint 900px)
```

### Cards / Contenedores internos

```
padding: 40px 32px   — tarjetas de formato/segmento
padding: 24px 28px   — tarjetas de receta
padding: 20px 20px 24px — tarjetas de producto
padding: 20px 28px   — carrito y paneles
padding: 56px        — modal de checkout
```

### Gaps y márgenes

```
gap: 2px    — separación entre tarjetas (crea línea de grilla visible)
gap: 12px   — elementos inline pequeños
gap: 14px–16px — elementos relacionados
gap: 20px–24px — grupos de elementos
gap: 28px–32px — columnas de contenido
gap: 40px–48px — secciones y columnas principales
gap: 80px   — separación entre bloques grandes
```

### Max-widths de contenedores

```
1240px — container estándar (max-width, centrado con margin: 0 auto)
720px  — contenido del hero
480px–560px — párrafos de descripción
480px  — modal de checkout
```

---

## Breakpoints

```
900px — único breakpoint (mobile/tablet vs desktop)
```

### Comportamiento mobile (<900px)

- Nav links y botón "Comprar ahora" se ocultan → aparece hamburger
- Grillas de 3–4 columnas pasan a 1 columna, grillas de 2 columnas pasan a 1
- Grillas de 4 columnas tipo footer pasan a 2 columnas
- Padding horizontal: 20px–24px
- Hero: `min-height: 90vh`, background-position centrada

---

## Border & Dividers

```
border: 1px solid #2a2a2a          — bordes sobre fondos oscuros (nav, footer)
border: 1px solid rgba(26,26,26,0.15) — divisores sobre fondos claros
border: 1px solid rgba(255,255,255,0.1) — divisores sobre fondos oscuros
```

Sin `border-radius` — estética sharp corners en todo.

---

## Shadows

```
box-shadow: 0 4px 16px rgba(0,0,0,0.3)  — botón flotante WhatsApp
box-shadow: 0 6px 20px rgba(0,0,0,0.3)  — elementos flotantes más prominentes
```

---

## Z-index Stack

```
50   — Nav sticky
90   — Botón flotante WhatsApp
100  — Overlay del cart drawer
101  — Cart drawer
200  — Modal de checkout
```

---

## Components

### Button — CTA primario (rojo)

```
background: RED (#C0171E)
color: PAPER (#FAFAF8)
padding: 18px 32px
font-family: JetBrains Mono
font-size: 12px
letter-spacing: 0.15em
text-transform: uppercase
display: inline-flex; align-items: center; gap: 10px
no border-radius
```

### Button — secundario (ink)

```
background: INK (#1A1A1A)
color: PAPER
padding: 10px–14px 14px–28px
font-family: JetBrains Mono
font-size: 11px
letter-spacing: 0.12em–0.15em
text-transform: uppercase
```

### Button — ghost (sobre fondo oscuro)

```
background: rgba(255,255,255,0.08)
color: PAPER
border: 1px solid rgba(255,255,255,0.3)
padding: 18px 32px
font-family: JetBrains Mono
font-size: 12px
letter-spacing: 0.15em
text-transform: uppercase
```

### Button — link subrayado

```
color: INK
font-family: JetBrains Mono
font-size: 11px
letter-spacing: 0.15em
text-transform: uppercase
border-bottom: 1px solid INK
padding-bottom: 2px
text-decoration: none
```

Texto siempre termina en "→"

### Product Card

```
background: PAPER
aspect-ratio de imagen: 1 (cuadrado) o 4/3 (recetas)
hover: transform: scale(1.04) en la imagen, transition: 0.4s
tag: JetBrains Mono 9px, letter-spacing 0.2em, RED, uppercase
name: Fraunces 18px, weight 500
price: Fraunces 22px, weight 500
divider entre precio y contenido: 1px solid rgba(26,26,26,0.15)
```

### Recipe Card

```
background: PAPER_2
image: aspect-ratio 4/3
category tag: overlay en top-left, background INK, color PAPER, JetBrains Mono 9px
product tag: JetBrains Mono 9px, RED, uppercase
title: Fraunces 18px, weight 500
desc: Manrope 13px, color #666, line-height 1.5
link: "Ver receta →" underline style
```

### Cart Drawer

```
width: min(420px, 100vw)
position: fixed right 0, top 0, bottom 0
header: background INK, "TU BOLSA" en Anton 20px
qty controls: 22px × 22px, background PAPER_2
total: JetBrains Mono label + Fraunces 26px price
checkout button: full-width, RED, JetBrains Mono
```

### Nav

```
background: INK
padding: 20px 40px (desktop), 16px 20px (mobile)
logo: Anton 32px "HARDY" + JetBrains Mono 9px "ALIMENTÁ TU INSTINTO" en RED
links: JetBrains Mono 12px, letter-spacing 0.12em, uppercase, opacity 0.75 (1.0 en hover/active)
active: border-bottom 1px solid RED
position: sticky, top 0, z-index 50
```

### Announcement Bar (sobre Nav)

```
background: INK
color: PAPER
font-family: JetBrains Mono
font-size: 11px
letter-spacing: 0.2em
text-align: center
padding: 10px 16px
text-transform: uppercase
```

### WhatsApp Floating Button

```
position: fixed, bottom 24px, right 24px
width/height: 56px, border-radius: 50%
background: #25D366
z-index: 90
box-shadow: 0 4px 16px rgba(0,0,0,0.3)
icon: MessageCircle, size 24, fill #fff, strokeWidth 0
```

### Pillar / Feature Bar

```
border-top + border-bottom: 1px solid rgba(26,26,26,0.15)
4 columnas con border-left y border-right entre ellas
padding: 28px 32px por columna
ícono: 8px × 8px cuadrado RED
label: Manrope 14px, weight 700
sublabel: 12px, color #666
```

---

## Layout Patterns

### Grillas de contenido

```
4 columnas: grid-template-columns: repeat(4, 1fr); gap: 2px
3 columnas: grid-template-columns: repeat(3, 1fr); gap: 2px
2 columnas: grid-template-columns: 1fr 1fr; gap: 80px
Footer:     grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px
```

El `gap: 2px` en las grillas de tarjetas crea líneas visibles entre cards — es intencional (simula separadores de grilla).

### Hero

```
min-height: 100vh
background-image: hero photo
overlay: linear-gradient(to right, rgba(15,15,15,0.95) 0%, rgba(15,15,15,0.82) 30%, rgba(15,15,15,0.45) 60%, rgba(15,15,15,0) 100%)
radial glow (top-right): radial-gradient(circle, rgba(192,23,30,0.12) 0%, transparent 65%)
hero inner: max-width 720px, padding 0 64px, position relative z-index 2
```

---

## Tailwind v4 Theme Configuration

En `globals.css`, el bloque `@theme inline` define las clases de Tailwind:

```css
@theme inline {
  /* Colors — uso: bg-red, text-ink, bg-paper, etc. */
  --color-red:     #C0171E;
  --color-ink:     #1A1A1A;
  --color-paper:   #FAFAF8;
  --color-paper-2: #F1EFE9;

  /* Typography — uso: font-display, font-heading, font-mono, font-body */
  --font-display:  var(--font-anton);
  --font-heading:  var(--font-fraunces);
  --font-mono:     var(--font-jetbrains-mono);
  --font-body:     var(--font-manrope);

  /* Breakpoints — uso: md:* aplica a partir de 900px */
  --breakpoint-md: 900px;
}
```

### Clases Tailwind más usadas en Hardy

```
bg-ink text-paper         — nav, footer, secciones oscuras
bg-paper text-ink         — secciones claras principales  
bg-paper-2                — secciones alternadas, cards de receta
text-red                  — labels, tags, eyebrows, énfasis
font-display              — logo HARDY
font-heading              — headings h1, h2, h3
font-mono                 — labels, CTAs, tags, announcement
font-body                 — párrafos, descripciones
tracking-widest           — letter-spacing para labels mono
uppercase                 — todos los labels y CTAs
```

---

## Image Assets

Organizados en `/public/`:

```
/products/
  natural-380-front.png   — producto de frente
  natural-380-open.png    — producto abierto (lifestyle)
  crunchy-380-front.png
  crunchy-380-open.png
  miel-liquida-front.png
  miel-liquida-open.png
  miel-solida-front.png
  miel-solida-open.png
  balde-45.png
  balde-23.png

/lifestyle/
  hero-duo-v2.png         — imagen del hero principal
  use-desayuno.png        — use case desayuno
  use-fit.png             — use case fitness
  use-miel.png            — use case miel/sabor
  balde-45-open.png
  balde-23-open.png
  receta-tostadas.png
  receta-bowl.png
  receta-miel.png
```

---

## Copy Guidelines

- **Tono**: Directo, corto, sin adjetivos inflados. "Un ingrediente. Nada más." > "El producto más increíble del mercado"
- **Headings**: Siempre con `<em style={{ fontStyle: 'italic', color: 'RED' }}>` para la palabra clave al final
- **Eyebrow labels**: Siempre empiezan con `──` (doble guión em)
- **CTAs**: Siempre terminan en `→` (flecha Unicode)
- **Idioma**: Español argentino (vos, tuteo)
