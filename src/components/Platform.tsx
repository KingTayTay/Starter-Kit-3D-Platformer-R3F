import { useGLTF } from "@react-three/drei";
import { RigidBody, interactionGroups } from "@react-three/rapier";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    platform_1: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

const modelUrl = "/assets/models/platform.glb";

useGLTF.preload(modelUrl);

const COLLISION_GROUP = 1;
const PLAYER_COLLISION_GROUP = 0;
const collisionGroup = interactionGroups(
  [COLLISION_GROUP],
  [PLAYER_COLLISION_GROUP]
);

export function Platform(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(modelUrl) as unknown as GLTFResult;

  return (
    <RigidBody
      type="fixed"
      colliders="trimesh"
      collisionGroups={collisionGroup}
      name="platform-rigidbody"
      friction={0}
    >
      <group {...props} dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.platform_1.geometry}
          material={materials.colormap}
        />
      </group>
    </RigidBody>
  );
}
