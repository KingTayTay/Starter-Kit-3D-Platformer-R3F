import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  RapierRigidBody,
  RigidBody,
  interactionGroups,
} from "@react-three/rapier";
import { damp3 } from "maath/easing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useAudio } from "../hooks/UseAudio";

useGLTF.preload("/assets/models/platform-falling.glb");

type GLTFResult = GLTF & {
  nodes: {
    ["platform-falling_1"]: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

const BASE_SCALE = new THREE.Vector3(1, 1, 1);
const COLLISION_GROUP = 2;
const PLAYER_COLLISION_GROUP = 0;
const collisionGroup = interactionGroups(
  [COLLISION_GROUP],
  [PLAYER_COLLISION_GROUP]
);

type Props = JSX.IntrinsicElements["group"] & {
  platformId: string;
  onDespawn: (platformId: string) => void;
};

export function FallingPlatform(props: Props) {
  const ref = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF(
    "/assets/models/platform-falling.glb"
  ) as unknown as GLTFResult;
  const [falling, setFalling] = useState(false);
  const [fallSound] = useAudio("/assets/sounds/fall.ogg");

  useEffect(() => {
    if (!ref.current) return;

    ref.current.setEnabledRotations(false, true, false, true);
  }, [ref]);

  useFrame((_state, dt) => {
    if (!ref.current) return;
    if (!groupRef.current) return;

    if (ref.current.translation().y < -10) {
      setFalling(false);
      props.onDespawn(props.platformId);
    }

    if (falling) {
      const currentVelocity = ref.current.linvel();
      const fallingVelocity = { x: 0, y: currentVelocity.y - dt * 5, z: 0 };

      ref.current.setLinvel(fallingVelocity, true);
    }

    damp3(groupRef.current.scale, BASE_SCALE, 0.1, dt);
  });

  const onCollisionEnter = () => {
    if (!falling) {
      groupRef.current?.scale.set(1.25, 0.5, 1.25);
    }

    setFalling(true);

    // play sound
    if (fallSound && !fallSound.isPlaying) {
      fallSound.play();
    }
  };

  return (
    <RigidBody
      ref={ref}
      type={falling ? "dynamic" : "fixed"}
      colliders="trimesh"
      collisionGroups={collisionGroup}
      name="falling-platform-rigidbody"
      onCollisionEnter={onCollisionEnter}
    >
      <group ref={groupRef} {...props} dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["platform-falling_1"].geometry}
          material={materials.colormap}
        />
      </group>
    </RigidBody>
  );
}
