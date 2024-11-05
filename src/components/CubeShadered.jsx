import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";

const DiscoShaderMaterial = shaderMaterial(
  { uTime: 0 },
  //vertex shader
  /*glsl*/ `
    varying vec2 vUv;
    varying float vFaceRandom;
    float uRandomSeed = 901242123.12345;
    void main () {
        vUv = uv;
        vFaceRandom = fract(sin(dot(position.xyz + vec3(uRandomSeed), vec3(12.9898, 78.233, 45.164))) * 43758.5453123);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
  //fragment shader
  /*glsl*/ `
    varying vec2 vUv;
    varying float vFaceRandom;
    uniform float uTime;

    float hash(vec2 p, float seed){
    return fract(sin(dot(p + vec2(seed, seed), vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {

        float gridSize = 8.0;
        float borderThickness = 0.05;

        vec2 gridUV = fract(vUv * gridSize);
        vec2 gridIndex = floor(vUv * gridSize);
        
        //Checkered Pattern
        float check  = mod(gridIndex.x + gridIndex.y, 2.0);
        vec3 colorInside = mix(vec3(0.1), vec3(0.2), check);
        vec3 borderColor = vec3(0.05); // Darker border color

        // Determine if we are within the border region
        bool isBorder = gridUV.x < borderThickness || gridUV.x > (1.0 - borderThickness) ||
                        gridUV.y < borderThickness || gridUV.y > (1.0 - borderThickness);

        // Mix colors based on whether we are in the border or inside the cell
        vec3 finalColor = isBorder ? borderColor : colorInside;


        // Modulating color for a specific cell
            float timeBasedValue = floor(uTime);  // Change every second
        float randomValue = hash(gridIndex, vFaceRandom);
        if (randomValue > 0.78) { // Change this threshold to control how many cells are animated
        vec3 modulatingColor = vec3(0.5 + 0.5 * sin(uTime + randomValue * 6.28),
                                    0.5 + 0.5 * cos(uTime + randomValue * 6.28),
                                    0.5 + 0.5 * sin(uTime + randomValue * 6.28 + 1.0));
        finalColor = isBorder ? borderColor : modulatingColor;
    }   
        gl_FragColor.rgba = vec4(finalColor, 1.0);
    }
    `
);

extend({ DiscoShaderMaterial });

export const DiscoCube = () => {
  const ref = useRef();
  useFrame((state) => {
    ref.current.uTime = state.clock.elapsedTime;
  });
  return (
    <>
      <mesh>
        <boxGeometry />
        <discoShaderMaterial ref={ref} />
      </mesh>
    
    </>
  );
};
