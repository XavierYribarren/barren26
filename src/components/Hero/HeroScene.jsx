'use client'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { ShapeGeometry, EqualStencilFunc, KeepStencilOp, DoubleSide } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { ART } from './HeroArt'
import { WORD_PATHS } from './heroWordPaths'
import {
  INK, PAPER, deg, clamp, ease, MONO, coverScale, anchorOffset, fitGlyph, Monolith, SceneLights,
} from '../Monolith/monolith3d'
import styles from './Hero.module.css'

const MONO_Z = 90
// Sur mobile, monolithes plus fins : étirés ×1,15 au lieu de ×1,6 (relatif : 0,72)
const MOBILE_SX = 0.72

// Hauteur d'une forme de la maquette : rects (x, y, w, h) tournés de r degrés autour du centre
function shapeHeight(parts) {
  let min = Infinity
  let max = -Infinity
  for (const { rect: [x, y, w, h], r } of parts) {
    const c = Math.cos(deg(r))
    const sn = Math.sin(deg(r))
    for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
      const ry = px * sn + py * c
      min = Math.min(min, ry)
      max = Math.max(max, ry)
    }
  }
  return max - min
}

// Lettres de BARREN en géométries planes, à partir des contours générés (heroWordPaths)
function letterGeometries(v) {
  const loader = new SVGLoader()
  return WORD_PATHS[v].map((line) =>
    line.map((d) => {
      const { paths } = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`)
      const geometry = new ShapeGeometry(paths.flatMap((p) => SVGLoader.createShapes(p)))
      geometry.scale(1, -1, 1) // SVG : y vers le bas ; scène : y vers le haut (faces retournées → DoubleSide)
      return geometry
    }))
}

// Copie couleur papier : ne s'affiche que là où un monolithe a écrit le stencil
function NegativeMaterial({ materialRef, opacity = 1 }) {
  return (
    <meshBasicMaterial
      ref={materialRef}
      color={PAPER}
      side={DoubleSide}
      toneMapped={false}
      transparent
      opacity={opacity}
      depthTest={false}
      depthWrite={false}
      stencilWrite
      stencilRef={1}
      stencilFunc={EqualStencilFunc}
      stencilZPass={KeepStencilOp}
    />
  )
}

function Scene({ apiRef, progressRef, onReady }) {
  const { nodes } = useGLTF('/XY.glb')
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)

  const v = size.width <= 768 ? 'm' : 'd'
  const cfg = ART[v]
  const [vbW, vbH] = cfg.viewBox
  // Même cadrage que le SVG (preserveAspectRatio="xMidYMid meet")
  const k = Math.min(size.width / vbW, size.height / vbH)
  const ox = (size.width - vbW * k) / 2
  const oy = (size.height - vbH * k) / 2

  const letters = useMemo(() => letterGeometries(v), [v])
  const xHeight = useMemo(() => shapeHeight(cfg.x.r.map((r) => ({ rect: cfg.x.rect, r }))), [cfg])
  const sx = v === 'm' ? MOBILE_SX : 1
  const xFit = useMemo(() => fitGlyph(nodes[MONO.x.node].geometry, xHeight, MONO.x.stretch * sx),
    [nodes, xHeight, sx])
  // Échelle finale : de quoi couvrir tout l'écran (en unités du viewBox), quelle que soit sa taille
  const xScaleMax = coverScale(size.width / k / 2, size.height / k / 2, xHeight, sx)
  const yFit = useMemo(() => fitGlyph(nodes[MONO.y.node].geometry,
    shapeHeight(cfg.y.parts), MONO.y.stretch * sx), [nodes, cfg, sx])
  useEffect(() => () => letters.flat().forEach((g) => g.dispose()), [letters])

  const xRef = useRef(null)
  const yRef = useRef(null)
  const xTiltRef = useRef(null)
  const shadowRef = useRef(null)
  const fronts = useRef([])
  const negs = useRef([])

  // Valeurs reprises de docs-mockup/direction-A-transition.html, transposées en 3D
  useLayoutEffect(() => {
    apiRef.current = {
      update(p) {
        if (xRef.current) {
          // Plus rapide que la maquette (p ∈ [0, .4] au lieu de [0, .5]) : l'écran est entièrement couvert
          // dès p ≈ .3, quand le fond noir commence à monter
          const ex = ease(clamp(p / 0.4))
          const s = 1 + (xScaleMax - 1) * ex
          // SVG rotate(-5) (y vers le bas) = +5° dans la scène (y vers le haut), qui revient à 0
          const theta = deg(-cfg.x.rot) * (1 - ex)
          // Le point plein du X (X_COVER) glisse vers le centre de l'écran (un peu en avance sur le zoom)
          const ec = ease(clamp(p / 0.35))
          const [a0x, a0y] = anchorOffset(xHeight, deg(-cfg.x.rot), sx)
          const px = cfg.x.tx + a0x + (vbW / 2 - (cfg.x.tx + a0x)) * ec
          const py = -cfg.x.ty + a0y + (-vbH / 2 - (-cfg.x.ty + a0y)) * ec
          const [ax, ay] = anchorOffset(xHeight * s, theta, sx)
          xRef.current.position.set(px - ax, py - ay, MONO_Z)
          xRef.current.rotation.z = theta
          xRef.current.scale.setScalar(s)
        }
        // Le X se redresse face caméra dès le début du scroll : agrandies, ses faces latérales
        // deviendraient des pans clairs géants
        const untilt = 1 - ease(clamp(p / 0.15))
        if (xTiltRef.current) xTiltRef.current.rotation.set(MONO.x.tilt[0] * untilt, MONO.x.tilt[1] * untilt, 0)
        if (yRef.current) {
          const sy = Math.max(0.0001, 1 - clamp(p / 0.28))
          yRef.current.position.set(cfg.y.tx + 260 * (1 - sy), -cfg.y.ty, MONO_Z)
          yRef.current.rotation.z = deg(-cfg.y.rot)
          yRef.current.scale.setScalar(sy)
        }
        const negOpacity = clamp((p - 0.06) / 0.22) * (1 - clamp((p - 0.44) / 0.1))
        negs.current.forEach((m) => { if (m) m.opacity = negOpacity })
        const frontOpacity = 1 - clamp((p - 0.44) / 0.1)
        fronts.current.forEach((m) => { if (m) m.opacity = frontOpacity })
        // L'ombre n'a plus de papier où tomber une fois le fond noir monté
        if (shadowRef.current) shadowRef.current.visible = p < 0.5
        invalidate()
      },
    }
    apiRef.current.update(progressRef.current)
  }, [apiRef, progressRef, cfg, xHeight, xScaleMax, sx, vbW, vbH, invalidate])

  // Prête : deux images plus tard, le premier rendu est à l'écran → on masque le repli SVG
  useEffect(() => {
    let raf2
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(onReady) })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [onReady])

  const frontList = useMemo(() => cfg.lines.flatMap((line, l) => line.front.map((i) => ({ l, i }))), [cfg])

  return (
    <>
      <SceneLights />

      {/* Repère du viewBox : origine en haut à gauche du cadre, y vers le haut, unités du viewBox */}
      <group position={[ox - size.width / 2, size.height / 2 - oy, 0]} scale={k}>
        {/* Ombre portée sur le papier (plan transparent derrière le mot) */}
        <mesh ref={shadowRef} position={[vbW / 2, -vbH / 2, -60]} receiveShadow>
          <planeGeometry args={[vbW * 3, vbH * 3]} />
          <shadowMaterial transparent opacity={0.34} />
        </mesh>

        {/* 1. le mot */}
        {letters.flat().map((g, i) => (
          <mesh key={`w${i}`} geometry={g} renderOrder={0}>
            <meshBasicMaterial color={INK} side={DoubleSide} toneMapped={false} />
          </mesh>
        ))}

        {/* 2. les monolithes : cachent les lettres « derrière » et écrivent le stencil */}
        <Monolith geometry={nodes[MONO.x.node].geometry} fit={xFit} mono={MONO.x} groupRef={xRef} tiltRef={xTiltRef} />
        <Monolith geometry={nodes[MONO.y.node].geometry} fit={yFit} mono={MONO.y} groupRef={yRef} />

        {/* 3. lettres « devant » en négatif, puis tout le mot en négatif (transition) */}
        {frontList.map(({ l, i }, idx) => (
          <mesh key={`f${l}-${i}`} geometry={letters[l][i]} renderOrder={2}>
            <NegativeMaterial materialRef={(m) => { fronts.current[idx] = m }} />
          </mesh>
        ))}
        {letters.flat().map((g, idx) => (
          <mesh key={`n${idx}`} geometry={g} renderOrder={3}>
            <NegativeMaterial materialRef={(m) => { negs.current[idx] = m }} opacity={0} />
          </mesh>
        ))}
      </group>
    </>
  )
}

export default function HeroScene({ apiRef, progressRef, onReady, onFallback }) {
  // Sans WebGL 2, rien n'est rendu : le hero passe au repli SVG
  const [supported] = useState(() => !!document.createElement('canvas').getContext('webgl2'))
  useEffect(() => {
    if (!supported) onFallback()
  }, [supported, onFallback])
  if (!supported) return null

  return (
    <div className={styles.scene} aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 3000], near: 1, far: 10000, zoom: 1 }}
        flat
        shadows="variance"
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ alpha: true, stencil: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene apiRef={apiRef} progressRef={progressRef} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/XY.glb')
