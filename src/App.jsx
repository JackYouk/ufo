import React from "react";
import { PerspectiveCamera, Environment, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Ufo } from "./Ufo";
import { MotionBlur } from "./MotionBlur";
import { LayerMaterial, Base, Depth, Noise } from 'lamina'
import * as THREE from 'three'

function App() {
  return (
    <>
      <Environment background resolution={64}>
          <mesh scale={100}>
            <sphereGeometry args={[1, 64, 64]} />
            <LayerMaterial side={THREE.BackSide}>
              <Base color="black" alpha={1} mode="normal" />
              <Depth colorA="black" colorB="purple" alpha={0.5} mode="normal" near={0} far={10} origin={[100, 100, 100]} />
              <Noise mapping="local" type="cell" scale={0.5} mode="softlight" />
            </LayerMaterial>
          </mesh>
        </Environment>

      <PerspectiveCamera makeDefault position={[0, 10, 10]} />

      {/* <Landscape /> */}
      <Stars />
      <Ufo />
      {/* <Targets /> */}

      <directionalLight
        castShadow
        color={"#f3d29a"}
        intensity={4}
        position={[10, 5, 4]}
        shadow-bias={-0.0005}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.01}
        shadow-camera-far={20}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-left={-6.2}
        shadow-camera-right={6.4}
      />

      <EffectComposer>
        <MotionBlur />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />

        
      </EffectComposer>
    </>
  );
}

export default App;
