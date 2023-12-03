import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Matrix4, Quaternion, Vector3, Mesh,
  SphereGeometry, MeshStandardMaterial,
  Color, MathUtils, TorusKnotGeometry, TorusGeometry
} from 'three';
import { createNoise3D} from 'simplex-noise';
import { updatePlaneAxis } from './controls';

const x = new Vector3(1, 0, 0);
const y = new Vector3(0, 1, 0);
const z = new Vector3(0, 0, 1);
export const planePosition = new Vector3(0, 3, 7);

const delayedRotMatrix = new Matrix4();
const delayedQuaternion = new Quaternion();
const noise = createNoise3D();

const NUM_PLANETS = 2000; // Number of planets to create
const MAX_DISTANCE = 5000; // Maximum distance from the player

export function Ufo(props) {
  const { nodes, materials } = useGLTF("assets/models/ufo.glb");
  const groupRef = useRef();
  const { scene, camera } = useThree();
  const planetsRef = useRef([]);

  const createRandomGeometry = () => {
    const type = Math.floor(Math.random() * 3);
    let geometry;
    switch (type) {
      case 0:
        geometry = new SphereGeometry(MathUtils.randFloat(2, 5), 32, 32);
        break;
      case 1:
        geometry = new TorusKnotGeometry(MathUtils.randFloat(2, 5), MathUtils.randFloat(0.5, 1.5), 16, 100);
        break;
      case 2:
        geometry = new TorusGeometry(MathUtils.randFloat(2, 5), MathUtils.randFloat(0.5, 1.5), 16, 100);
        break;
      default:
        geometry = new SphereGeometry(MathUtils.randFloat(2, 5), 32, 32);
    }

    // Apply noise-based distortion
    const positionAttribute = geometry.attributes.position;
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new Vector3();
      vertex.fromBufferAttribute(positionAttribute, i);

      const p = vertex.clone().multiplyScalar(0.1);
      const n = noise(p.x, p.y, p.z);
      vertex.multiplyScalar(6 + 33 * n);

      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry.computeVertexNormals();
    geometry.rotateX(Math.random() * 5)
    geometry.rotateZ(Math.random() * 5)
    return geometry;
  };

  const createEmissiveMaterial = () => {
    const color = new Color(Math.random() * 0xffffff);
    return new MeshStandardMaterial({ 
      color, 
      emissive: color, 
      emissiveIntensity: 2,
      wireframe: true
    });
  };

  // Create planets upfront
  useEffect(() => {
    for (let i = 0; i < NUM_PLANETS; i++) {
      const geometry = createRandomGeometry();
      const material = createEmissiveMaterial();
      const planet = new Mesh(geometry, material);
      const position = new Vector3(
        MathUtils.randFloatSpread(MAX_DISTANCE),
        MathUtils.randFloatSpread(MAX_DISTANCE),
        MathUtils.randFloatSpread(MAX_DISTANCE)
      );
      planet.position.copy(position);
      planetsRef.current.push(planet);
      scene.add(planet);
    }
  }, [scene]);

  useFrame(() => {
    updatePlaneAxis(x, y, z, planePosition, camera);

    const rotMatrix = new Matrix4().makeBasis(x, y, z);
    const matrix = new Matrix4()
      .multiply(new Matrix4().makeTranslation(planePosition.x, planePosition.y, planePosition.z))
      .multiply(rotMatrix);

    groupRef.current.matrixAutoUpdate = false;
    groupRef.current.matrix.copy(matrix);
    groupRef.current.matrixWorldNeedsUpdate = true;

    var quaternionA = new Quaternion().copy(delayedQuaternion);
    var quaternionB = new Quaternion();
    quaternionB.setFromRotationMatrix(rotMatrix);

    var interpolationFactor = 0.175;
    var interpolatedQuaternion = new Quaternion().copy(quaternionA);
    interpolatedQuaternion.slerp(quaternionB, interpolationFactor);
    delayedQuaternion.copy(interpolatedQuaternion);

    delayedRotMatrix.identity();
    delayedRotMatrix.makeRotationFromQuaternion(delayedQuaternion);

    const cameraMatrix = new Matrix4()
      .multiply(new Matrix4().makeTranslation(planePosition.x, planePosition.y, planePosition.z))
      .multiply(delayedRotMatrix)
      .multiply(new Matrix4().makeRotationX(-0.2))
      .multiply(new Matrix4().makeTranslation(0, 0.015, 0.3));

    camera.matrixAutoUpdate = false;
    camera.matrix.copy(cameraMatrix);
    camera.matrixWorldNeedsUpdate = true;

    // Visibility check based on distance
    planetsRef.current.forEach(planet => {
      const distance = planet.position.distanceTo(planePosition);
      if (distance > MAX_DISTANCE) {
        planet.visible = false; // Hide the planet if it's too far away
      } else {
        planet.visible = true; // Show the planet if it's within range
      }
    });
    
  });

  return (
    <>
      <group ref={groupRef}>
        <group {...props} dispose={null} scale={0.02} rotation-y={Math.PI}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial.geometry}
            material={materials.material}
            rotation={[0, 0, 0]}
          />
        </group>
      </group>
    </>
  )
}

useGLTF.preload('assets/models/ufo.glb');
