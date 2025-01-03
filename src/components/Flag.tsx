import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    flag_1: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

useGLTF.preload("/assets/models/flag.glb");

export function Flag(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/assets/models/flag.glb"
  ) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.flag_1.geometry}
        material={materials.colormap}
      />
    </group>
  );
}
