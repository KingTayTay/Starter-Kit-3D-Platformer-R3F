import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { Grass } from "./Grass";
import { RigidBody, interactionGroups } from "@react-three/rapier";

const platformGrassModelUrl =
  "/Starter-Kit-3D-Platformer-R3F/assets/models/platform-grass-large-round.glb";

useGLTF.preload(platformGrassModelUrl);

type GLTFResult = GLTF & {
  nodes: {
    ["platform-grass-large-round_1"]: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

const COLLISION_GROUP = 1;
const PLAYER_COLLISION_GROUP = 0;
const collisionGroup = interactionGroups(
  [COLLISION_GROUP],
  [PLAYER_COLLISION_GROUP]
);

export function GrassPlatform(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    platformGrassModelUrl
  ) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        collisionGroups={collisionGroup}
        name="grass-platform-rigidbody"
        friction={0}
      >
        <group name="platform-grass-large-round">
          <mesh
            name="platform-grass-large-round_1"
            castShadow
            receiveShadow
            geometry={nodes["platform-grass-large-round_1"].geometry}
            material={materials.colormap}
          />
        </group>
      </RigidBody>
      <Grass position={[2, 0.5, 0]} />
      <Grass position={[-1.25, 0.5, -1.25]} />
      <Grass position={[0, 0.5, 2]} />
    </group>
  );
}
