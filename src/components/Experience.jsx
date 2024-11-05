import {
  Bvh,
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { RevealMaterial } from "./RevealMaterial";
import { DiscoCube } from "./CubeShadered";

function RedMarker({ position }) {
  if (!position) return null; // Don't render anything if there's no intersection

  return (
    <mesh scale={0.1} position={position}>
      <sphereGeometry args={[1, 16, 16]} /> {/* Small red sphere */}
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

const baseShader = new THREE.MeshStandardMaterial({ color: "white" });

export const Experience = () => {
  const meshRef = useRef();
  const { raycaster, mouse, camera, scene } = useThree();
  const [point, setPoint] = useState();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry = meshRef.current.geometry.toNonIndexed();
    }
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouse]);

  useFrame(() => {
    if (!meshRef.current) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      setPoint(intersection.point);

    } else {
      setPoint(undefined);
    }
  });
  return (
    <>
      <OrbitControls />

      <Bvh>
        <mesh scale={1.5} ref={meshRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <RevealMaterial baseMaterial={baseShader} wireframe={false} point={point} />
        </mesh>
      </Bvh>
      <DiscoCube />
      {/* <RedMarker position={point} /> */}
      <Environment preset="sunset" />
      <ContactShadows position-y={-4} />
    </>
  );
};
