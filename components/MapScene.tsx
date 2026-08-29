'use client';

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { amenities } from '@/data/amenities';
import { AMENITY_GROUPS } from '@/lib/amenity-groups';
import { btoProjects } from '@/data/bto-projects';
import { workHubs } from '@/data/work-hubs';
import {
  FALLBACK_BOUNDS, FOCUS_ELEVATION, FOCUS_SAFE_INSETS, KEY_PAN_EASE_SECONDS,
  KEY_PAN_PX_PER_SECOND, OVERVIEW_AZIMUTH, OVERVIEW_ELEVATION, ZOOM_EASE_SECONDS, approach,
  clampTarget, clampZoom, isEditableTarget, keyPanDirection, orbitFromOffset, orbitOffset,
  panDisplacement, wheelZoomFactor, zoomAboutCursor, zoomBounds,
} from '@/lib/camera';
import { geoToScenePosition, ONE_KM_SCENE_RADIUS } from '@/lib/geo';
import { HEIGHT_SCALE, LINE_CLASS, buildBuildingGeometry, buildCoastWallGeometry, buildRibbonGeometry, linesOfClass, loadMapAssets, type MapAssets } from '@/lib/map-assets';
import type { PlaceHighlight } from '@/lib/map-format';
import { projectOpacity } from '@/lib/matching';
import type { Amenity, AmenityGroup, BtoProject, ProjectMatch } from '@/lib/types';
import './map-scene.css';

interface MapSceneProps {
  matches: Record<string, ProjectMatch>;
  visibleGroups: AmenityGroup[];
  selectedProjectId: string | null;
  customPin: [number, number] | null;
  pinMode: boolean;
  launchStatusFilter: 'all' | BtoProject['launchStatus'];
  onProjectSelect: (id: string) => void;
  onAmenitySelect: (amenity: Amenity) => void;
  onGroundSelect: (position: [number, number]) => void;
}

const BACKGROUND = '#050b12';

type FocusUniform = { value: THREE.Vector4 };
type ScalarUniform = { value: number };
type SharedUniforms = { focus: FocusUniform; widthScale: ScalarUniform };
type Controls = { target: THREE.Vector3; update: () => void; addEventListener: (type: string, listener: () => void) => void; removeEventListener: (type: string, listener: () => void) => void };

const prefersReducedMotion = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const hash01 = (text: string) => { let h = 2166136261; for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };

/* ----------------------------------------------------------------------------------------------- */
/* Shared shader pieces                                                                              */
/* ----------------------------------------------------------------------------------------------- */

const focusShaderChunk = /* glsl */ `
  float focusDistance = distance(vMapWorld.xz, uFocus.xy);
  float focusOutside = smoothstep(uFocus.z, uFocus.z * 1.9, focusDistance);
  float focusDim = mix(1.0, 0.36, focusOutside * uFocus.w);
`;

/** Dims fragments outside the selected 1 km circle without removing them from the skyline. */
function applyFocusDimming(material: THREE.Material, focus: FocusUniform) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFocus = focus;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMapWorld;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvMapWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec4 uFocus;\nvarying vec3 vMapWorld;')
      .replace('#include <color_fragment>', `#include <color_fragment>\n${focusShaderChunk}\ndiffuseColor.rgb *= focusDim;`);
  };
  material.customProgramCacheKey = () => 'map-focus';
}

const ribbonVertex = /* glsl */ `
  attribute float aSide;
  attribute vec2 aOffset;
  uniform float uWidthScale;
  varying float vSide;
  varying vec3 vMapWorld;
  #include <fog_pars_vertex>
  void main() {
    vSide = aSide;
    vec4 worldPosition = modelMatrix * vec4(position.x + aOffset.x * uWidthScale, position.y, position.z + aOffset.y * uWidthScale, 1.0);
    vMapWorld = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const ribbonFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uCore;
  uniform vec4 uFocus;
  varying float vSide;
  varying vec3 vMapWorld;
  #include <fog_pars_fragment>
  void main() {
    float edge = 1.0 - smoothstep(0.3, 1.0, abs(vSide));
    float core = 1.0 - smoothstep(0.0, 0.4, abs(vSide));
    ${focusShaderChunk}
    float alpha = uOpacity * edge * focusDim;
    #ifdef USE_FOG
      float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
      alpha *= 1.0 - fogFactor;
    #endif
    gl_FragColor = vec4(uColor * (1.0 + core * uCore), alpha);
  }
`;

function ribbonMaterial(hex: string, intensity: number, opacity: number, core: number, shared: SharedUniforms): THREE.ShaderMaterial {
  const color = new THREE.Color(hex).multiplyScalar(intensity);
  const material = new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uColor: { value: color }, uOpacity: { value: opacity }, uCore: { value: core }, uFocus: shared.focus, uWidthScale: shared.widthScale },
    vertexShader: ribbonVertex,
    fragmentShader: ribbonFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: true,
    toneMapped: false,
  });
  return material;
}

/* ----------------------------------------------------------------------------------------------- */
/* Assets                                                                                            */
/* ----------------------------------------------------------------------------------------------- */

function useMapAssets(): MapAssets | null {
  const [assets, setAssets] = useState<MapAssets | null>(null);
  useEffect(() => {
    let active = true;
    loadMapAssets().then((loaded) => { if (active) setAssets(loaded); }).catch((error) => console.error('Map assets failed to load', error));
    return () => { active = false; };
  }, []);
  return assets;
}

const skip = () => null;

function Terrain({ assets, shared }: { assets: MapAssets; shared: SharedUniforms }) {
  const focus = shared.focus;
  const { coastWall, coast, district } = useMemo(() => ({
    coastWall: buildCoastWallGeometry(linesOfClass(assets.lines, LINE_CLASS.coast), 0.34),
    coast: buildRibbonGeometry(linesOfClass(assets.lines, LINE_CLASS.coast), 0.009, 0.012),
    district: buildRibbonGeometry(linesOfClass(assets.lines, LINE_CLASS.district), 0.006, 0.011),
  }), [assets]);
  const materials = useMemo(() => {
    const land = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
    applyFocusDimming(land, focus);
    return {
      land,
      coastLine: ribbonMaterial('#8fd2dc', 0.42, 0.6, 0.3, shared),
      districtLine: ribbonMaterial('#5b7f86', 0.22, 0.45, 0, shared),
    };
  }, [focus, shared]);
  useEffect(() => () => { coastWall.dispose(); coast.dispose(); district.dispose(); Object.values(materials).forEach((m) => m.dispose()); }, [coastWall, coast, district, materials]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.34, 0]} receiveShadow raycast={skip}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#08131f" roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh geometry={assets.land} material={materials.land} receiveShadow raycast={skip} />
      <mesh geometry={coastWall} raycast={skip}>
        <meshStandardMaterial color="#141f27" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={assets.green} position={[0, 0.004, 0]} raycast={skip}>
        <meshStandardMaterial color="#0f1b17" roughness={1} />
      </mesh>
      <mesh geometry={coast} material={materials.coastLine} raycast={skip} />
      <mesh geometry={district} material={materials.districtLine} raycast={skip} />
    </group>
  );
}

function Buildings({ assets, focus, onReady }: { assets: MapAssets; focus: FocusUniform; onReady: () => void }) {
  const [geometries, setGeometries] = useState<THREE.BufferGeometry[]>([]);
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92, metalness: 0.04 });
    applyFocusDimming(m, focus);
    return m;
  }, [focus]);
  useEffect(() => {
    let cancelled = false;
    const built: THREE.BufferGeometry[] = [];
    const tiles = [...assets.manifest.tiles].sort((a, b) => b.count - a.count);
    let index = 0;
    const step = () => {
      if (cancelled) return;
      const end = Math.min(tiles.length, index + 8);
      for (; index < end; index += 1) built.push(buildBuildingGeometry(assets.buildingsBuffer, tiles[index]));
      setGeometries([...built]);
      if (index < tiles.length) window.setTimeout(step, 0);
      else onReady();
    };
    step();
    return () => { cancelled = true; built.forEach((g) => g.dispose()); };
  }, [assets, onReady]);
  useEffect(() => () => material.dispose(), [material]);
  return <group>{geometries.map((geometry, i) => <mesh key={i} geometry={geometry} material={material} castShadow receiveShadow raycast={skip} />)}</group>;
}

const ROAD_STYLES: Array<{ cls: number; half: number; y: number; color: string; intensity: number; opacity: number; core: number }> = [
  { cls: LINE_CLASS.motorway, half: 0.021, y: 0.02, color: '#ffb35c', intensity: 1.05, opacity: 0.9, core: 0.55 },
  { cls: LINE_CLASS.trunk, half: 0.016, y: 0.019, color: '#ff9f52', intensity: 0.8, opacity: 0.85, core: 0.35 },
  { cls: LINE_CLASS.primary, half: 0.011, y: 0.018, color: '#dd8d52', intensity: 0.55, opacity: 0.8, core: 0.25 },
  { cls: LINE_CLASS.secondary, half: 0.0075, y: 0.017, color: '#a5744a', intensity: 0.3, opacity: 0.6, core: 0.1 },
  { cls: LINE_CLASS.link, half: 0.008, y: 0.0175, color: '#bd7f4c', intensity: 0.32, opacity: 0.6, core: 0.1 },
  { cls: LINE_CLASS.runway, half: 0.03, y: 0.016, color: '#8fa7b8', intensity: 0.4, opacity: 0.8, core: 0.3 },
  { cls: LINE_CLASS.rail, half: 0.015, y: 0.04, color: '#5ee3ff', intensity: 1.15, opacity: 0.9, core: 0.6 },
];

function Infrastructure({ assets, shared }: { assets: MapAssets; shared: SharedUniforms }) {
  const layers = useMemo(() => ROAD_STYLES.map((style) => ({
    geometry: buildRibbonGeometry(linesOfClass(assets.lines, style.cls as 0), style.half, style.y),
    material: ribbonMaterial(style.color, style.intensity, style.opacity, style.core, shared),
  })), [assets, shared]);
  const stations = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = stations.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    assets.rail.stations.forEach((station, i) => { matrix.makeTranslation(station.x, 0.05, station.z); mesh.setMatrixAt(i, matrix); });
    mesh.instanceMatrix.needsUpdate = true;
  }, [assets]);
  useEffect(() => () => layers.forEach((layer) => { layer.geometry.dispose(); layer.material.dispose(); }), [layers]);
  return (
    <group>
      {layers.map((layer, i) => <mesh key={i} geometry={layer.geometry} material={layer.material} raycast={skip} />)}
      <instancedMesh ref={stations} args={[undefined, undefined, assets.rail.stations.length]} raycast={skip}>
        <cylinderGeometry args={[0.02, 0.02, 0.014, 10]} />
        <meshBasicMaterial color={new THREE.Color('#dffaff').multiplyScalar(1.25)} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ----------------------------------------------------------------------------------------------- */
/* Landmarks (hand-modelled silhouettes at their real coordinates)                                   */
/* ----------------------------------------------------------------------------------------------- */

const at = (latitude: number, longitude: number) => geoToScenePosition({ latitude, longitude }) as [number, number];
const MBS = at(1.2836, 103.8607);
const FLYER = at(1.2893, 103.8632);
const ESPLANADE = at(1.2899, 103.8556);
const MERLION = at(1.2868, 103.8545);
const SUPERTREES = at(1.2816, 103.8636);

function Landmarks() {
  const towerHeight = 200 * HEIGHT_SCALE;
  const glass = <meshStandardMaterial color="#a9bcc4" roughness={0.35} metalness={0.5} />;
  return (
    <group>
      <group position={[MBS[0], 0, MBS[1]]} rotation={[0, -0.55, 0]}>
        {[-0.105, 0, 0.105].map((x, i) => <mesh key={i} position={[x, towerHeight / 2, 0]} rotation={[0, 0, (i - 1) * 0.045]} castShadow><boxGeometry args={[0.06, towerHeight, 0.05]} />{glass}</mesh>)}
        <mesh position={[0.02, towerHeight + 0.03, 0]} castShadow><boxGeometry args={[0.36, 0.05, 0.062]} /><meshStandardMaterial color="#d8cdb2" roughness={0.45} metalness={0.4} /></mesh>
        <mesh position={[0.02, towerHeight + 0.062, 0]}><boxGeometry args={[0.34, 0.012, 0.05]} /><meshBasicMaterial color={new THREE.Color('#ffe7c0').multiplyScalar(1.3)} toneMapped={false} /></mesh>
      </group>
      <group position={[FLYER[0], 0, FLYER[1]]} rotation={[0, 0.9, 0]} scale={[0.62, 0.8, 0.62]}>
        <mesh position={[0, 0.3, 0]}><torusGeometry args={[0.28, 0.012, 8, 56]} /><meshBasicMaterial color={new THREE.Color('#bfe9ef').multiplyScalar(1.4)} toneMapped={false} /></mesh>
        <mesh position={[0, 0.3, 0]}><torusGeometry args={[0.2, 0.005, 6, 40]} /><meshBasicMaterial color="#6f9aa0" /></mesh>
        {[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.3, 0]} rotation={[0, 0, (i * Math.PI) / 3]}><boxGeometry args={[0.56, 0.006, 0.006]} /><meshBasicMaterial color="#7fa5aa" /></mesh>)}
        <mesh position={[-0.09, 0.15, 0]} rotation={[0, 0, 0.55]}><boxGeometry args={[0.014, 0.34, 0.014]} /><meshStandardMaterial color="#5b7378" /></mesh>
        <mesh position={[0.09, 0.15, 0]} rotation={[0, 0, -0.55]}><boxGeometry args={[0.014, 0.34, 0.014]} /><meshStandardMaterial color="#5b7378" /></mesh>
      </group>
      <group position={[ESPLANADE[0], 0, ESPLANADE[1]]} rotation={[0, 0.35, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow><boxGeometry args={[0.24, 0.04, 0.13]} /><meshStandardMaterial color="#5e7278" roughness={0.8} /></mesh>
        {[-0.06, 0.06].map((x, i) => <mesh key={i} position={[x, 0.04, 0]} scale={[1, 0.6, 1]} castShadow><sphereGeometry args={[0.058, 18, 12]} /><meshStandardMaterial color="#8ea4a6" roughness={0.55} metalness={0.25} flatShading /></mesh>)}
      </group>
      <group position={[MERLION[0], 0, MERLION[1]]}>
        <mesh position={[0, 0.03, 0]}><coneGeometry args={[0.014, 0.06, 8]} /><meshStandardMaterial color="#bcd3cd" roughness={0.5} /></mesh>
        <mesh position={[0, 0.064, 0]}><sphereGeometry args={[0.008, 8, 6]} /><meshBasicMaterial color={new THREE.Color('#e8fbff').multiplyScalar(1.6)} toneMapped={false} /></mesh>
      </group>
      <group position={[SUPERTREES[0], 0, SUPERTREES[1]]}>
        {[[0, 0, 0.13], [0.05, 0.03, 0.1], [-0.045, 0.035, 0.11], [0.02, -0.05, 0.085], [-0.03, -0.045, 0.095]].map(([x, z, h], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.006, 0.012, h, 6]} /><meshStandardMaterial color="#6d5a72" roughness={0.9} /></mesh>
            <mesh position={[0, h, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.028, 0.035, 8, 1, true]} /><meshBasicMaterial color={new THREE.Color('#c9a1ff').multiplyScalar(1.5)} toneMapped={false} side={THREE.DoubleSide} transparent opacity={0.85} /></mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ----------------------------------------------------------------------------------------------- */
/* BTO projects, amenities, hubs                                                                     */
/* ----------------------------------------------------------------------------------------------- */

const CLUSTER_LAYOUT: Array<[number, number, number, number, number]> = [
  [-0.1, -0.045, 0.078, 0.026, 0.09], [0, -0.05, 0.07, 0.026, 0.075], [0.1, -0.04, 0.078, 0.026, 0.1],
  [-0.052, 0.04, 0.07, 0.026, 0.085], [0.05, 0.045, 0.078, 0.026, 0.07], [0, 0.125, 0.062, 0.026, 0.095],
];

function BtoCluster({ project, match, selected, pinMode, onSelect, onGroundSelect }: { project: (typeof btoProjects)[number]; match: ProjectMatch; selected: boolean; pinMode: boolean; onSelect: () => void; onGroundSelect: (position: [number, number]) => void }) {
  const position = project.position;
  const rotation = hash01(project.id) * Math.PI;
  // Fit opacity is exact (100/77/54/31/8 %) and never reset by selection; selection adds a ring and emissive lift instead.
  const opacity = projectOpacity(match);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff6a63', emissive: '#ff2f33', roughness: 0.5, metalness: 0.1, transparent: true }), []);
  useEffect(() => () => material.dispose(), [material]);
  material.opacity = opacity;
  material.depthWrite = opacity > 0.5;
  material.emissiveIntensity = selected ? 1.9 : 0.35 + opacity * 0.55;
  material.color.set('#ff6a63').multiplyScalar(0.55 + opacity * 0.45);
  if (!position) return null;
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, rotation, 0]} onClick={(event) => { event.stopPropagation(); if (pinMode) onGroundSelect([event.point.x, event.point.z]); else onSelect(); }} onPointerOver={() => { document.body.style.cursor = pinMode ? 'crosshair' : 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'default'; }}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.2, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {CLUSTER_LAYOUT.map(([x, z, w, d, h], i) => <mesh key={i} position={[x, (h * (0.85 + hash01(project.id + i) * 0.3)) / 2, z]} material={material} castShadow><boxGeometry args={[w, h * (0.85 + hash01(project.id + i) * 0.3), d]} /></mesh>)}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.2, selected ? 0.232 : 0.212, 48]} /><meshBasicMaterial color={selected ? new THREE.Color('#ffc9b3').multiplyScalar(1.5) : '#ff6a63'} transparent opacity={selected ? 0.95 : 0.25 + opacity * 0.45} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} /></mesh>
      {selected && <mesh name={`selection-ring-${project.id}`} position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.26, 0.272, 64]} /><meshBasicMaterial color={new THREE.Color('#ffe2d6').multiplyScalar(1.3)} transparent opacity={0.9} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} /></mesh>}
      {selected && <group name={`approximate-1km-context-${project.id}`} userData={{ approximateRadiusKm: 1 }} rotation={[0, -rotation, 0]}>
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[ONE_KM_SCENE_RADIUS, 96]} /><meshBasicMaterial color="#ff5a4f" transparent opacity={0.03} side={THREE.DoubleSide} depthWrite={false} /></mesh>
        <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[ONE_KM_SCENE_RADIUS - 0.009, ONE_KM_SCENE_RADIUS, 128]} /><meshBasicMaterial color={new THREE.Color('#ffb7a6').multiplyScalar(1.2)} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} /></mesh>
        <mesh position={[0, 0.027, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[ONE_KM_SCENE_RADIUS - 0.06, ONE_KM_SCENE_RADIUS - 0.009, 128]} /><meshBasicMaterial color="#ff8b7c" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      </group>}
    </group>
  );
}

function makeHighlightGeometry(place: PlaceHighlight): { fill: THREE.BufferGeometry; outlines: THREE.BufferGeometry[] } {
  const positions: number[] = [];
  const indices: number[] = [];
  const outlines: THREE.BufferGeometry[] = [];
  for (const ring of place.rings) {
    if (ring.length < 3) continue;
    const base = positions.length / 3;
    for (const [x, z] of ring) positions.push(x, 0.055, z);
    const triangles = THREE.ShapeUtils.triangulateShape(ring.map(([x, z]) => new THREE.Vector2(x, z)), []);
    for (const [a, b, c] of triangles) indices.push(base + a, base + c, base + b);
    const points = [...ring, ring[0]].map(([x, z]) => new THREE.Vector3(x, 0.058, z));
    outlines.push(new THREE.BufferGeometry().setFromPoints(points));
  }
  const fill = new THREE.BufferGeometry();
  fill.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  fill.setIndex(indices);
  fill.computeBoundingSphere();
  return { fill, outlines };
}

function AmenityHighlight({ amenity, place, inside, selectedProjectId, pinMode, onSelect, onGroundSelect }: { amenity: Amenity; place: PlaceHighlight; inside: boolean; selectedProjectId: string | null; pinMode: boolean; onSelect: (amenity: Amenity) => void; onGroundSelect: (position: [number, number]) => void }) {
  const geometry = useMemo(() => makeHighlightGeometry(place), [place]);
  const color = useMemo(() => new THREE.Color(AMENITY_GROUPS[amenity.group].palette.map).multiplyScalar(inside ? 1.8 : 1.15), [amenity.group, inside]);
  useEffect(() => () => { geometry.fill.dispose(); geometry.outlines.forEach((outline) => outline.dispose()); }, [geometry]);
  const opacity = selectedProjectId ? (inside ? 0.72 : 0.13) : 0.42;
  return <group name={`amenity-highlight-${amenity.id}`} userData={{ source: place.source, sourceName: place.sourceName }} onClick={(event) => { event.stopPropagation(); if (pinMode) onGroundSelect([event.point.x, event.point.z]); else onSelect(amenity); }} onPointerOver={() => { document.body.style.cursor = pinMode ? 'crosshair' : 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'default'; }}>
    <mesh geometry={geometry.fill} renderOrder={20}>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
    {geometry.outlines.map((outline, index) => <lineLoop key={index} geometry={outline} renderOrder={21} raycast={skip}>
      <lineBasicMaterial color={color} transparent opacity={selectedProjectId && !inside ? 0.2 : inside ? 1 : 0.72} depthTest={false} depthWrite={false} toneMapped={false} />
    </lineLoop>)}
  </group>;
}

function AmenityMarkers({ assets, visible, selectedProjectId, pinMode, onSelect, onGroundSelect }: { assets: MapAssets; visible: AmenityGroup[]; selectedProjectId: string | null; pinMode: boolean; onSelect: (amenity: Amenity) => void; onGroundSelect: (position: [number, number]) => void }) {
  const selected = selectedProjectId ? btoProjects.find((project) => project.id === selectedProjectId) : null;
  const places = useMemo(() => new Map(assets.places.places.map((place) => [place.amenityId, place])), [assets]);
  return <group>{amenities.filter((amenity) => visible.includes(amenity.group) && amenity.position !== null).map((amenity) => {
    const place = places.get(amenity.id);
    if (!place) return null;
    const inside = selected ? selected.amenityIds.includes(amenity.id) : false;
    return <AmenityHighlight key={amenity.id} amenity={amenity} place={place} inside={inside} selectedProjectId={selectedProjectId} pinMode={pinMode} onSelect={onSelect} onGroundSelect={onGroundSelect} />;
  })}</group>;
}

function Markers({ customPin }: { customPin: [number, number] | null }) {
  return (
    <group>
      {workHubs.map((hub) => <group key={hub.id} position={[hub.position[0], 0, hub.position[1]]}><mesh position={[0, 0.09, 0]}><cylinderGeometry args={[0.014, 0.024, 0.18, 8]} /><meshBasicMaterial color="#f5f1db" transparent opacity={0.85} /></mesh><mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.035, 0.045, 20]} /><meshBasicMaterial color="#e8c986" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} /></mesh></group>)}
      {customPin && <group position={[customPin[0], 0, customPin[1]]}><mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.016, 0.026, 0.28, 8]} /><meshBasicMaterial color={new THREE.Color('#f5bd6a').multiplyScalar(1.4)} toneMapped={false} /></mesh><mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.05, 0.065, 24]} /><meshBasicMaterial color="#f5bd6a" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} /></mesh></group>}
    </group>
  );
}

/* ----------------------------------------------------------------------------------------------- */
/* Labels                                                                                            */
/* ----------------------------------------------------------------------------------------------- */

const DISTRICT_LABELS: Record<string, string> = {
  'WOODLANDS': 'Woodlands', 'SEMBAWANG': 'Sembawang', 'YISHUN': 'Yishun', 'PUNGGOL': 'Punggol', 'ANG MO KIO': 'Ang Mo Kio', 'BISHAN': 'Bishan', 'TOA PAYOH': 'Toa Payoh',
  'TAMPINES': 'Tampines', 'BEDOK': 'Bedok', 'GEYLANG': 'Geylang', 'JURONG WEST': 'Jurong', 'TENGAH': 'Tengah', 'BUKIT MERAH': 'Bukit Merah', 'DOWNTOWN CORE': 'CBD · Marina Bay', 'CHANGI': 'Changi', 'TUAS': 'Tuas', 'CENTRAL WATER CATCHMENT': 'Central Catchment',
};

function Labels({ assets, matches, selectedProjectId, pinMode, launchStatusFilter, onProjectSelect }: { assets: MapAssets; matches: Record<string, ProjectMatch>; selectedProjectId: string | null; pinMode: boolean; launchStatusFilter: MapSceneProps['launchStatusFilter']; onProjectSelect: (id: string) => void }) {
  const [zoom, setZoom] = useState(30);
  useFrame(({ camera }) => { const z = Math.round((camera as THREE.OrthographicCamera).zoom); if (Math.abs(z - zoom) > Math.max(2, zoom * 0.08)) setZoom(z); });
  const focused = zoom > 70;
  const mapped = btoProjects.filter((project) => project.position !== null && (launchStatusFilter === 'all' || project.launchStatus === launchStatusFilter));
  const visibleProjects: typeof mapped = [];
  const minSeparation = 60 / zoom;
  for (const project of mapped) {
    const p = project.position!;
    const crowded = visibleProjects.some((other) => Math.hypot(other.position![0] - p[0], other.position![1] - p[1]) < minSeparation);
    if (!crowded || project.id === selectedProjectId) visibleProjects.push(project);
  }
  return (
    <group>
      {!focused && assets.manifest.areas.filter((area) => DISTRICT_LABELS[area.name]).map((area) => (
        <Html key={area.name} position={[area.x, 0.02, area.z]} center zIndexRange={[3, 3]} style={{ pointerEvents: 'none' }}>
          <span className="map-label map-label-district">{DISTRICT_LABELS[area.name]}</span>
        </Html>
      ))}
      {visibleProjects.map((project) => {
        const opacity = projectOpacity(matches[project.id]);
        return (
          <Html key={project.id} position={[project.position![0], 0.16, project.position![1]]} center zIndexRange={[3, 3]} wrapperClass="map-label-project-wrapper" style={{ pointerEvents: pinMode ? 'none' : 'auto', cursor: 'pointer', zIndex: 3 }}>
            <button type="button" className={`map-label map-label-project map-label-status-${project.launchStatus} ${project.id === selectedProjectId ? 'is-selected' : ''}`} onClick={() => onProjectSelect(project.id)} style={{ opacity }} data-fit-opacity={opacity} data-launch-status={project.launchStatus} aria-label={`Open ${project.name.split(' — ')[0]} project details`} title={`${project.name.split(' — ')[0]} · ${project.launchStatus === 'launched' ? 'past launch' : project.launchStatus === 'planned' ? 'planned project' : 'upcoming project'}`}>{project.name.split(' — ')[0]}</button>
          </Html>
        );
      })}
    </group>
  );
}

/* ----------------------------------------------------------------------------------------------- */
/* Camera                                                                                            */
/* ----------------------------------------------------------------------------------------------- */

const OVERVIEW_TARGET = new THREE.Vector3(0.6, 0, 3.6);

type CameraGoal = { target: THREE.Vector3; azimuth: number; elevation: number; zoom: number };
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function CameraRig({ selectedPosition, shared, lite }: { selectedPosition: [number, number] | null; shared: SharedUniforms; lite: boolean }) {
  const focus = shared.focus;
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera as THREE.OrthographicCamera);
  const controls = useThree((state) => state.controls as unknown as Controls | undefined);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const goalRef = useRef<CameraGoal | null>(null);
  const tween = useRef<{ from: CameraGoal; to: CameraGoal; startedAt: number; duration: number } | null>(null);
  const userOwned = useRef(false);
  const heldKeys = useRef(new Set<string>());
  const panVelocity = useRef(new THREE.Vector2());
  const desiredZoom = useRef(camera.zoom);
  const zoomCursor = useRef(new THREE.Vector2());
  const focusStrength = useRef(0);

  const overviewGoal = (): CameraGoal => ({ target: OVERVIEW_TARGET.clone(), azimuth: OVERVIEW_AZIMUTH, elevation: OVERVIEW_ELEVATION, zoom: zoomBounds(size.width, size.height).overview });
  const focusGoal = (p: [number, number]): CameraGoal => {
    const zoom = zoomBounds(size.width, size.height).focus;
    const right = new THREE.Vector3(Math.cos(OVERVIEW_AZIMUTH), 0, -Math.sin(OVERVIEW_AZIMUTH));
    const forward = new THREE.Vector3(-Math.sin(OVERVIEW_AZIMUTH), 0, -Math.cos(OVERVIEW_AZIMUTH));
    const horizontalOffsetPx = (FOCUS_SAFE_INSETS.left - FOCUS_SAFE_INSETS.right) / -2;
    const verticalOffsetPx = (FOCUS_SAFE_INSETS.top - FOCUS_SAFE_INSETS.bottom) / 2;
    return {
      target: new THREE.Vector3(p[0], 0, p[1]).addScaledVector(right, horizontalOffsetPx / zoom).addScaledVector(forward, verticalOffsetPx / zoom),
      azimuth: OVERVIEW_AZIMUTH,
      elevation: FOCUS_ELEVATION,
      zoom,
    };
  };

  const apply = (goal: CameraGoal) => {
    if (!controls) return;
    camera.position.copy(goal.target).add(orbitOffset(goal.azimuth, goal.elevation));
    controls.target.copy(goal.target);
    if (Math.abs(camera.zoom - goal.zoom) > 1e-3) { camera.zoom = goal.zoom; camera.updateProjectionMatrix(); }
    desiredZoom.current = goal.zoom;
    controls.update();
  };

  useEffect(() => {
    if (!controls) return;
    const onStart = () => { userOwned.current = true; tween.current = null; };
    const onChange = () => invalidate();
    controls.addEventListener('start', onStart);
    controls.addEventListener('change', onChange);
    return () => { controls.removeEventListener('start', onStart); controls.removeEventListener('change', onChange); };
  }, [controls, invalidate]);

  useEffect(() => {
    const element = gl.domElement;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoomCursor.current.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
      const bounds = zoomBounds(size.width, size.height);
      desiredZoom.current = clampZoom((desiredZoom.current || camera.zoom) * wheelZoomFactor(event.deltaY, event.deltaMode, event.ctrlKey), bounds);
      userOwned.current = true;
      tween.current = null;
      invalidate();
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [camera, gl, invalidate, size.height, size.width]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) || isEditableTarget(event.target)) return;
      event.preventDefault();
      heldKeys.current.add(event.key);
      userOwned.current = true;
      tween.current = null;
      invalidate();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      heldKeys.current.delete(event.key);
      invalidate();
    };
    const onBlur = () => heldKeys.current.clear();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); };
  }, [invalidate]);

  // Fly-to on selection change; on first mount, a short opening settle instead of a long intro.
  const selectedKey = selectedPosition ? `${selectedPosition[0]},${selectedPosition[1]}` : 'overview';
  useEffect(() => {
    if (!controls) return;
    const goal = selectedPosition ? focusGoal(selectedPosition) : overviewGoal();
    // Software renderers snap like reduced motion: every tween frame would cost hundreds of milliseconds.
    const reduced = prefersReducedMotion() || lite;
    userOwned.current = false;
    invalidate();
    if (!goalRef.current) {
      goalRef.current = goal;
      if (reduced) { apply(goal); tween.current = null; return; }
      const from = { ...goal, target: goal.target.clone(), azimuth: goal.azimuth + 0.09, elevation: goal.elevation + 0.05, zoom: goal.zoom * 0.86 };
      apply(from);
      tween.current = { from, to: goal, startedAt: performance.now(), duration: 1900 };
      return;
    }
    const orbit = orbitFromOffset(camera.position.clone().sub(controls.target));
    const from: CameraGoal = { target: controls.target.clone(), azimuth: orbit.azimuth, elevation: orbit.elevation, zoom: camera.zoom };
    goalRef.current = goal;
    if (reduced) { apply(goal); tween.current = null; return; }
    tween.current = { from, to: goal, startedAt: performance.now(), duration: selectedPosition ? 1500 : 1300 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, selectedKey]);

  // Keep the overview framed to the viewport while nobody has taken manual control.
  useEffect(() => {
    if (!controls || selectedPosition || !goalRef.current || tween.current || userOwned.current) return;
    goalRef.current = overviewGoal();
    apply(goalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    const goal = goalRef.current;
    if (!controls || !goal) return;
    const dt = Math.min(delta, 0.1);
    const strengthTarget = selectedPosition ? 1 : 0;
    if (lite) focusStrength.current = strengthTarget;
    else focusStrength.current += (strengthTarget - focusStrength.current) * (1 - Math.exp(-dt * 4));
    if (selectedPosition) focus.value.set(selectedPosition[0], selectedPosition[1], ONE_KM_SCENE_RADIUS, focusStrength.current);
    else focus.value.w = focusStrength.current;
    // Ribbons keep a near-constant on-screen weight instead of ballooning when zoomed in.
    shared.widthScale.value = THREE.MathUtils.clamp(Math.pow(30 / camera.zoom, 0.55), 0.28, 1.25);
    const active = tween.current;
    if (active) {
      const t = Math.min(1, (performance.now() - active.startedAt) / active.duration);
      const k = easeInOut(t);
      const blended: CameraGoal = {
        target: active.from.target.clone().lerp(active.to.target, k),
        azimuth: THREE.MathUtils.lerp(active.from.azimuth, active.to.azimuth, k),
        elevation: THREE.MathUtils.lerp(active.from.elevation, active.to.elevation, k),
        zoom: Math.exp(THREE.MathUtils.lerp(Math.log(active.from.zoom), Math.log(active.to.zoom), k)),
      };
      apply(blended);
      if (t >= 1) tween.current = null; else invalidate();
      return;
    }
    if (!userOwned.current) apply(goal);
    else {
      const orbit = orbitFromOffset(camera.position.clone().sub(controls.target));
      const requested = keyPanDirection(heldKeys.current).multiplyScalar(KEY_PAN_PX_PER_SECOND);
      panVelocity.current.set(
        approach(panVelocity.current.x, requested.x, dt, KEY_PAN_EASE_SECONDS),
        approach(panVelocity.current.y, requested.y, dt, KEY_PAN_EASE_SECONDS),
      );
      if (panVelocity.current.lengthSq() > 0.5) {
        const shift = panDisplacement(panVelocity.current, orbit.azimuth, camera.zoom, dt);
        const nextTarget = clampTarget(controls.target.clone().add(shift), FALLBACK_BOUNDS);
        camera.position.add(nextTarget.clone().sub(controls.target));
        controls.target.copy(nextTarget);
      }
      const nextZoom = approach(camera.zoom, desiredZoom.current, dt, ZOOM_EASE_SECONDS);
      if (Math.abs(nextZoom - camera.zoom) > 0.01) {
        camera.updateMatrixWorld();
        zoomAboutCursor(camera, controls.target, nextZoom, zoomCursor.current);
        const clamped = clampTarget(controls.target, FALLBACK_BOUNDS);
        camera.position.add(clamped.clone().sub(controls.target));
        controls.target.copy(clamped);
      }
      controls.update();
      if (panVelocity.current.lengthSq() > 0.5 || Math.abs(desiredZoom.current - camera.zoom) > 0.05) invalidate();
    }
    if (!lite && Math.abs(focusStrength.current - strengthTarget) > 0.01) invalidate();
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __mapScene?: unknown; __mapGl?: unknown }).__mapScene = scene;
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __mapScene?: unknown; __mapGl?: unknown; __mapCam?: unknown }).__mapGl = gl;
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __mapCam?: unknown }).__mapCam = camera;
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __mapCamera?: unknown }).__mapCamera = { zoom: camera.zoom, size: [size.width, size.height], target: controls.target.toArray(), position: camera.position.toArray(), userOwned: userOwned.current, tween: Boolean(tween.current) };
  });
  return null;
}

function ShadowRig({ selectedPosition, shadows }: { selectedPosition: [number, number] | null; shadows: boolean }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D());
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    l.target = targetRef.current;
    l.shadow.camera.near = 1; l.shadow.camera.far = 140;
    l.shadow.bias = -0.00035; l.shadow.normalBias = 0.025;
  }, []);
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    // Tighten the shadow frustum around the selected neighbourhood for crisper contact shadows.
    const extent = selectedPosition ? 5 : 30;
    const cam = l.shadow.camera;
    if (cam.left !== -extent) { cam.left = -extent; cam.right = extent; cam.top = extent; cam.bottom = -extent; cam.updateProjectionMatrix(); }
    const focusPoint = selectedPosition ? new THREE.Vector3(selectedPosition[0], 0, selectedPosition[1]) : OVERVIEW_TARGET;
    targetRef.current.position.copy(focusPoint);
    targetRef.current.updateMatrixWorld();
    l.position.copy(focusPoint).add(new THREE.Vector3(-24, 34, 20));
  });
  return <><directionalLight ref={light} color="#f6e4cc" intensity={1.7} castShadow={shadows} shadow-mapSize-width={4096} shadow-mapSize-height={4096} /><primitive object={targetRef.current} /></>;
}

/* ----------------------------------------------------------------------------------------------- */
/* Scene                                                                                             */
/* ----------------------------------------------------------------------------------------------- */

type Quality = { shadows: boolean; effects: boolean; dpr: [number, number]; lite: boolean };

/** Software GL (headless Chromium, VMs) gets a lite path: no shadow pass, no post-processing, dpr 1. */
function detectQuality(): Quality {
  const params = new URLSearchParams(window.location.search);
  let software = params.has('lite');
  if (!software) {
    try {
      const probe = document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl');
      const info = probe?.getExtension('WEBGL_debug_renderer_info');
      const renderer = probe && info ? String(probe.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
      software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
      probe?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { software = false; }
  }
  return { shadows: !software && !params.has('noshadow'), effects: !software && !params.has('nofx'), dpr: software ? [1, 1] : [1, 1.5], lite: software };
}

function SceneContents({ matches, visibleGroups, selectedProjectId, customPin, pinMode, launchStatusFilter, onProjectSelect, onAmenitySelect, onGroundSelect, onReady, quality }: MapSceneProps & { onReady: () => void; quality: Quality }) {
  const assets = useMapAssets();
  const shared = useMemo<SharedUniforms>(() => ({ focus: { value: new THREE.Vector4(0, 0, ONE_KM_SCENE_RADIUS, 0) }, widthScale: { value: 1 } }), []);
  const focus = shared.focus;
  const selectedProject = btoProjects.find((project) => project.id === selectedProjectId);
  const effects = quality.effects;
  return (
    <>
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 54, 96]} />
      <hemisphereLight color="#7391ad" groundColor="#05070a" intensity={0.9} />
      <directionalLight position={[16, 12, -20]} intensity={0.55} color="#4f9fc8" />
      <ShadowRig selectedPosition={selectedProject?.position ?? null} shadows={quality.shadows} />
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={(event) => { if (pinMode) { event.stopPropagation(); onGroundSelect([event.point.x, event.point.z]); } }}>
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {assets && <Terrain assets={assets} shared={shared} />}
      {assets && <Buildings assets={assets} focus={focus} onReady={onReady} />}
      {assets && <Infrastructure assets={assets} shared={shared} />}
      <Landmarks />
      {assets && <AmenityMarkers assets={assets} visible={visibleGroups} selectedProjectId={selectedProjectId} pinMode={pinMode} onSelect={onAmenitySelect} onGroundSelect={onGroundSelect} />}
      {btoProjects.filter((project) => project.position !== null && (launchStatusFilter === 'all' || project.launchStatus === launchStatusFilter)).map((project) => <BtoCluster key={project.id} project={project} match={matches[project.id]} selected={project.id === selectedProjectId} pinMode={pinMode} onSelect={() => onProjectSelect(project.id)} onGroundSelect={onGroundSelect} />)}
      <Markers customPin={customPin} />
      {assets && <Labels assets={assets} matches={matches} selectedProjectId={selectedProjectId} pinMode={pinMode} launchStatusFilter={launchStatusFilter} onProjectSelect={onProjectSelect} />}
      <CameraRig selectedPosition={selectedProject?.position ?? null} shared={shared} lite={quality.lite} />
      <OrbitControls makeDefault enabled={!pinMode} enableDamping dampingFactor={0.09} enableZoom={false} minPolarAngle={0.3} maxPolarAngle={1.35} screenSpacePanning={false} />
      {effects && <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.8} luminanceSmoothing={0.2} intensity={0.55} radius={0.5} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SMAA />
        <Vignette eskil={false} offset={0.22} darkness={0.62} />
      </EffectComposer>}
    </>
  );
}

export function MapScene(props: MapSceneProps) {
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState<Quality | null>(null);
  useEffect(() => { setQuality(detectQuality()); }, []);
  useEffect(() => { document.body.style.cursor = 'default'; return () => { document.body.style.cursor = 'default'; }; }, [props.pinMode]);
  const selectedProject = btoProjects.find((project) => project.id === props.selectedProjectId);
  const boundaryState = !selectedProject ? 'overview' : selectedProject.position ? 'approximate-1km' : 'unavailable';
  const onReady = useMemo(() => () => setReady(true), []);
  return (
    <div className={`map-canvas ${props.pinMode ? 'is-pin-mode' : ''}`} aria-label="Interactive cinematic map of Singapore BTO locations" data-testid="map-boundary-state" data-boundary-state={boundaryState} data-map-ready={ready ? 'true' : 'false'} data-map-quality={quality ? (quality.effects ? 'full' : 'lite') : 'pending'}>
      {quality && <Canvas orthographic frameloop={quality.lite ? 'demand' : 'always'} shadows={quality.shadows ? { type: THREE.PCFSoftShadowMap } : false} dpr={quality.dpr} gl={{ antialias: !quality.effects, powerPreference: 'high-performance', stencil: false }} camera={{ position: [0, 36, 48], zoom: 30, near: 0.5, far: 220 }}>
        <SceneContents {...props} onReady={onReady} quality={quality} />
      </Canvas>}
    </div>
  );
}
