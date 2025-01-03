import { useFrame } from "@react-three/fiber";
import { Bezier, Point } from "bezier-js";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { proxy, useSnapshot } from "valtio";
import Dust from "./Dust";
import Star from "./Star";

const starBezierPoints: Point[] = [
  { x: 0, y: 0 },
  { x: 0.5, y: 0.5 },
  { x: 1, y: 0 },
];
const starBezier = new Bezier(starBezierPoints);

const dustBezierPoints: Point[] = [
  { x: 0, y: 0 },
  { x: 0.25, y: 1 },
  { x: 1, y: 0 },
];
const dustBezier = new Bezier(dustBezierPoints);

interface Particle {
  id: string;
  active: boolean;
  timeAlive: number;
  maxTimeAlive: number;
  velocity: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  type: "star" | "dust";
  bezier: Bezier;
  emitterId: string;
}

const particleStore = proxy({
  allIds: [] as string[],
  byId: {} as Record<string, Particle>,
});

type ParticleProps = JSX.IntrinsicElements["group"] & {
  particleId: string;
};

function Particle(props: ParticleProps) {
  const { particleId } = props;
  const ref = useRef<THREE.Group>(null);

  useFrame((_state, dt) => {
    const particle = particleStore.byId[particleId];

    if (!particle) return;

    if (particle.active) {
      particle.timeAlive += dt;

      if (ref.current) {
        const scale = particle.bezier.get(
          particle.timeAlive / particle.maxTimeAlive
        ).y;

        ref.current.scale.setScalar(scale);
        ref.current.position.set(
          particle.position.x,
          particle.position.y,
          particle.position.z
        );
      }

      if (particle.timeAlive > particle.maxTimeAlive) {
        particle.active = false;
        particle.timeAlive = 0;

        if (ref.current) {
          ref.current.scale.set(0, 0, 0);
        }
      }
    }
  });

  return <group {...props} ref={ref} scale={[0, 0, 0]} />;
}

export function Particles(props: JSX.IntrinsicElements["group"]) {
  const particles = useSnapshot(particleStore);
  const allParticles = particles.allIds.map((id) => particles.byId[id]);

  return (
    <group {...props}>
      {allParticles.map((particle) => {
        return (
          <Particle key={particle.id} particleId={particle.id}>
            {particle.type === "star" && <Star />}
            {particle.type === "dust" && <Dust scale={[2, 2, 2]} />}
          </Particle>
        );
      })}
    </group>
  );
}

const tempSpawnPosition = new THREE.Vector3(0, 0, 0);

type EmitterProps = JSX.IntrinsicElements["group"] & {
  emitterId: string;
  count: number;
  maxTimeAlive: number;
  type: "star" | "dust";
  emitting: boolean;
  radius: number;
};

export function Emitter(props: EmitterProps) {
  const ref = useRef<THREE.Group>(null);
  const { count, maxTimeAlive } = props;
  const spawnInterval = maxTimeAlive / count;
  const timeSinceSpawn = useRef(0);

  useEffect(() => {
    const emitterId = props.emitterId;

    for (let i = 0; i < count + 1; i++) {
      const particleId = `${emitterId}-particle-${i}`;

      particleStore.allIds.push(particleId);
      particleStore.byId[particleId] = {
        id: particleId,
        active: false,
        timeAlive: 0,
        maxTimeAlive: maxTimeAlive,
        velocity: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        emitterId: emitterId,
        bezier: props.type === "star" ? starBezier : dustBezier,
        type: props.type,
      };
    }

    return () => {
      const particlesForEmitter = particleStore.allIds
        .map((id) => {
          return particleStore.byId[id];
        })
        .filter((particle) => particle.emitterId === emitterId);

      particlesForEmitter.forEach((particle) => {
        delete particleStore.byId[particle.id];
      });

      particleStore.allIds = particleStore.allIds.filter((id) => {
        return !particlesForEmitter.some((particle) => particle.id === id);
      });
    };
  }, [count, maxTimeAlive, props.emitterId, props.type]);

  useFrame((_state, dt) => {
    if (!props.emitting) return;

    timeSinceSpawn.current += dt;

    if (timeSinceSpawn.current >= spawnInterval) {
      timeSinceSpawn.current = 0;

      const allParticles = particleStore.allIds.map(
        (id) => particleStore.byId[id]
      );
      const allInactiveParticles = allParticles.filter(
        (particle) => !particle.active
      );
      const allParticlesForEmitter = allInactiveParticles.filter(
        (particle) => particle.emitterId === props.emitterId
      );
      const firstInactiveParticle = allParticlesForEmitter[0];

      if (firstInactiveParticle) {
        if (ref.current) {
          ref.current.getWorldPosition(tempSpawnPosition);
        }

        const randomXOffset = Math.random() * (props.radius * 2) - props.radius;
        const randomYOffset = Math.random() * (props.radius * 2) - props.radius;
        const randomZOffset = Math.random() * (props.radius * 2) - props.radius;
        const { x, y, z } = tempSpawnPosition;

        firstInactiveParticle.active = true;
        firstInactiveParticle.timeAlive = 0;
        firstInactiveParticle.position = {
          x: x + randomXOffset,
          y: y + randomYOffset,
          z: z + randomZOffset,
        };
        firstInactiveParticle.maxTimeAlive = maxTimeAlive;
      }
    }
  });

  return <group ref={ref} {...props} />;
}
