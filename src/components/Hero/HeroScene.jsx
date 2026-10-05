'use client'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Lightformer } from '@react-three/drei'
import {
  ShapeGeometry,
  AlwaysStencilFunc,
  EqualStencilFunc,
  ReplaceStencilOp,
  KeepStencilOp,
  DoubleSide,
  MathUtils,
} from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { ART } from './HeroArt'
import { WORD_PATHS } from './heroWordPaths'
import styles from './Hero.module.css'

const PAPER = '#f0ece4'
const INK = '#0d0d0d'
const deg = MathUtils.degToRad
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Monolithes 3D (meshes X et Y de XY.glb) : hauteur visée en unités du viewBox (celle des formes de la
// maquette), étirement horizontal (les lettres du glb sont plus étroites que les barres de la maquette),
// inclinaison en 3D pour montrer l'épaisseur.
const MONO = {
  x: { node: 'X', height: 466, stretch: 1.6, tilt: [0.22, -0.3] },
  y: { node: 'Y', height: 497, stretch: 1.6, tilt: [0.2, 0.3] },
}
const MONO_Z = 90
// Forme des monolithes. 'bars' : les barres de la maquette (rects de ART) en volumes ; se lit
// nettement comme X et Y et couvre tout l'écran au zoom. 'glb' : les lettres X et Y de XY.glb
// (police condensée, en sablier vue de face ; laisse des pans visibles pendant le zoom).
const SHAPE = 'bars'
const BAR_DEPTH = 64

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

function MonolithMaterial() {
  return (
    <meshPhysicalMaterial
      color={INK}
      roughness={0.25}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.12}
      envMapIntensity={1}
      stencilWrite
      stencilRef={1}
      stencilFunc={AlwaysStencilFunc}
      stencilZPass={ReplaceStencilOp}
    />
  )
}

// Barres de la maquette : chaque rect (x, y, w, h en y vers le bas) tourné de r autour du centre du monolithe
function Bars({ parts, groupRef, tiltRef, tilt }) {
  return (
    <group ref={groupRef}>
      <group ref={tiltRef} rotation={[tilt[0], tilt[1], 0]}>
        {parts.map(({ rect: [x, y, w, h], r }, i) => (
          <group key={i} rotation={[0, 0, deg(-r)]}>
            {/* léger décalage en z : les barres qui se croisent ne se disputent pas la même face */}
            <mesh position={[x + w / 2, -(y + h / 2), i * 0.6]} castShadow renderOrder={1}>
              <boxGeometry args={[w, h, BAR_DEPTH]} />
              <MonolithMaterial />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function Monolith({ geometry, mono, groupRef, tiltRef }) {
  // Lettre centrée sur son origine, debout face à la caméra, à la hauteur visée
  const { offset, scale } = useMemo(() => {
    geometry.computeBoundingBox()
    const { min, max } = geometry.boundingBox
    const s = mono.height / (max.z - min.z)
    return {
      offset: [-(min.x + max.x) / 2, -(min.y + max.y) / 2, -(min.z + max.z) / 2],
      scale: [s * mono.stretch, s, s],
    }
  }, [geometry, mono])

  return (
    <group ref={groupRef}>
      <group ref={tiltRef} rotation={[mono.tilt[0], mono.tilt[1], 0]}>
        <group scale={scale}>
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={geometry} position={offset} castShadow renderOrder={1}>
              <MonolithMaterial />
            </mesh>
          </group>
        </group>
      </group>
    </group>
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
        const e = ease(clamp(p / 0.5))
        const s = 1 + (cfg.smax - 1) * e
        if (xRef.current) {
          xRef.current.position.set(cfg.x.tx, -cfg.x.ty, MONO_Z)
          // SVG rotate(-5) (y vers le bas) = +5° dans la scène (y vers le haut)
          xRef.current.rotation.z = deg(-cfg.x.rot) * (1 - e)
          xRef.current.scale.setScalar(s)
        }
        // Le X revient face caméra en grossissant : ses faces latérales ne deviennent pas des plans géants
        if (xTiltRef.current) xTiltRef.current.rotation.set(MONO.x.tilt[0] * (1 - e), MONO.x.tilt[1] * (1 - e), 0)
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
  }, [apiRef, progressRef, cfg, invalidate])

  // Prête : deux images plus tard, le premier rendu est à l'écran → on masque le repli SVG
  useEffect(() => {
    let raf2
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(onReady) })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [onReady])

  const frontList = useMemo(() => cfg.lines.flatMap((line, l) => line.front.map((i) => ({ l, i }))), [cfg])

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[-700, 900, 1400]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={14}
        shadow-blurSamples={16}
        shadow-camera-left={-2200}
        shadow-camera-right={2200}
        shadow-camera-top={2200}
        shadow-camera-bottom={-2200}
        shadow-camera-near={1}
        shadow-camera-far={6000}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[-4, 4, 6]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[5, -1, 4]} rotation-y={-Math.PI / 4} scale={[6, 1, 1]} />
        <Lightformer form="rect" intensity={1} position={[0, 0, -8]} scale={[12, 12, 1]} />
      </Environment>

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
        {SHAPE === 'bars' ? (
          <>
            <Bars parts={cfg.x.r.map((r) => ({ rect: cfg.x.rect, r }))} groupRef={xRef} tiltRef={xTiltRef} tilt={MONO.x.tilt} />
            <Bars parts={cfg.y.parts} groupRef={yRef} tilt={MONO.y.tilt} />
          </>
        ) : (
          <>
            <Monolith geometry={nodes[MONO.x.node].geometry} mono={MONO.x} groupRef={xRef} tiltRef={xTiltRef} />
            <Monolith geometry={nodes[MONO.y.node].geometry} mono={MONO.y} groupRef={yRef} />
          </>
        )}

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

export default function HeroScene({ apiRef, progressRef, onReady }) {
  // Sans WebGL 2, rien n'est rendu : le SVG du hero reste affiché
  const [supported] = useState(() => !!document.createElement('canvas').getContext('webgl2'))
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
