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

// Zoom du X jusqu'à couvrir l'écran. Silhouette de face du X (étiré ×1,6) analysée une fois depuis XY.glb :
// le point le plus « plein » est dans la dalle droite, partie basse (la fente centrale et les bords en
// sablier sont ailleurs). Coordonnées en fractions de la hauteur du X, depuis son centre, y vers le haut.
// rects : demi-largeur et demi-hauteur du plus grand rectangle plein centré sur ce point, par format.
export const X_COVER = {
  anchor: [0.1478, -0.28],
  rects: [[0.099, 0.22], [0.117, 0.195], [0.1213, 0.1517], [0.1233, 0.1233], [0.1257, 0.0967],
    [0.128, 0.08], [0.13, 0.065], [0.132, 0.055]],
}

// Échelle à partir de laquelle le X (hauteur h), son point plein centré sur l'écran, couvre une vue
// de demi-dimensions halfW × halfH (mêmes unités que h). Marge de 10 %. sx : étirement horizontal
// relatif à celui de l'analyse (MONO.x.stretch).
export function coverScale(halfW, halfH, h, sx = 1) {
  const need = Math.min(...X_COVER.rects.map(([rw, rh]) => Math.max(halfW / (rw * sx * h), halfH / (rh * h))))
  return need * 1.1
}

// Position du point plein (relative au centre du X) pour une hauteur h et une rotation θ (radians)
export function anchorOffset(h, theta, sx = 1) {
  const ax = X_COVER.anchor[0] * sx
  const ay = X_COVER.anchor[1]
  const c = Math.cos(theta)
  const sn = Math.sin(theta)
  return [(ax * c - ay * sn) * h, (ax * sn + ay * c) * h]
}

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
