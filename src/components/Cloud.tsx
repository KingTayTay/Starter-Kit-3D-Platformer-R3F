import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    cube_1: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

useGLTF.preload("/assets/models/cloud.glb");

export function Cloud(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/assets/models/cloud.glb"
  ) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <Float speed={3} floatingRange={[-0.25, 0.25]} rotationIntensity={1}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.cube_1.geometry}
          material={materials.colormap}
          material-opacity={0.8}
          material-transparent
        />
      </Float>
    </group>
  );
}
