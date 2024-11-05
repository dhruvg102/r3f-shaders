import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import CSM from "three-custom-shader-material";
import * as THREE from "three";

const vertexShader = /*glsl*/ `
  varying vec2 vUv;
  uniform vec3 uPointPos;

  vec3 displace(vec3 point)
  {
    float len = length(point - uPointPos);

    float maxDistance = 1.0;
    float intensity = 0.5;

    float displacementFactor = smoothstep(maxDistance, 0.0, len) * intensity;

    return point + normal * displacementFactor;
  }
  vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
  }

  vec3 recalcNormals(vec3 newPos) {
    float offset = 0.001;
    vec3 tangent = orthogonal(normal);
    vec3 bitangent = normalize(cross(normal, tangent));
    vec3 neighbour1 = position + tangent * offset;
    vec3 neighbour2 = position + bitangent * offset;

    vec3 displacedNeighbour1 = displace(neighbour1);
    vec3 displacedNeighbour2 = displace(neighbour2);

    vec3 displacedTangent = displacedNeighbour1 - newPos;
    vec3 displacedBitangent = displacedNeighbour2 - newPos;

    return normalize(cross(displacedTangent, displacedBitangent));
  }
  void main()
  {
    vUv = uv;

    
    vec3 newPos = displace(position);
    csm_Position = newPos; 
    csm_Normal = recalcNormals(csm_Position);
  }
`;

const fragmentShader = /*glsl*/ `
  varying vec2 vUv;
  void main()
  {
    csm_DiffuseColor.rgba = vec4(0.3, 0.1, 0.4, 1.0);
  }
`;
export const RevealMaterial = ({ baseMaterial, wireframe = false, point }) => {
  const uniforms = useRef({
    uPointPos: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
  });

  useFrame(() => {
    if (point) {
      uniforms.current.uPointPos.value.copy(point);
    }
  });
  return (
    <>
      <CSM
        baseMaterial={baseMaterial}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        wireframe={wireframe}
        toneMapped={false}
        transparent
      />
    </>
  );
};
