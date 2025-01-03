import RAPIER, { QueryFilterFlags } from "@dimforge/rapier3d-compat";
import { useAnimations, useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  interactionGroups,
  useRapier,
} from "@react-three/rapier";
import { dampQ } from "maath/easing";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { Controls } from "../App";
import { Emitter } from "./Particles";
import { resetStore } from "../store";
import { useAudio } from "../hooks/UseAudio";

type GLTFResult = GLTF & {
  nodes: {
    ["leg-left"]: THREE.Mesh;
    ["leg-right"]: THREE.Mesh;
    torso: THREE.Mesh;
    ["arm-left"]: THREE.Mesh;
    ["arm-right"]: THREE.Mesh;
    antenna: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

type ActionName = "static" | "idle" | "walk" | "jump";

const modelUrl = "/Starter-Kit-3D-Platformer-R3F/assets/models/character.glb";

useGLTF.preload(modelUrl);

const BASE_SCALE = new THREE.Vector3(1, 1, 1);
const JUMP_SCALE = new THREE.Vector3(0.7, 1.3, 0.7);
const LANDED_SCALE = new THREE.Vector3(1.3, 0.7, 1.3);
const SPEED = 3;
const MAX_JUMP_COUNT = 2;
const COLLISION_GROUP = 0;
const PLATFORM_COLLISION_GROUP = 1;
const FALLING_PLATFORM_COLLISION_GROUP = 2;
const collisionGroup = interactionGroups(
  [COLLISION_GROUP],
  [PLATFORM_COLLISION_GROUP, FALLING_PLATFORM_COLLISION_GROUP]
);
const raycastDirection = new THREE.Vector3(0, -1, 0);
const upVector = new THREE.Vector3(0, 1, 0);
const movementVector = new THREE.Vector3(0, 0, 0);
const rotationVector = new THREE.Vector3(0, 0, 0);
const rotationEuler = new THREE.Euler(0, 0, 0);
const rotationQuaternion = new THREE.Quaternion();
const dampenedRotationQuaternion = new THREE.Quaternion();
let isOnGround = false;
let justLanded = false;
let jumpCount = 0;
let jumpHeld = false;
let justJumped = false;

type Props = JSX.IntrinsicElements["group"] & {
  viewRef: React.RefObject<THREE.Group>;
};

export const Player = forwardRef<RapierRigidBody, Props>(
  (props, forwardedRef) => {
    const ref = useRef<THREE.Group>(null);
    const { nodes, materials, animations } = useGLTF(
      modelUrl
    ) as unknown as GLTFResult;
    const { actions } = useAnimations(animations, ref);
    const { world } = useRapier();
    const [animationName, setAnimationName] = useState<ActionName>("idle");
    const [walkingSound] = useAudio(
      "/Starter-Kit-3D-Platformer-R3F/assets/sounds/walking.ogg"
    );
    const [jumpSound] = useAudio(
      "/Starter-Kit-3D-Platformer-R3F/assets/sounds/jump.ogg"
    );
    const [landSound] = useAudio(
      "/Starter-Kit-3D-Platformer-R3F/assets/sounds/land.ogg"
    );

    useEffect(() => {
      if (walkingSound) {
        walkingSound.setLoop(true);
      }
    }, [walkingSound]);

    const characterBodyRef = useRef<RapierRigidBody>(null!);

    useImperativeHandle(forwardedRef, () => characterBodyRef.current);

    useEffect(() => {
      const currentAnimation = actions[animationName];

      if (!currentAnimation) {
        return;
      }

      if (animationName === "jump") {
        currentAnimation.reset().fadeIn(0.2).setLoop(THREE.LoopOnce, 0).play();
        currentAnimation.clampWhenFinished = true;
      } else {
        currentAnimation.reset().fadeIn(0.5).play();
      }

      return () => {
        currentAnimation.fadeOut(0.25);
      };
    }, [actions, animationName]);

    const [, get] = useKeyboardControls<Controls>();

    useEffect(() => {
      if (!characterBodyRef.current) return;

      characterBodyRef.current.setEnabledRotations(false, true, false, true);
    }, [characterBodyRef]);

    useFrame((_state, dt) => {
      if (!characterBodyRef.current) return;

      const characterBodyPosition = characterBodyRef.current.translation();
      const ray = new RAPIER.Ray(
        {
          x: characterBodyPosition.x,
          y: characterBodyPosition.y + 0.5,
          z: characterBodyPosition.z,
        },
        { x: raycastDirection.x, y: raycastDirection.y, z: raycastDirection.z }
      );
      const maxToi = 0.6;
      const solid = true;
      const filterFlags = QueryFilterFlags.EXCLUDE_DYNAMIC;
      const filterGroups = collisionGroup;
      const filterExcludeRigidBody = characterBodyRef.current;

      const hit = world.castRay(
        ray,
        maxToi,
        solid,
        filterFlags,
        filterGroups,
        undefined,
        filterExcludeRigidBody
      );
      if (hit != null) {
        // Handle the hit.
        justLanded = !isOnGround;

        if (justLanded) {
          // scale body for landing
          ref.current?.scale.copy(LANDED_SCALE);

          // play the landing sound
          if (landSound) {
            landSound.play();
          }
        }

        isOnGround = true;
        jumpCount = 0;
      } else {
        isOnGround = false;
      }

      const { left, right, forward, back, jump } = get();
      const forwardInput = forward && !back ? -1 : back && !forward ? 1 : 0;
      const sideInput = right && !left ? 1 : !right && left ? -1 : 0;

      // Movement
      movementVector.set(sideInput, 0, forwardInput);
      if (props.viewRef.current) {
        movementVector.applyAxisAngle(
          upVector,
          props.viewRef.current.rotation.y
        );
      }
      movementVector.normalize();
      movementVector.multiplyScalar(SPEED);
      characterBodyRef.current.setLinvel(
        {
          x: movementVector.x,
          y: characterBodyRef.current.linvel().y,
          z: movementVector.z,
        },
        true
      );

      // Rotation
      rotationVector.set(sideInput, 0, forwardInput);

      if (rotationVector.length() > 0 && props.viewRef.current) {
        rotationVector.applyAxisAngle(
          upVector,
          props.viewRef.current.rotation.y
        );

        const rotationAngle = new THREE.Vector2(
          rotationVector.z,
          rotationVector.x
        ).angle();
        rotationEuler.set(0, rotationAngle, 0);
        rotationQuaternion.setFromEuler(rotationEuler);
      }

      dampQ(dampenedRotationQuaternion, rotationQuaternion, 0.15, dt);
      characterBodyRef.current.setRotation(dampenedRotationQuaternion, true);

      // Jumping
      if (jump && !jumpHeld) {
        justJumped = true;
      }

      if (justJumped && jumpCount < MAX_JUMP_COUNT) {
        const jumpVelocity = { x: 0, y: 5, z: 0 };

        characterBodyRef.current.setLinvel(jumpVelocity, true);
        jumpCount++;

        // scale body for jump
        if (ref.current) {
          ref.current.scale.copy(JUMP_SCALE);
        }

        // play the jump sound
        if (jumpSound) {
          jumpSound.play();
        }
      }

      jumpHeld = jump;
      justJumped = false;

      // Animation
      if (!isOnGround) {
        setAnimationName("jump");
      } else if (movementVector.length() > 0) {
        setAnimationName("walk");
      } else {
        setAnimationName("idle");
      }

      // Base scale
      if (ref.current) {
        ref.current.scale.lerp(BASE_SCALE, 10 * dt);
      }

      // Reset on fall
      if (characterBodyPosition.y < -10) {
        characterBodyRef.current.setTranslation({ x: 0, y: 3, z: 0 }, true);
        characterBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        resetStore();
      }

      if (isOnGround && movementVector.length() > 0) {
        if (walkingSound && !walkingSound.isPlaying) {
          walkingSound.play();
        }
      } else {
        if (walkingSound && walkingSound.isPlaying) {
          walkingSound.pause();
        }
      }
    });

    return (
      <RigidBody
        ref={characterBodyRef}
        type="dynamic"
        colliders={false}
        position={[0, 3, 0]}
      >
        <CapsuleCollider
          name="character-capsule-collider"
          args={[0.1, 0.4]}
          position={[0, 0.5, 0]}
          collisionGroups={collisionGroup}
          friction={0}
        />

        <group ref={ref} {...props} dispose={null}>
          <group name="character">
            <group name="character_1">
              <group name="root" position={[0, 0.024, 0]}>
                <mesh
                  name="leg-left"
                  castShadow
                  receiveShadow
                  geometry={nodes["leg-left"].geometry}
                  material={materials.colormap}
                  position={[0.125, 0.176, -0.024]}
                />
                <mesh
                  name="leg-right"
                  castShadow
                  receiveShadow
                  geometry={nodes["leg-right"].geometry}
                  material={materials.colormap}
                  position={[-0.125, 0.176, -0.024]}
                />
                <mesh
                  name="torso"
                  castShadow
                  receiveShadow
                  geometry={nodes.torso.geometry}
                  material={materials.colormap}
                  position={[0, 0.176, -0.024]}
                >
                  <mesh
                    name="arm-left"
                    castShadow
                    receiveShadow
                    geometry={nodes["arm-left"].geometry}
                    material={materials.colormap}
                    position={[0.3, 0.175, 0]}
                  />
                  <mesh
                    name="arm-right"
                    castShadow
                    receiveShadow
                    geometry={nodes["arm-right"].geometry}
                    material={materials.colormap}
                    position={[-0.3, 0.119, 0]}
                  />
                  <mesh
                    name="antenna"
                    castShadow
                    receiveShadow
                    geometry={nodes.antenna.geometry}
                    material={materials.colormap}
                    position={[0, 0.6, 0]}
                  />
                </mesh>
              </group>
            </group>
          </group>
          <Emitter
            emitterId="player"
            count={30}
            maxTimeAlive={1}
            type="dust"
            radius={0.2}
            emitting={movementVector.length() > 0 && isOnGround}
          />
        </group>
      </RigidBody>
    );
  }
);

export default Player;
