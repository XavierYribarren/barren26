import { useRef, useEffect } from 'react';
import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function Model({ scroll, ...props }) {
  const { nodes } = useGLTF('/XY.glb');
  const matRef = useRef();
  const textRef = useRef();
  const yRef = useRef();
  const xRef = useRef();
  const smooth = useRef(0);

  useFrame(() => {
    if (scroll?.current !== undefined) {
      smooth.current += (scroll.current - smooth.current) * 0.05;
    }
    const s = smooth.current;
    if (yRef.current) {
      // yRef.current.rotation.x = s * 2.0
      yRef.current.rotation.z = s * 3;
    }
    if (xRef.current) {
      // xRef.current.rotation.y = s * -2.5
      xRef.current.rotation.z = -s * 3.1;
    }
  });

  useEffect(() => {
    if (!matRef.current) return;
    if (textRef.current) textRef.current.material = matRef.current;
    if (yRef.current) yRef.current.material = matRef.current;
    if (xRef.current) xRef.current.material = matRef.current;
  }, []);

  return (
    <group
      {...props}
      dispose={null}
      rotation={[Math.PI * 0.5, 0, 0]}
      scale={7}
      position={[1,0,0]}
    >
      <MeshTransmissionMaterial
        ref={matRef}
        transmission={1}
        thickness={4}
        roughness={0}
        color={'#fff'}
        samples={10}
        ior={1.4}
        resolution={2048}
      />

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Y.geometry}
        position={[0.603, 0, -0.551]}
        ref={yRef}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.X.geometry}
        position={[0.169, 0, -0.453]}
        ref={xRef}
      />
    </group>
  );
}

useGLTF.preload('/XY.glb');
