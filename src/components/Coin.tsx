import { Float, useGLTF } from "@react-three/drei";
import { BallCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { Emitter } from "./Particles";
import { useAudio } from "../hooks/UseAudio";

type GLTFResult = GLTF & {
  nodes: {
    coin_1: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

useGLTF.preload("/Starter-Kit-3D-Platformer-R3F/assets/models/coin.glb");

type CoinProps = JSX.IntrinsicElements["group"] & {
  coinId: string;
  onCollect: (coinId: string) => void;
};

export function Coin(props: CoinProps) {
  const { nodes, materials } = useGLTF(
    "/Starter-Kit-3D-Platformer-R3F/assets/models/coin.glb"
  ) as unknown as GLTFResult;
  const [coinSound] = useAudio(
    "/Starter-Kit-3D-Platformer-R3F/assets/sounds/coin.ogg"
  );

  const onCollect = () => {
    props.onCollect(props.coinId);
    coinSound?.play();
  };

  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed">
        <BallCollider args={[0.5]} sensor onIntersectionEnter={onCollect} />
        <Float speed={10} floatingRange={[-0.25, 0.25]} rotationIntensity={1}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.coin_1.geometry}
            material={materials.colormap}
          />
          <Emitter
            emitterId={props.coinId}
            count={4}
            maxTimeAlive={1}
            type="star"
            emitting
            radius={0.25}
          />
        </Float>
      </RigidBody>
    </group>
  );
}
