'use client'
// Éléments 3D partagés par les scènes du hero et du contact : monolithes X et Y de XY.glb,
// matériau noir vernis, éclairage et environnement procédural (aucun téléchargement).
import { Environment, Lightformer } from '@react-three/drei'
import { AlwaysStencilFunc, ReplaceStencilOp, MathUtils } from 'three'

export const PAPER = '#f0ece4'
export const INK = '#0d0d0d'
export const deg = MathUtils.degToRad
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Monolithes 3D (meshes X et Y de XY.glb) : étirement horizontal (les lettres du glb sont plus étroites
// que les formes de la maquette), inclinaison en 3D pour montrer l'épaisseur. La hauteur visée est celle
// des formes de la maquette pour chaque format (voir shapeHeight dans HeroScene).
export const MONO = {
  x: { node: 'X', stretch: 1.6, tilt: [0.22, -0.3] },
  y: { node: 'Y', stretch: 1.6, tilt: [0.2, 0.3] },
}

// Le X du glb est fait de deux dalles séparées par une fente verticale, aux bords extérieurs en biais :
// on zoome autour d'un point plein de la dalle gauche (en fraction de la largeur du X) et plus loin que
// la maquette (×14 / ×12), pour que fente et bords sortent de l'écran avant que le fond noir soit monté.
export const X_ZOOM_ANCHOR = -0.3

// Échelle et décalage pour poser une lettre du glb debout, centrée, à la hauteur visée
export function fitGlyph(geometry, height, stretch) {
  geometry.computeBoundingBox()
  const { min, max } = geometry.boundingBox
  const s = height / (max.z - min.z)
  return {
    offset: [-(min.x + max.x) / 2, -(min.y + max.y) / 2, -(min.z + max.z) / 2],
    scale: [s * stretch, s, s],
    width: (max.x - min.x) * s * stretch,
  }
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

export function Monolith({ geometry, fit, mono, groupRef, tiltRef }) {
  const { offset, scale } = fit

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

// Lumières, ombre portée douce et reflets sur les arêtes
export function SceneLights() {
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
    </>
  )
}
