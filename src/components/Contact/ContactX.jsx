'use client'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  MONO, coverScale, anchorOffset, fitGlyph, Monolith, SceneLights, clamp, deg, ease,
} from '../Monolith/monolith3d'
import styles from './Contact.module.css'

// Retour du X et du Y : le geste inverse du hero. En entrant, la section est noire (fond floodRef) et le X
// la couvre entièrement ; il rétrécit jusqu'à sa place à côté du titre pendant que le noir s'efface et
// découvre le papier. Le Y arrive ensuite depuis la droite, comme il était parti dans le hero.
const X_ROT = 5
const Y_ROT = -4

const floodOpacity = (q) => 1 - clamp((q - 0.45) / 0.4)

// Centre d'un emplacement du DOM, en coordonnées de la scène (origine au centre du canvas, y vers le haut)
function slotCenter(el, canvas, size) {
  const r = el.getBoundingClientRect()
  return {
    x: r.left - canvas.left + r.width / 2 - size.width / 2,
    y: size.height / 2 - (r.top - canvas.top + r.height / 2),
    h: r.height,
  }
}

function Scene({ xSlotRef, ySlotRef, apiRef, progressRef, onReady }) {
  const { nodes } = useGLTF('/XY.glb')
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const xRef = useRef(null)
  const xTiltRef = useRef(null)
  const yRef = useRef(null)
  const yTiltRef = useRef(null)
  const shadowRef = useRef(null)

  // Lettres posées pour une hauteur de 1 : la hauteur réelle vient des emplacements du DOM
  const xUnit = useMemo(() => fitGlyph(nodes[MONO.x.node].geometry, 1, MONO.x.stretch), [nodes])
  const yUnit = useMemo(() => fitGlyph(nodes[MONO.y.node].geometry, 1, MONO.y.stretch), [nodes])

  useLayoutEffect(() => {
    apiRef.current = {
      update(q) {
        const canvas = gl.domElement.getBoundingClientRect()
        if (!xSlotRef.current || !ySlotRef.current || !xRef.current) return
        const X = slotCenter(xSlotRef.current, canvas, size)
        const Y = slotCenter(ySlotRef.current, canvas, size)

        // X : de « couvre tout le canvas » (q = 0) à sa place (q = 1) ; son point plein (X_COVER) glisse
        // du centre du canvas vers sa position finale
        const e = ease(q)
        const sStart = coverScale(size.width / 2, size.height / 2, X.h)
        const s = 1 + (sStart - 1) * (1 - e)
        const theta = deg(X_ROT) * e
        const [f0x, f0y] = anchorOffset(X.h, deg(X_ROT))
        const px = (X.x + f0x) * e
        const py = (X.y + f0y) * e
        const [ax, ay] = anchorOffset(X.h * s, theta)
        xRef.current.position.set(px - ax, py - ay, 0)
        xRef.current.rotation.z = theta
        xRef.current.scale.setScalar(X.h * s)

        // Y : arrive depuis la droite en grandissant, en fin de course (inverse du hero)
        const sy = Math.max(0.0001, ease(clamp((q - 0.55) / 0.45)))
        if (yRef.current) {
          yRef.current.position.set(Y.x + 0.55 * Y.h * (1 - sy), Y.y, 0)
          yRef.current.rotation.z = deg(Y_ROT)
          yRef.current.scale.setScalar(Y.h * sy)
        }

        // Inclinaison (épaisseur visible) seulement en fin de course, une fois les lettres à leur taille
        const t = clamp((q - 0.8) / 0.2)
        xTiltRef.current?.rotation.set(MONO.x.tilt[0] * t, MONO.x.tilt[1] * t, 0)
        yTiltRef.current?.rotation.set(MONO.y.tilt[0] * t, MONO.y.tilt[1] * t, 0)

        if (shadowRef.current) {
          shadowRef.current.visible = q > 0.5
          // Distance au plan proportionnelle aux lettres : même décalage relatif à toutes les tailles
          shadowRef.current.position.z = -0.35 * X.h
        }
        invalidate()
      },
    }
    apiRef.current.update(progressRef.current)
  }, [apiRef, progressRef, xSlotRef, ySlotRef, gl, size, invalidate])

  useEffect(() => {
    let raf2
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(onReady) })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [onReady])

  return (
    <>
      <SceneLights />
      <mesh ref={shadowRef} position={[0, 0, -200]} receiveShadow>
        <planeGeometry args={[size.width * 2, size.height * 2]} />
        <shadowMaterial transparent opacity={0.34} />
      </mesh>
      <Monolith geometry={nodes[MONO.x.node].geometry} fit={xUnit} mono={MONO.x} groupRef={xRef} tiltRef={xTiltRef} />
      <Monolith geometry={nodes[MONO.y.node].geometry} fit={yUnit} mono={MONO.y} groupRef={yRef} tiltRef={yTiltRef} />
    </>
  )
}

export default function ContactX({ sectionRef, xSlotRef, ySlotRef, floodRef, onReady }) {
  // Sans WebGL 2, rien n'est rendu : la section reste sur papier, sans les lettres
  const [supported] = useState(() => !!document.createElement('canvas').getContext('webgl2'))
  const apiRef = useRef(null)
  const progressRef = useRef(0)

  useEffect(() => {
    if (!supported) return
    // Sans animation : X et Y directement à leur place
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progressRef.current = 1
      apiRef.current?.update(1)
      return
    }
    const flood = floodRef.current
    const apply = (q) => {
      progressRef.current = q
      apiRef.current?.update(q)
      if (flood) flood.style.opacity = floodOpacity(q)
    }
    gsap.registerPlugin(ScrollTrigger)
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'top 15%',
      invalidateOnRefresh: true,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(st.progress)
    return () => {
      st.kill()
      if (flood) flood.style.opacity = ''
    }
  }, [supported, sectionRef, floodRef])

  if (!supported) return null

  return (
    <div className={styles.xCanvas} aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 3000], near: 1, far: 10000, zoom: 1 }}
        flat
        shadows="variance"
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene xSlotRef={xSlotRef} ySlotRef={ySlotRef} apiRef={apiRef} progressRef={progressRef} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
