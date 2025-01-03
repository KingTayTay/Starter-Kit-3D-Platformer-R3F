import {
  Hud as DreiHud,
  PerspectiveCamera,
  Text,
  useTexture,
} from "@react-three/drei";
import { Vector3, useThree } from "@react-three/fiber";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { store } from "../store";

const url = "/Starter-Kit-3D-Platformer-R3F/assets/sprites/coin.png";

export const Hud = () => {
  const coinTexture = useTexture(url);
  const [aspect] = useState<Vector3 | undefined>([1, 1, 1]);
  const { viewport } = useThree();
  const snapshot = useSnapshot(store);

  return (
    <DreiHud renderPriority={1}>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <group
        scale={[0.5, 0.5, 0.5]}
        position={[-viewport.width / 2, viewport.height / 2, 0]}
      >
        <sprite scale={aspect}>
          <spriteMaterial
            map={coinTexture}
            premultipliedAlpha={false}
            transparent={true}
            alphaTest={0.01}
          />
        </sprite>
        <group position={[0.5, 0, 0]}>
          <Text
            font={"assets/fonts/lilita_one_regular.ttf"}
            fontSize={0.5}
            anchorX="left"
            anchorY="middle"
            position={[0, 0, 0]}
            material-toneMapped={false}
            outlineColor="black"
            outlineWidth={0.001}
            outlineOffsetX={0.01}
            outlineOffsetY={0.01}
            outlineOpacity={0.5}
          >
            ×
          </Text>
          <Text
            font={"assets/fonts/lilita_one_regular.ttf"}
            fontSize={0.75}
            anchorX="left"
            anchorY="middle"
            position={[0.3, 0, 0]}
            color="white"
            material-toneMapped={false}
            outlineColor="black"
            outlineWidth={0.001}
            outlineOffsetX={0.01}
            outlineOffsetY={0.01}
            outlineOpacity={0.5}
          >
            {snapshot.score ?? 0}
          </Text>
        </group>
      </group>
    </DreiHud>
  );
};

export default Hud;
