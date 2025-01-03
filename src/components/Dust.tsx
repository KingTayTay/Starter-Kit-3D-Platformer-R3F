import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    cloud_1: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

useGLTF.preload("/assets/models/dust.glb");

export function Dust(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/assets/models/dust.glb"
  ) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.cloud_1.geometry}
        material={materials.colormap}
      />
    </group>
  );
}

export default Dust;
