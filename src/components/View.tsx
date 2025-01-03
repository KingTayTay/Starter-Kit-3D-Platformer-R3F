import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, vec3 } from "@react-three/rapier";
import { damp3, dampE } from "maath/easing";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Euler, Vector3, Group } from "three";
import { Controls } from "../App";

const input = new Vector3(0, 0, 0);
const viewRotation = new Vector3(0, 0, 0); // in degrees
const viewRotationEuler = new Euler(0, 0, 0, "YXZ");
const dampedEuler = new Euler(0, 0, 0, "YXZ");
const rotationSpeed = 80;

type Props = JSX.IntrinsicElements["group"] & {
  targetRef: React.RefObject<RapierRigidBody>;
};

export const View = forwardRef<Group, Props>((props, forwardedRef) => {
  const groupRef = useRef<Group>(null!);
  const [, get] = useKeyboardControls<Controls>();

  useImperativeHandle(forwardedRef, () => groupRef.current);

  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.rotation.order = "YXZ";
  });

  useFrame((_state, dt) => {
    // rotation
    const { camera_down, camera_up, camera_left, camera_right } = get();

    const inputX =
      camera_up && !camera_down ? -1 : camera_down && !camera_up ? 1 : 0;
    const inputY =
      camera_right && !camera_left ? 1 : camera_left && !camera_right ? -1 : 0;

    input.set(inputX, inputY, 0);

    const rotationAmount = input.multiplyScalar(rotationSpeed * dt);
    viewRotation.add(rotationAmount);
    viewRotation.x = Math.min(Math.max(viewRotation.x, -80), -10);

    const rotationRadians = viewRotation.clone().multiplyScalar(Math.PI / 180);

    viewRotationEuler.set(rotationRadians.x, rotationRadians.y, 0, "YXZ");

    dampE(dampedEuler, viewRotationEuler, 0.6, dt * 6);
    groupRef.current.setRotationFromEuler(dampedEuler);

    // position
    const { targetRef } = props;

    if (!targetRef.current) return;

    const targetPosition = targetRef.current.translation();

    damp3(groupRef.current.position, vec3(targetPosition), 0.6, dt * 6);
  });

  return (
    <group ref={groupRef} {...props}>
      <PerspectiveCamera position={[0, 0, 10]} fov={40} makeDefault />
    </group>
  );
});

export default View;
