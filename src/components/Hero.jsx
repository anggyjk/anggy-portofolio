import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  Html,
  OrbitControls,
  useAnimations,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import BloodDrips from "./BloodDrips";
import Typewriter from "./Typewriter";

const EASE = [0.16, 1, 0.3, 1];
// Patung Lilith — file ada di public/lilith.glb (disalin ke dist apa adanya).
// Model Sketchfab "Lilith": marmer putih + ular Leviathan hitam + halo bawaan.
const MODEL_URL = "/lilith.glb";

/* Ukuran megah & posisi: patung dinormalisasi ke tinggi STATUE_SIZE
   (aman untuk ukuran asli .glb apapun — Lilith ±1.7 unit + rotasi Z-up).
   STATUE_Y dalam = alas tenggelam dan larut mulus di kabut bawah. */
const STATUE_SIZE = 4.6;
const STATUE_Y = -3.25;
/* Kepala patung ≈ sepertiga atas (untuk penempatan halo ring tambahan).
   Lilith sudah punya WhiteHalo/BlackHalo bawaan; ring di sini berfungsi
   sebagai orbital line emas + merah ala referensi. HALO_Y ikut skala
   STATUE_SIZE agar selalu pas di kepala. */
const HALO_Y = STATUE_SIZE * (1.18 / 3.6);

/* Material asli Lilith dipertahankan (marmer putih + tekstur), JANGAN
   dioverride jadi gelap. Yang dibunuh hanya emissive putih bawaan
   Sketchfab (base emissive [1,1,1]) agar badan tidak meledak kena Bloom —
   kecuali mesh halo yang memang harus menyala. */
function enhanceLilithMaterials(scene) {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    // Patung utama selalu di depan halo belakang (halo renderOrder = 1).
    o.renderOrder = 2;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (!m) return;
      const name = (m.name || "").toLowerCase();
      const isHalo = name.includes("halo");
      if (isHalo) {
        // Halo bawaan: biarkan menyala agar ditangkap Bloom jadi pendaran.
        if ("emissiveIntensity" in m) m.emissiveIntensity = 2.4;
        if ("envMapIntensity" in m) m.envMapIntensity = 1.0;
      } else {
        // Badan / kain / ular: matikan emissive, jaga tekstur asli.
        // Patung opaque: depth penuh agar halo belakang terhalang dengan benar.
        if (!m.transparent) {
          m.depthWrite = true;
          m.depthTest = true;
        } else {
          m.depthTest = true;
        }
        if (m.emissive) m.emissive.set("#000000");
        if ("emissiveIntensity" in m) m.emissiveIntensity = 0;
        if ("envMapIntensity" in m) m.envMapIntensity = 0.65;
        // Ular Leviathan: pertahankan kilau glossy agar rim light memisah.
        if (name.includes("leviathan") && "roughness" in m) {
          m.roughness = Math.min(m.roughness ?? 0.3, 0.32);
        }
      }
      m.needsUpdate = true;
    });
  });
}

/* ---------- Error boundary: GLB corrupt -> fallback prosedural ---------- */
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("[Hero3D] lilith.glb gagal dimuat, pakai fallback prosedural.", err);
    this.props.onError?.();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          fontSize: 12,
          letterSpacing: 3,
          color: "var(--muted)",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}
      >
        Memahat obsidian… {Math.round(progress)}%
      </div>
    </Html>
  );
}

/* Indikator loading HTML di luar canvas: terlihat jelas selama 21MB diunduh. */
function LoadOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  const pct = Math.round(progress);
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "50%",
        bottom: 26,
        transform: "translateX(-50%)",
        zIndex: 3,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 999,
        padding: "9px 18px",
        fontSize: 11,
        letterSpacing: 3,
        color: "var(--muted)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 12px rgba(255,43,43,0.9)",
          animation: "loadPulse 1.2s ease-in-out infinite",
        }}
      />
      MEMAHAT LILITH… {pct}%
      <style>{`@keyframes loadPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}

/* ---------- Patung Lilith dari /lilith.glb (statis, tanpa animasi) ---------- */
function LilithStatue({ reduce }) {
  const group = useRef(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = STATUE_SIZE / maxDim;
    return { scale: s, offset: [-center.x * s, -center.y * s, -center.z * s] };
  }, [scene]);

  useEffect(() => {
    enhanceLilithMaterials(scene);
  }, [scene]);

  useEffect(() => {
    if (reduce) return;
    const clips = Object.values(actions);
    if (!clips.length) return;
    const first = clips[0];
    first?.reset().fadeIn(0.8).play();
    return () => {
      clips.forEach((a) => {
        try {
          a?.fadeOut(0.5);
        } catch {
          /* abaikan */
        }
      });
    };
  }, [actions, reduce]);

  return (
    <group ref={group}>
      <group scale={scale} position={offset}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/* ---------- Halo ring / orbital lines 3D ala referensi ----------
   - 1 halo emas vertikal tepat di belakang kepala (menyatu via Bloom).
   - 2 orbit merah atomic miring mengelilingi tubuh (seperti referensi).
   - Node merah menyala di ujung orbit + piringan cahaya billboard. */
function HaloRings({ reduce }) {
  const orbit = useRef(null);
  const r1 = useRef(null);
  const r2 = useRef(null);
  const r3 = useRef(null);
  const disc = useRef(null);
  const nodes = useRef(null);

  useFrame(({ clock, camera }, delta) => {
    const t = clock.elapsedTime;
    if (reduce) return;
    if (orbit.current) {
      // Rotasi Y grup dimatikan agar halo emas (z = -1.5) tidak mengayun ke depan.
      // Garis merah tetap bebas melilit via rotasi-z masing-masing + nodes.
      orbit.current.position.y = HALO_Y + Math.sin(t * 1.1) * 0.04;
    }
    if (r1.current) r1.current.rotation.z += delta * 0.35;
    if (r2.current) r2.current.rotation.z -= delta * 0.28;
    if (r3.current) r3.current.rotation.z += delta * 0.18;
    if (nodes.current) nodes.current.rotation.y -= delta * 0.3;
    // Piringan cahaya selalu menghadap kamera (billboard)
    if (disc.current) disc.current.quaternion.copy(camera.quaternion);
  });

  const nodeMat = (
    <meshStandardMaterial
      color="#2a0505"
      emissive="#ff2b2b"
      emissiveIntensity={3.2}
      roughness={0.3}
      metalness={0.1}
    />
  );

  return (
    <group ref={orbit} position={[0, HALO_Y, 0]}>
      {/* halo emas — lingkaran suci MURNI di belakang kepala (z = -1.5).
          depthWrite false + depthTest true: tidak menimpa wajah/badan/ular,
          tapi terhalang patung dengan benar. */}
      <mesh ref={r1} position={[0, 0, -1.5]} renderOrder={1} rotation={[0.08, 0, 0]}>
        <torusGeometry args={[0.85, 0.022, 12, 96]} />
        <meshStandardMaterial
          color="#3a2a10"
          emissive="#ffd9a0"
          emissiveIntensity={2.6}
          roughness={0.35}
          metalness={0.4}
          transparent
          opacity={0.98}
          depthWrite={false}
          depthTest
        />
      </mesh>
      {/* orbit merah atomic 1 — miring ala referensi */}
      <mesh ref={r2} rotation={[Math.PI / 2.25, 0, 0.35]}>
        <torusGeometry args={[1.5, 0.012, 10, 110]} />
        <meshStandardMaterial
          color="#3a0a0a"
          emissive="#ff2b2b"
          emissiveIntensity={2.4}
          roughness={0.4}
          metalness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* orbit merah atomic 2 — silang berlawanan */}
      <mesh ref={r3} rotation={[Math.PI / 1.75, 0.25, -0.5]}>
        <torusGeometry args={[1.85, 0.01, 10, 110]} />
        <meshStandardMaterial
          color="#3a0a0a"
          emissive="#ff3b1f"
          emissiveIntensity={1.9}
          roughness={0.4}
          metalness={0.2}
          transparent
          opacity={0.75}
        />
      </mesh>
      {/* node merah menyala di orbit (titik-titik ala referensi) */}
      <group ref={nodes}>
        <mesh position={[1.5, 0.15, 0.1]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          {nodeMat}
        </mesh>
        <mesh position={[-1.35, -0.2, 0.35]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          {nodeMat}
        </mesh>
        <mesh position={[0.4, 0.5, -1.15]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          {nodeMat}
        </mesh>
      </group>
      {/* piringan cahaya lembut — ikut mundur ke belakang patung */}
      <mesh ref={disc} renderOrder={1} position={[0, 0, -1.5]}>
        <circleGeometry args={[0.8, 48]} />
        <meshBasicMaterial
          color="#ff9a5c"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ---------- Mouse parallax: model menoleh halus mengikuti kursor ----------
   Smooth lerp framerate-independent agar terasa "bernapas", bukan kaku. */
function ParallaxRig({ reduce, children }) {
  const ref = useRef(null);
  const cur = useRef({ x: 0, y: 0 });
  useFrame(({ pointer }, delta) => {
    if (!ref.current) return;
    if (reduce) {
      ref.current.rotation.set(0, 0, 0);
      return;
    }
    const tx = THREE.MathUtils.clamp(pointer.x, -1, 1) * 0.36;
    const ty = THREE.MathUtils.clamp(pointer.y, -1, 1) * -0.15;
    const k = 1 - Math.exp(-4 * delta); // lerp halus, framerate-independent
    cur.current.x += (tx - cur.current.x) * k;
    cur.current.y += (ty - cur.current.y) * k;
    ref.current.rotation.y = cur.current.x;
    ref.current.rotation.x = cur.current.y;
  });
  return <group ref={ref}>{children}</group>;
}

/* EmberPoints kotak dihapus — diganti Smoke/Mist + Cosmic Dust */













/* ---------- Background Layer: Smoke/Mist — kabut gelap kemerahan tipis ----------
   Di area bawah + belakang patung, bergerak sangat lambat (volumetric mist).
   Dibuat jarang + samar agar transisi bawah patung larut ke background,
   fokus tetap di model 3D dan teks kiri. */
function SmokePuffs({ count = 16, reduce }) {
  const group = useRef(null);

  // Tekstur gumpalan asap dari canvas: beberapa blob radial agar tidak bulat sempurna.
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    const blobs = [
      [64, 70, 46], [48, 58, 30], [80, 58, 30],
      [64, 44, 26], [52, 82, 24], [78, 80, 24],
    ];
    blobs.forEach(([x, y, r]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    });
    return new THREE.CanvasTexture(c);
  }, []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        // Bawah + belakang patung: y rendah, z negatif (di belakang model).
        x: (Math.random() - 0.5) * 4.4,
        y: -1.9 + Math.random() * 2.4,
        z: -1.8 + Math.random() * 1.2,
        // Gumpalan besar agar jadi hamparan kabut, bukan titik asap.
        s: 3.0 + Math.random() * 2.5,
        rise: 0.02 + Math.random() * 0.035,
        ph: Math.random() * Math.PI * 2,
        dir: Math.random() > 0.5 ? 1 : -1,
      })),
    [count]
  );

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock, camera }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const kids = group.current.children;
    for (let i = 0; i < kids.length; i++) {
      const m = kids[i];
      const sd = seeds[i];
      if (!reduce) {
        // Naik sangat lambat + goyang horizontal pelan, daur ulang dari bawah.
        const span = 2.8;
        const y = -2.0 + ((((sd.y + t * sd.rise + 2.0) % span) + span) % span);
        m.position.set(
          sd.x + Math.sin(t * 0.15 + sd.ph) * 0.45,
          y,
          sd.z + Math.cos(t * 0.12 + sd.ph) * 0.15
        );
      }
      // Billboard: selalu menghadap kamera, lalu putar sangat pelan.
      m.quaternion.copy(camera.quaternion);
      if (!reduce) m.rotateZ(sd.ph + t * 0.015 * sd.dir);
    }
  });

  return (
    <group ref={group}>
      {seeds.map((sd, i) => (
        <mesh key={i} position={[sd.x, sd.y, sd.z]} scale={sd.s}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            color={i % 3 === 0 ? "#6b4444" : "#4a383a"}
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Foreground Layer: Cosmic Dust — debu bulat lembut ----------
   Partikel kecil semi-transparan melayang acak pelan ke seluruh area canvas
   (termasuk depan model, dekat kamera → parallax halus). Sengaja jarang +
   redup agar fokus tetap di model 3D dan teks kiri. */
function CosmicDust({ count = 110, reduce }) {
  const group = useRef(null);

  // Tekstur lingkaran lembut: inti terang + tepi luruh.
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * 7,
        y: -2.2 + Math.random() * 4.4,
        // Depan model (positif = ke arah kamera) agar jadi foreground.
        z: 0.4 + Math.random() * 2.2,
        s: 0.03 + Math.random() * 0.06,
        ph: Math.random() * Math.PI * 2,
        drift: 0.03 + Math.random() * 0.06,
        tw: 0.5 + Math.random() * 1.5,
        tone: i % 4 === 0 ? "#ffd9a8" : i % 4 === 1 ? "#ff9a7a" : "#cfc8c2",
      })),
    [count]
  );

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock, camera }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const kids = group.current.children;
    for (let i = 0; i < kids.length; i++) {
      const m = kids[i];
      const sd = seeds[i];
      if (!reduce) {
        // Hanyut acak lambat ke segala arah + kedip skala halus.
        m.position.set(
          sd.x + Math.sin(t * sd.drift + sd.ph) * 0.5 + t * 0.008 * Math.sin(sd.ph),
          sd.y + Math.cos(t * sd.drift * 0.8 + sd.ph) * 0.4,
          sd.z
        );
        const s = sd.s * (0.75 + 0.25 * Math.sin(t * sd.tw + sd.ph));
        m.scale.setScalar(Math.max(s, 0.008));
      }
      m.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={group}>
      {seeds.map((sd, i) => (
        <mesh key={i} position={[sd.x, sd.y, sd.z]} scale={sd.s}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            color={sd.tone}
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Fallback prosedural (dipakai hanya kalau .glb gagal) ---------- */
function FallbackEmbers({ count = 26, reduce }) {
  const ref = useRef(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 0.5 + Math.sin(i * 78.233) * 0.5) * 1.6,
        y: (i / count) * 3 - 1.2,
        z: Math.cos(i * 37.719) * 0.5 * 1.4 - 0.3,
        s: 0.5 + ((i * 37) % 10) / 14,
        o: (i * 61) % 100,
      })),
    [count]
  );
  useFrame(({ clock }) => {
    if (reduce || !ref.current) return;
    const t = clock.elapsedTime;
    const g = ref.current;
    for (let i = 0; i < g.children.length; i++) {
      const m = g.children[i];
      const sd = seeds[i];
      const rise = ((t * 0.22 * sd.s + sd.o / 100) % 1.4) * 2.2 - 1.2;
      m.position.set(sd.x + Math.sin(t * 0.9 + sd.o) * 0.12, rise, sd.z + Math.cos(t * 0.7 + sd.o) * 0.1);
      m.scale.setScalar(0.02 + sd.s * 0.022 * (0.7 + 0.3 * Math.sin(t * 3 + sd.o)));
    }
  });
  return (
    <group ref={ref}>
      {seeds.map((sd, i) => (
        <mesh key={i} position={[sd.x, sd.y, sd.z]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={i % 3 === 0 ? "#ff6a00" : "#ff2b2b"} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function FallbackWing({ side = 1 }) {
  const mat = (
    <meshStandardMaterial color="#0d0b0d" emissive="#4a0a0a" emissiveIntensity={0.4} roughness={0.35} metalness={0.7} side={2} />
  );
  return (
    <group>
      <mesh castShadow position={[side * 0.62, 0.28, -0.1]} rotation={[0.15, side * 0.5, side * -0.5]}>
        <boxGeometry args={[1.15, 0.06, 0.5]} />
        {mat}
      </mesh>
      <mesh castShadow position={[side * 0.78, -0.05, -0.12]} rotation={[0.1, side * 0.35, side * -0.25]}>
        <boxGeometry args={[1.0, 0.05, 0.42]} />
        {mat}
      </mesh>
      <mesh castShadow position={[side * 0.6, -0.34, -0.1]} rotation={[0.05, side * 0.25, side * -0.1]}>
        <boxGeometry args={[0.72, 0.05, 0.34]} />
        {mat}
      </mesh>
    </group>
  );
}

function FallbackDevil({ reduce }) {
  const root = useRef(null);
  const body = useRef(null);
  const wingL = useRef(null);
  const wingR = useRef(null);
  useFrame(({ clock }) => {
    if (reduce) return;
    const t = clock.elapsedTime;
    if (body.current) {
      body.current.scale.set(1 + Math.sin(t * 1.8) * 0.02, 1 + Math.sin(t * 1.8) * 0.035, 1);
      body.current.position.y = Math.sin(t * 1.8) * 0.05;
    }
    const flap = Math.sin(t * 2.4) * 0.38;
    if (wingL.current) wingL.current.rotation.z = 0.25 + flap;
    if (wingR.current) wingR.current.rotation.z = -0.25 - flap;
    if (root.current) root.current.position.y = Math.sin(t * 1.2) * 0.07;
  });
  const marble = <meshStandardMaterial color="#2a2a2a" roughness={0.35} metalness={0.15} />;
  return (
    <group ref={root} position={[0, -0.15, 0]}>
      <group ref={body}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.34, 0.85, 8, 20]} />
          {marble}
        </mesh>
        <group position={[0, 1.0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 28, 28]} />
            {marble}
          </mesh>
          <mesh castShadow position={[-0.32, 0.28, 0]} rotation={[0, 0, 0.7]}>
            <coneGeometry args={[0.09, 0.55, 12]} />
            {marble}
          </mesh>
          <mesh castShadow position={[0.32, 0.28, 0]} rotation={[0, 0, -0.7]}>
            <coneGeometry args={[0.09, 0.55, 12]} />
            {marble}
          </mesh>
          <mesh position={[-0.11, 0.05, 0.26]}>
            <sphereGeometry args={[0.05, 14, 14]} />
            <meshStandardMaterial color="#ff2b2b" emissive="#ff2b2b" emissiveIntensity={3} />
          </mesh>
          <mesh position={[0.11, 0.05, 0.26]}>
            <sphereGeometry args={[0.05, 14, 14]} />
            <meshStandardMaterial color="#ff2b2b" emissive="#ff2b2b" emissiveIntensity={3} />
          </mesh>
        </group>
      </group>
      <group ref={wingL} position={[-0.3, 0.55, -0.25]}>
        <FallbackWing side={-1} />
      </group>
      <group ref={wingR} position={[0.3, 0.55, -0.25]}>
        <FallbackWing side={1} />
      </group>
      <FallbackEmbers reduce={reduce} />
    </group>
  );
}

/* ---------- Rig patung: posisi kanan + float idle + parallax ---------- */
function StatueRig({ reduce, statueX, children }) {
  return (
    <group position={[statueX, STATUE_Y, 0]}>
      {/* Idle floating pelan (sine wave) — objek terasa bernapas dan hidup */}
      <Float speed={reduce ? 0 : 1.0} rotationIntensity={0.06} floatIntensity={0.32}>
        <ParallaxRig reduce={reduce}>{children}</ParallaxRig>
      </Float>
      {/* Hanya Smoke/Mist (belakang+bawah) + Cosmic Dust (depan) — tanpa titik kotak */}
      <SmokePuffs reduce={reduce} />
      <CosmicDust reduce={reduce} />
      <ContactShadows position={[0, -1.35, 0]} opacity={0.85} scale={12} blur={1.1} far={3.5} color="#000000" />
    </group>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [modelFailed, setModelFailed] = useState(false);

  // Patung di kanan frame (kanvas full-bleed); mobile di tengah di balik teks.
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 900
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const fn = (e) => setIsNarrow(e.matches);
    fn(mq);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  // Patung besar di kanan tapi tangan terentang menimpa teks ANZY (ala referensi).
  const statueX = isNarrow ? 0 : 0.7;

  return (
    <section
      id="home"
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: 92,
      }}
    >
      {/* ambient merah di belakang patung (kanan) */}
      <motion.div aria-hidden="true" style={{ y: bgY, position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          className="hero-ambient"
          style={{ position: "absolute", left: "70%", top: "42%", width: 640, height: 640, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(120,10,10,0.30), rgba(255,43,43,0.07) 55%, transparent 70%)", filter: "blur(28px)" }}
        />
      </motion.div>

      <motion.div style={{ opacity: fade, width: "100%", paddingLeft: "max(24px, 6vw)", paddingRight: 24 }} className="hero-full">
        {/* ===== Layout referensi: kanvas full-bleed, teks raksasa overlap di kiri ===== */}
        <div className="hero-split">
          {/* ---------- Teks overlay kiri (di atas kanvas, pointer-events none agar drag 3D tembus) ---------- */}
          <div className="hero-left" style={{ position: "relative", zIndex: 3, textAlign: "left", pointerEvents: "none" }}>
            {/* ANZY putih + KURNIAWAN merah — animasi mengetik loop */}
            <Typewriter />

            {/* Darah menetes dari huruf raksasa */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.55 }}
              aria-hidden="true"
              style={{ marginTop: 10 }}
            >
              <BloodDrips count={7} width="min(320px, 78vw)" height={54} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
              style={{
                fontFamily: "var(--font-hero)",
                fontSize: "clamp(2.4rem, 4.6vw, 4.2rem)",
                letterSpacing: "0.03em",
                marginTop: 26,
                color: "#fff",
                textShadow: "0 2px 26px rgba(0,0,0,0.9)",
              }}
            >
              № — 001
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              style={{
                fontSize: "clamp(1.05rem, 1.7vw, 1.35rem)",
                margin: "14px 0 0",
                color: "#c9c9d1",
                textShadow: "0 2px 22px rgba(0,0,0,0.9)",
              }}
            >
              Creative Developer / Artist
            </motion.p>

            <motion.a
              href="#works"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              style={{
                display: "inline-block",
                marginTop: "clamp(48px, 9vh, 110px)",
                fontSize: 17,
                color: "#f0f0f0",
                textDecoration: "none",
                letterSpacing: "0.02em",
                pointerEvents: "auto",
              }}
            >
              Explore Works
            </motion.a>
          </div>

          {/* ---------- Kanvas 3D full-bleed di belakang teks ---------- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
            className="hero-3d-wrap"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              width: "100%",
              maxWidth: "none",
              height: "100%",
              cursor: "grab",
              background: "transparent",
              border: 0,
              boxShadow: "none",
            }}
          >
            <Canvas
              shadows
              dpr={[1, 2]}
              // Medium shot kepala–paha ala referensi, patung di kanan via statueX.
              camera={{ position: [0, STATUE_Y + 0.95, 4.2], fov: 40 }}
              gl={{ alpha: true, antialias: true }}
              style={{ background: "transparent", touchAction: "pan-y" }}
            >
              <fog attach="fog" args={["#080808", 4, 13]} />

              {/* Ambient lembut — marmer putih tidak blowout */}
              <ambientLight intensity={0.45} />
              {/* Key putih/silver dari depan-atas — tekstur marmer crisp */}
              <directionalLight
                position={[5, 8, 5]}
                intensity={1.7}
                color="#f2f4ff"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0004}
                shadow-camera-near={0.5}
                shadow-camera-far={25}
                shadow-camera-left={-6}
                shadow-camera-right={6}
                shadow-camera-top={6}
                shadow-camera-bottom={-6}
              />
              {/* Rim GOLD terang dari belakang-kiri — kontur patung memisah dari bg */}
              <directionalLight position={[-4, 3.5, -4.5]} intensity={2.6} color="#ffd9a0" />
              {/* Rim crimson dari belakang-kanan — lekukan ular tajam */}
              <directionalLight position={[4, 1.5, -4]} intensity={1.8} color="#ff2b2b" />
              {/* Rim putih tipis dari atas-belakang — halo menyatu */}
              <pointLight position={[0.6, HALO_Y + 0.6, -1.6]} intensity={6} distance={7} color="#fff1d6" />
              {/* Bara merah dari bawah/belakang */}
              <pointLight position={[0, -3, -2]} intensity={5} distance={10} color="#ff1a1a" />
              <spotLight position={[-3, -1, 3]} intensity={1.6} angle={0.6} penumbra={0.8} distance={12} color="#ff3300" />

              {modelFailed ? (
                <StatueRig reduce={reduce} statueX={statueX}>
                  <FallbackDevil reduce={reduce} />
                </StatueRig>
              ) : (
                <Suspense fallback={<Loader />}>
                  <ModelErrorBoundary onError={() => setModelFailed(true)}>
                    <StatueRig reduce={reduce} statueX={statueX}>
                      <LilithStatue reduce={reduce} />
                      {/* Halo ring + orbital 3D melingkari kepala — menyatu via Bloom */}
                      <HaloRings reduce={reduce} />
                    </StatueRig>
                  </ModelErrorBoundary>
                </Suspense>
              )}

              {/* Bloom halus (threshold tinggi: hanya halo/orbit/bara yang glow,
                  marmer putih tetap crisp) + vignette sinematik */}
              <EffectComposer multisampling={4}>
                <Bloom mipmapBlur intensity={0.65} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
                <Vignette offset={0.2} darkness={0.85} />
              </EffectComposer>

              <OrbitControls
                makeDefault
                enableZoom={false}
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
                rotateSpeed={0.9}
                autoRotate={false}
                target={[0, STATUE_Y + 0.85, 0]}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>

            {/* Persen loading patung (di luar canvas, selalu terlihat) */}
            <LoadOverlay />

            {/* Overlay 4 sisi: kiri (teks→3D) + kanan + atas + bawah.
                Tepi canvas larut total ke background, tanpa garis kotak. */}
            <div
              aria-hidden="true"
              className="hero-blend"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 2,
                background:
                  "linear-gradient(90deg, #080808 0%, rgba(8,8,8,0.85) 18%, rgba(8,8,8,0.3) 34%, rgba(8,8,8,0) 55%), linear-gradient(270deg, #080808 0%, rgba(8,8,8,0) 16%), linear-gradient(0deg, #080808 6%, rgba(8,8,8,0) 38%), linear-gradient(180deg, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0) 22%)",
              }}
            />

          </motion.div>
        </div>
      </motion.div>

      <style>{`
        /* Layout referensi: kanvas absolute full-bleed, teks overlay */
        .hero-split { position: relative; display: block; }
        .hero-left { padding: 110px 0 64px; max-width: none; }
        .hero-left .hero-name { font-size: clamp(5rem, 18.5vw, 20rem); }
        .hero-left .hero-line-2 { font-size: 0.44em; }
        .hero-3d-wrap canvas { display: block; }
        /* Feather tepi canvas: render 3D larut ke background, tanpa garis kotak. */
        .hero-3d-wrap canvas {
          -webkit-mask-image: radial-gradient(ellipse 92% 90% at 58% 46%, #000 60%, transparent 84%);
          mask-image: radial-gradient(ellipse 92% 90% at 58% 46%, #000 60%, transparent 84%);
        }
        .hero-3d-wrap:active { cursor: grabbing; }
        @media (max-width: 899px) {
          .hero-left { padding: 124px 0 64px; }
          .hero-left .hero-name { font-size: clamp(4rem, 21vw, 7rem); }
          .hero-ambient { left: 50% !important; }
          .hero-name { overflow-wrap: anywhere; }
        }
      `}</style>
    </section>
  );
}

useGLTF.preload(MODEL_URL);
