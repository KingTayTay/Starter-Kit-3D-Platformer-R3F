import {
  Environment,
  KeyboardControls,
  KeyboardControlsEntry,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Hud } from "./components/Hud";
import { Particles } from "./components/Particles";
import { Player } from "./components/Player";
import { Sun } from "./components/Sun";
import { View } from "./components/View";
import MainScene from "./scenes/Main";

export type Controls =
  | "forward"
  | "back"
  | "left"
  | "right"
  | "jump"
  | "camera_left"
  | "camera_right"
  | "camera_up"
  | "camera_down";

function App() {
  const characterBodyRef = useRef<RapierRigidBody>(null);
  const viewRef = useRef<THREE.Group>(null);

  const keyboardControlsMap = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: "forward", keys: ["KeyW"] },
      { name: "back", keys: ["KeyS"] },
      { name: "left", keys: ["KeyA"] },
      { name: "right", keys: ["KeyD"] },
      { name: "jump", keys: ["Space"] },
      { name: "camera_left", keys: ["ArrowLeft"] },
      { name: "camera_right", keys: ["ArrowRight"] },
      { name: "camera_up", keys: ["ArrowUp"] },
      { name: "camera_down", keys: ["ArrowDown"] },
    ],
    []
  );

  return (
    <Canvas shadows>
      <fog attach="fog" args={["white", 0, 40]} />
      <color attach="background" args={["#ebddf5"]} />
      <ambientLight intensity={0.1} />
      <Sun targetRef={characterBodyRef} />
      <Physics timeStep="vary" gravity={[0, -15, 0]}>
        <MainScene />
        <Particles />
        <KeyboardControls map={keyboardControlsMap}>
          <Player ref={characterBodyRef} viewRef={viewRef} />
          <View ref={viewRef} targetRef={characterBodyRef} />
          <Hud />
        </KeyboardControls>
      </Physics>
      <Environment preset="sunset" />
    </Canvas>
  );
}

export default App;
