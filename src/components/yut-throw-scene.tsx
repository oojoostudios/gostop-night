"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";

const STICK_W = 0.7;
const STICK_H = 0.18;
const STICK_L = 3.4;
const STICK_COUNT = 4;
const REST_GAP = 0.95;

const WOOD_TEXTURE_URL = "/textures/wood-diff.jpg";

export type YutThrowSceneApi = {
  throwSticks: () => void;
  reset: () => void;
};

export type YutThrowSceneProps = {
  /** Called when all sticks settle. Each entry is true if that stick's flat side is up. */
  onResult?: (flats: boolean[]) => void;
  /** Called once during a throw (use it for sound triggers, etc.). */
  onThrowStart?: () => void;
};

function SceneSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#1c1614] text-amber-100/40 text-xs">
      Loading scene…
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Top-level scene                                                            */
/* -------------------------------------------------------------------------- */

export const YutThrowScene = forwardRef<YutThrowSceneApi, YutThrowSceneProps>(
  function YutThrowScene({ onResult, onThrowStart }, ref) {
    const stickRefs = useRef<(RapierRigidBody | null)[]>(
      Array(STICK_COUNT).fill(null),
    );
    const [throwing, setThrowing] = useState(false);
    const throwStartTime = useRef(0);

    const throwSticks = () => {
      onThrowStart?.();
      setThrowing(true);
      throwStartTime.current = performance.now();

      stickRefs.current.forEach((stick) => {
        if (!stick) return;
        stick.setTranslation(
          {
            x: (Math.random() - 0.5) * 0.7,
            y: 1.6 + Math.random() * 0.3,
            z: (Math.random() - 0.5) * 0.7,
          },
          true,
        );
        const q = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
          ),
        );
        stick.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true);
        stick.setLinvel(
          {
            x: (Math.random() - 0.5) * 2.5,
            y: 7 + Math.random() * 1.5,
            z: (Math.random() - 0.5) * 2.5,
          },
          true,
        );
        stick.setAngvel(
          {
            x: (Math.random() - 0.5) * 28,
            y: (Math.random() - 0.5) * 28,
            z: (Math.random() - 0.5) * 28,
          },
          true,
        );
        stick.wakeUp();
      });
    };

    const reset = () => {
      stickRefs.current.forEach((stick, i) => {
        if (!stick) return;
        stick.setTranslation(
          { x: (i - (STICK_COUNT - 1) / 2) * REST_GAP, y: 0.4, z: 0 },
          true,
        );
        stick.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
        stick.setLinvel({ x: 0, y: 0, z: 0 }, true);
        stick.setAngvel({ x: 0, y: 0, z: 0 }, true);
      });
      setThrowing(false);
    };

    useImperativeHandle(ref, () => ({ throwSticks, reset }));

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) return <SceneSkeleton />;

    return (
      <Canvas
        shadows
        camera={{ position: [0, 7, 7], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#1c1614"]} />

        {/* Image-based lighting — bounces warm/neutral light off everything */}
        <Environment preset="warehouse" background={false} environmentIntensity={0.7} />

        {/* Subtle key light for directional shape definition */}
        <directionalLight
          position={[6, 10, 4]}
          intensity={0.55}
          color="#fff2dd"
        />

        <Physics gravity={[0, -22, 0]}>
          <Floor />
          <Walls />
          {Array.from({ length: STICK_COUNT }).map((_, i) => (
            <YutStickBody
              key={i}
              index={i}
              setRef={(rb) => {
                stickRefs.current[i] = rb;
              }}
            />
          ))}
          <SettleDetector
            stickRefs={stickRefs}
            throwing={throwing}
            throwStartTime={throwStartTime}
            onSettled={(flats) => {
              setThrowing(false);
              onResult?.(flats);
            }}
          />
        </Physics>

        {/* Soft contact shadow under whatever's hovering above the floor */}
        <ContactShadows
          position={[0, 0.005, 0]}
          opacity={0.55}
          scale={12}
          blur={2.4}
          far={3}
          resolution={1024}
          frames={Infinity}
          color="#000"
        />
      </Canvas>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Floor + walls                                                              */
/* -------------------------------------------------------------------------- */

function Floor() {
  // Wood-like floor using procedural color (the wood texture lives on the sticks).
  return (
    <RigidBody type="fixed" friction={0.85} restitution={0.05}>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[14, 0.1, 14]} />
        <meshStandardMaterial color="#2b1f17" roughness={0.95} />
      </mesh>
      <CuboidCollider args={[7, 0.05, 7]} position={[0, -0.05, 0]} />
    </RigidBody>
  );
}

function Walls() {
  return (
    <RigidBody type="fixed" friction={0.4} restitution={0.3}>
      <CuboidCollider args={[0.05, 1.5, 5]} position={[5, 1.5, 0]} />
      <CuboidCollider args={[0.05, 1.5, 5]} position={[-5, 1.5, 0]} />
      <CuboidCollider args={[5, 1.5, 0.05]} position={[0, 1.5, 5]} />
      <CuboidCollider args={[5, 1.5, 0.05]} position={[0, 1.5, -5]} />
    </RigidBody>
  );
}

/* -------------------------------------------------------------------------- */
/* Stick body                                                                 */
/* -------------------------------------------------------------------------- */

function YutStickBody({
  index,
  setRef,
}: {
  index: number;
  setRef: (rb: RapierRigidBody | null) => void;
}) {
  const startX = (index - (STICK_COUNT - 1) / 2) * REST_GAP;
  const woodTex = useLoader(THREE.TextureLoader, WOOD_TEXTURE_URL);

  // Each stick gets a slightly different wood map orientation so they don't
  // look like clones.
  const flatTex = useMemo(() => {
    const t = woodTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.5, 1.5);
    t.offset.set(index * 0.13, 0);
    t.needsUpdate = true;
    return t;
  }, [woodTex, index]);

  const roundTex = useMemo(() => {
    const t = woodTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.5, 1.5);
    t.offset.set(index * 0.13 + 0.5, 0);
    t.needsUpdate = true;
    return t;
  }, [woodTex, index]);

  const sideTex = useMemo(() => {
    const t = woodTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.2, 1.5);
    t.offset.set(index * 0.07, 0);
    t.needsUpdate = true;
    return t;
  }, [woodTex, index]);

  const endTex = useMemo(() => {
    const t = woodTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.4, 0.2);
    t.offset.set(0.1 + index * 0.07, 0.1);
    t.needsUpdate = true;
    return t;
  }, [woodTex, index]);

  return (
    <RigidBody
      ref={setRef}
      colliders="cuboid"
      friction={0.65}
      restitution={0.18}
      mass={0.4}
      angularDamping={0.4}
      linearDamping={0.15}
      position={[startX, 0.4, 0]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[STICK_W, STICK_H, STICK_L]} />
        {/* Order: +X, -X, +Y (top = flat), -Y (bottom = round), +Z, -Z */}
        <meshStandardMaterial
          attach="material-0"
          map={endTex}
          color="#a07852"
          roughness={0.65}
        />
        <meshStandardMaterial
          attach="material-1"
          map={endTex}
          color="#a07852"
          roughness={0.65}
        />
        {/* Flat side — light, lifted */}
        <meshStandardMaterial
          attach="material-2"
          map={flatTex}
          color="#f0d8a0"
          roughness={0.55}
        />
        {/* Round side — dark, shadowed */}
        <meshStandardMaterial
          attach="material-3"
          map={roundTex}
          color="#5c3a22"
          roughness={0.8}
        />
        <meshStandardMaterial
          attach="material-4"
          map={sideTex}
          color="#8b5e3c"
          roughness={0.7}
        />
        <meshStandardMaterial
          attach="material-5"
          map={sideTex}
          color="#8b5e3c"
          roughness={0.7}
        />
      </mesh>
    </RigidBody>
  );
}

/* -------------------------------------------------------------------------- */
/* Settle detection                                                           */
/* -------------------------------------------------------------------------- */

const TMP_QUAT = new THREE.Quaternion();
const LOCAL_FLAT_NORMAL = new THREE.Vector3(0, 1, 0);

function SettleDetector({
  stickRefs,
  throwing,
  throwStartTime,
  onSettled,
}: {
  stickRefs: RefObject<(RapierRigidBody | null)[]>;
  throwing: boolean;
  throwStartTime: RefObject<number>;
  onSettled: (flats: boolean[]) => void;
}) {
  const detected = useRef(false);

  useEffect(() => {
    if (throwing) detected.current = false;
  }, [throwing]);

  useFrame(() => {
    if (!throwing || detected.current) return;
    const elapsed = performance.now() - (throwStartTime.current || 0);
    if (elapsed < 800) return;

    const sticks = stickRefs.current ?? [];
    if (sticks.length === 0) return;

    let allSettled = true;
    for (const s of sticks) {
      if (!s) {
        allSettled = false;
        break;
      }
      const lv = s.linvel();
      const av = s.angvel();
      const linSpeed = Math.hypot(lv.x, lv.y, lv.z);
      const angSpeed = Math.hypot(av.x, av.y, av.z);
      if (linSpeed > 0.05 || angSpeed > 0.12) {
        allSettled = false;
        break;
      }
    }

    if (allSettled) {
      detected.current = true;
      const flats = sticks.map((s) => {
        if (!s) return false;
        const r = s.rotation();
        TMP_QUAT.set(r.x, r.y, r.z, r.w);
        const worldUp = LOCAL_FLAT_NORMAL.clone().applyQuaternion(TMP_QUAT);
        return worldUp.y > 0;
      });
      onSettled(flats);
    }
  });

  return null;
}
