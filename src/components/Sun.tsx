import { DirectionalLightProps, useFrame } from "@react-three/fiber";
import { RapierRigidBody, vec3 } from "@react-three/rapier";
import { damp3 } from "maath/easing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Props = DirectionalLightProps & {
  targetRef: React.RefObject<RapierRigidBody>;
};

const startingPositionVector = new THREE.Vector3(8, 8, 0);
const positionVector = new THREE.Vector3(0, 0, 0);
const targetVector = new THREE.Vector3(0, 0, 0);

export const Sun = (props: Props) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const [obj] = useState(() => {
    const newObj = new THREE.Object3D();
    newObj.position.set(0, 0, 0);

    return newObj;
  });

  useEffect(() => {
    if (!lightRef.current) return;
    if (!obj) return;

    lightRef.current.target = obj;
  }, [lightRef, obj]);

  useFrame((_state, dt) => {
    if (!lightRef.current) return;

    const { targetRef } = props;

    if (!targetRef.current) return;

    const targetPosition = targetRef.current.translation();

    // move light
    positionVector.copy(vec3(targetPosition).add(startingPositionVector));
    damp3(lightRef.current.position, positionVector, 0.6, dt * 6);

    // move target
    targetVector.copy(vec3(targetPosition));
    damp3(obj.position, targetVector, 0.6, dt * 6);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      position={startingPositionVector}
      intensity={2}
      target={obj}
      castShadow
      shadow-mapSize-height={1024}
      shadow-mapSize-width={1024}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
      shadow-camera-near={1}
      shadow-camera-far={20}
      shadow-bias={-0.0025}
    />
  );
};

export default Sun;
