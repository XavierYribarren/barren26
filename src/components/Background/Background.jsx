'use client'
import { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Model } from './XY'
import styles from './Background.module.css'
import { Stage } from '@react-three/drei'

function XYModel({ scroll }) {
  const groupRef = useRef()
  const smooth = useRef(0)

  useFrame(() => {
    smooth.current += (scroll.current - smooth.current) * 0.05
    if (groupRef.current) {
      // groupRef.current.rotation.x = smooth.current * 0.8
      // groupRef.current.rotation.y = smooth.current * 1.5
    }
  })

  return (
    <group ref={groupRef}>
      <Model scroll={scroll} />
    </group>
  )
}

export default function Background() {
  const scroll = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scroll.current = window.scrollY / (document.body.scrollHeight - window.innerHeight)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
    <div className={styles.overlay} />
    <div className={styles.bg}>
      <Canvas
        camera={{ position: [0, 0, 18], fov: 55 }}
        gl={{ alpha: true, antialias: false }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)}
      >
       
        <ambientLight intensity={10}/>
        <directionalLight intensity={10}/>
        {/* <Backdrop scale={40} position={[0,-5,0]}
  floor={0.25} // Stretches the floor segment, 0.25 by default
  segments={20} // Mesh-resolution, 20 by default
>
  <meshStandardMaterial color="#353540" />
</Backdrop> */}

<mesh position={[0,0,-20]}>
  <planeGeometry args={[100,50]}/>
  <meshStandardMaterial color={"#111"}/>
</mesh>
        <Suspense fallback={null}>
          <Stage adjustCamera intensity={0.5} shadows="contact" environment="city">
            <XYModel scroll={scroll} />
          </Stage>
        </Suspense>
      </Canvas>
    </div>
    </>
  )
}

