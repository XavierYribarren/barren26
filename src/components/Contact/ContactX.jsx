'use client'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MONO, X_ZOOM_ANCHOR, fitGlyph, Monolith, SceneLights, clamp, deg, ease } from '../Monolith/monolith3d'
import styles from './Contact.module.css'

// Retour du X : le geste inverse du hero. En entrant, la section est noire (fond floodRef) et le X géant ;
// il rétrécit jusqu'à sa place à côté du titre pendant que le noir s'efface et découvre le papier.
const SCALE_START = 26
const ROTATION = 5

function Scene({ slotRef, apiRef, progressRef, onReady }) {
  const { nodes } = useGLTF('/XY.glb')
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const xRef = useRef(null)
  const tiltRef = useRef(null)
  const shadowRef = useRef(null)

  // Lettre posée pour une hauteur de 1 : la hauteur réelle vient de la réservation dans le DOM
  const unit = useMemo(() => fitGlyph(nodes[MONO.x.node].geometry, 1, MONO.x.stretch), [nodes])

  useLayoutEffect(() => {
    apiRef.current = {
      update(q) {
        const canvas = gl.domElement.getBoundingClientRect()
        const slot = slotRef.current?.getBoundingClientRect()
        if (!slot || !xRef.current) return
        const h = slot.height
        const cx = slot.left - canvas.left + slot.width / 2 - size.width / 2
        const cy = size.height / 2 - (slot.top - canvas.top + slot.height / 2)
        const s = 1 + (SCALE_START - 1) * (1 - ease(q))
        // Pivot sur un point plein de la dalle gauche (voir X_ZOOM_ANCHOR) : la fente ne passe jamais à l'écran
        xRef.current.position.set(cx + (1 - s) * X_ZOOM_ANCHOR * unit.width * h, cy, 0)
        xRef.current.rotation.z = deg(ROTATION)
        xRef.current.scale.setScalar(h * s)
        // L'inclinaison (épaisseur visible) n'arrive qu'en fin de course, une fois le X à taille normale
        const t = clamp((q - 0.8) / 0.2)
        tiltRef.current?.rotation.set(MONO.x.tilt[0] * t, MONO.x.tilt[1] * t, 0)
        if (shadowRef.current) {
          shadowRef.current.visible = q > 0.5
          // Distance au plan proportionnelle au X : l'ombre garde le même décalage relatif à toutes les tailles
          shadowRef.current.position.z = -0.35 * h
        }
        invalidate()
      },
    }
    apiRef.current.update(progressRef.current)
  }, [apiRef, progressRef, slotRef, gl, size, unit, invalidate])

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
      <Monolith geometry={nodes[MONO.x.node].geometry} fit={unit} mono={MONO.x} groupRef={xRef} tiltRef={tiltRef} />
    </>
  )
}

const floodOpacity = (q) => 1 - clamp((q - 0.45) / 0.4)

export default function ContactX({ sectionRef, slotRef, floodRef, onReady }) {
  // Sans WebGL 2, rien n'est rendu : la section reste sur papier, sans le X
  const [supported] = useState(() => !!document.createElement('canvas').getContext('webgl2'))
  const apiRef = useRef(null)
  const progressRef = useRef(0)

  useEffect(() => {
    if (!supported) return
    // Sans animation : le X directement à sa place
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
          <Scene slotRef={slotRef} apiRef={apiRef} progressRef={progressRef} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
