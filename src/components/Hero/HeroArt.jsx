'use client'
import styles from './Hero.module.css'

// Géométrie reprise telle quelle de docs-mockup/direction-A-monolithe.html.
// X : deux barres croisées. Y : une tige et deux bras. Les identifiants servent à la transition (HeroStage).
export const ART = {
  d: {
    viewBox: [1440, 900],
    fontSize: 302,
    lines: [{ x: 18.86, y: 565, letters: 'BARREN', front: [2, 5] }],
    blur: 22,
    shadow: [40, 52],
    thickness: [12, 10],
    smax: 14,
    x: { tx: 505, ty: 468, rot: -5, rect: [-66, -240, 132, 480], r: [36, -36] },
    y: {
      tx: 1212, ty: 452, rot: 4,
      parts: [
        { rect: [-66, -20, 132, 270], r: 0 },
        { rect: [-66, -250, 132, 276], r: 32 },
        { rect: [-66, -250, 132, 276], r: -32 },
      ],
    },
  },
  m: {
    viewBox: [390, 844],
    fontSize: 156,
    lines: [
      { x: 11.08, y: 292, letters: 'BAR', front: [] },
      { x: 11.08, y: 416, letters: 'REN', front: [1, 2] },
    ],
    blur: 12,
    shadow: [24, 32],
    thickness: [8, 7],
    smax: 12,
    x: { tx: 104, ty: 486, rot: -5, rect: [-36, -130, 72, 260], r: [36, -36] },
    y: {
      tx: 292, ty: 500, rot: 4,
      parts: [
        { rect: [-36, -10, 72, 150], r: 0 },
        { rect: [-36, -140, 72, 156], r: 32 },
        { rect: [-36, -140, 72, 156], r: -32 },
      ],
    },
  },
}

export const xId = (v, i) => `hero-x${v}${i}`
export const yId = (v, i) => `hero-y${v}${i}`

const PAPER = '#f0ece4'
const INK = '#0d0d0d'

function Word({ cfg, fill }) {
  return cfg.lines.map((line) => (
    <text
      key={line.y}
      x={line.x}
      y={line.y}
      fontFamily="'Archivo Black', sans-serif"
      fontSize={cfg.fontSize}
      style={{ fontKerning: 'none' }}
    >
      {[...line.letters].map((letter, i) => (
        <tspan key={i} fill={fill(line, i)}>{letter}</tspan>
      ))}
    </text>
  ))
}

function Shapes({ v, cfg }) {
  const ids = [0, 1].map((i) => xId(v, i)).concat(cfg.y.parts.map((_, i) => yId(v, i)))
  return ids.map((id) => <use key={id} href={`#${id}`} />)
}

function Variant({ v }) {
  const cfg = ART[v]
  const [w, h] = cfg.viewBox
  const { x, y } = cfg
  return (
    <svg
      className={`${styles.art} ${v === 'd' ? styles.artD : styles.artM}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {x.r.map((r, i) => (
          <rect
            key={i}
            id={xId(v, i)}
            x={x.rect[0]} y={x.rect[1]} width={x.rect[2]} height={x.rect[3]}
            transform={`translate(${x.tx} ${x.ty}) rotate(${x.rot}) rotate(${r})`}
          />
        ))}
        {y.parts.map((part, i) => (
          <rect
            key={i}
            id={yId(v, i)}
            x={part.rect[0]} y={part.rect[1]} width={part.rect[2]} height={part.rect[3]}
            transform={`translate(${y.tx} ${y.ty}) rotate(${y.rot}) rotate(${part.r})`}
          />
        ))}
        <clipPath id={`hero-clip-${v}`}><Shapes v={v} cfg={cfg} /></clipPath>
        <filter id={`hero-blur-${v}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={cfg.blur} />
        </filter>
        <linearGradient id={`hero-face-${v}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#232323" />
          <stop offset=".45" stopColor={INK} />
          <stop offset="1" stopColor="#030303" />
        </linearGradient>
        <linearGradient id={`hero-gloss-${v}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={h}>
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".02" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. le mot, derrière tout */}
      <g fill={INK}><Word cfg={cfg} fill={() => INK} /></g>
      {/* 2. ombre portée sur le papier */}
      <g filter={`url(#hero-blur-${v})`} opacity=".34" transform={`translate(${cfg.shadow[0]} ${cfg.shadow[1]})`} fill="#000">
        <Shapes v={v} cfg={cfg} />
      </g>
      {/* 3. épaisseur du monolithe */}
      <g fill="#1b1b1b" transform={`translate(${cfg.thickness[0]} ${cfg.thickness[1]})`}><Shapes v={v} cfg={cfg} /></g>
      <g fill="none" stroke="#4a4a46" strokeWidth="3"><Shapes v={v} cfg={cfg} /></g>
      {/* 4. face avant : cache les lettres « derrière » */}
      <g fill={`url(#hero-face-${v})`}><Shapes v={v} cfg={cfg} /></g>
      <rect width={w} height={h} fill={`url(#hero-gloss-${v})`} clipPath={`url(#hero-clip-${v})`} />
      {/* 5. lettres « devant » : en négatif là où le monolithe les recouvre */}
      <g data-hero-neg-front clipPath={`url(#hero-clip-${v})`}>
        <Word cfg={cfg} fill={(line, i) => (line.front.includes(i) ? PAPER : 'none')} />
      </g>
      {/* 6. tout le mot en négatif, révélé par la transition au scroll */}
      <g data-hero-neg-all clipPath={`url(#hero-clip-${v})`} style={{ opacity: 0 }}>
        <Word cfg={cfg} fill={() => PAPER} />
      </g>
    </svg>
  )
}

export default function HeroArt() {
  return (
    <>
      <Variant v="d" />
      <Variant v="m" />
    </>
  )
}
