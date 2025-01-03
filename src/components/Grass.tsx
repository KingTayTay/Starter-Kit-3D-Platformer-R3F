import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

const grassModelUrl = "/assets/models/grass.glb";

type GLTFResult = GLTF & {
  nodes: {
    grass_1: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

export function Grass(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(grassModelUrl) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <group name="grass">
        <mesh
          name="grass_1"
          castShadow
          receiveShadow
          geometry={nodes.grass_1.geometry}
          material={materials.colormap}
        />
      </group>
    </group>
  );
}

useGLTF.preload(grassModelUrl);
