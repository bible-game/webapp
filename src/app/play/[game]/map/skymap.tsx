"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {initLandscape} from "@/app/play/[game]/map/scene-utils";

let OrbitControls: any;
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls;
}

export type Star = {
    name: string;
    ra_h: number; // Right Ascension in hours (0..24)
    dec_d: number; // Declination in degrees (-90..+90)
    book?: string;
    chapter?: number;
    testament?: string;
    division?: string;
    division_color?: string;
    verses?: number;
    icon?: string;
};

// ===== Math helpers =====
const TAU = Math.PI * 2;
const deg2rad = (d: number) => THREE.MathUtils.degToRad(d);
const raHoursToRad = (h: number) => (h / 24) * TAU;
function sphToVec3(raRad: number, decRad: number, r = 1) {
    const x = r * Math.cos(decRad) * Math.cos(raRad);
    const y = r * Math.sin(decRad);
    const z = r * Math.cos(decRad) * Math.sin(raRad);
    return new THREE.Vector3(x, y, z);
}

// Cheap GMST (Greenwich Mean Sidereal Time, radians). Accuracy ~1s/century — plenty for viz.
function gmstRad(date: Date) {
    const t = date.getTime();
    const JD = t / 86400000 + 2440587.5; // Julian Day
    const T = (JD - 2451545.0) / 36525.0; // centuries since J2000.0
    let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
    GMST = ((GMST % 360) + 360) % 360; // 0..360
    return deg2rad(GMST);
}

// ===== Label sprites =====
function makeLabel(text: string, cssPx = 128) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = cssPx; canvas.height = cssPx;
    ctx.clearRect(0, 0, cssPx, cssPx);
    ctx.font = `500 ${Math.round(cssPx * 0.28)}px system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "white"; ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = Math.round(cssPx * 0.06);
    const lines = text.split("\n");
    if (lines.length === 1) ctx.fillText(text, cssPx / 2, cssPx / 2);
    else {
        const y0 = cssPx / 2 - (lines.length - 1) * (cssPx * 0.25);
        lines.forEach((l, i) => ctx.fillText(l, cssPx / 2, y0 + i * (cssPx * 0.5)));
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4; tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 });
    const spr = new THREE.Sprite(mat);
    (spr as any).userData = { cssW: cssPx, cssH: cssPx };
    return spr;
}

const fadeState = new WeakMap<THREE.Sprite, { a: number; t: number }>();
let _lastCompute = 0; let _lastFrame = 0; const _tmp = new THREE.Vector3();
function updateLabelFading(group: THREE.Group, camera: THREE.PerspectiveCamera, opts?: { maxLabels?: number; radius?: number; throttleMs?: number; fadeInMs?: number; fadeOutMs?: number }) {
    const now = performance.now();
    const maxLabels = opts?.maxLabels ?? 24;
    const radius = opts?.radius ?? 0.65; // in NDC
    const throttleMs = opts?.throttleMs ?? 120;
    const fadeInMs = opts?.fadeInMs ?? 140;
    const fadeOutMs = opts?.fadeOutMs ?? 220;
    const dt = Math.max(0, now - _lastFrame); _lastFrame = now;

    if (now - _lastCompute > throttleMs) {
        _lastCompute = now;
        const sprites: { s: THREE.Sprite; r2: number; on: boolean }[] = [];
        group.traverse((o) => {
            if ((o as any).isSprite) {
                const s = o as THREE.Sprite; s.getWorldPosition(_tmp); _tmp.project(camera);
                const r2 = _tmp.x * _tmp.x + _tmp.y * _tmp.y; const on = Math.abs(_tmp.z) <= 1 && r2 <= radius * radius;
                sprites.push({ s, r2, on });
            }
        });
        sprites.sort((a, b) => a.r2 - b.r2);
        let shown = 0;
        for (const { s, on } of sprites) {
            let st = fadeState.get(s); if (!st) { st = { a: 0, t: 0 }; fadeState.set(s, st); }
            st.t = on && shown < maxLabels ? 1 : 0; if (on && shown < maxLabels) shown++;
        }
    }
    group.traverse((o) => {
        if ((o as any).isSprite) {
            const s = o as THREE.Sprite; let st = fadeState.get(s) ?? { a: 0, t: 0 }; fadeState.set(s, st);
            const tau = st.t > st.a ? fadeInMs : fadeOutMs; const k = 1 - Math.exp(-(dt / Math.max(1, tau)));
            st.a = THREE.MathUtils.lerp(st.a, st.t, k);
            (s.material as THREE.SpriteMaterial).opacity = st.a;
        }
    });
}

function worldUnitsPerCssPixel(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, worldPos: THREE.Vector3) {
    const dist = camera.position.distanceTo(worldPos);
    const worldH = 2 * dist * Math.tan(deg2rad(camera.fov * 0.5));
    const px = renderer.domElement.clientHeight || 1;
    return worldH / px;
}
function fitSpriteToPixels(s: THREE.Sprite, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    const u = (s as any).userData; if (!u) return; const wp = new THREE.Vector3(); s.getWorldPosition(wp);
    const wu = worldUnitsPerCssPixel(camera, renderer, wp);
    s.scale.set(u.cssW * wu, u.cssH * wu, 1);
}
function fitSpriteGroupToPixels(group: THREE.Group, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    group.traverse((o) => { if ((o as any).isSprite) fitSpriteToPixels(o as THREE.Sprite, camera, renderer); });
}

// ===== Starfield shader =====
function hexToRgb01(hex: string) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
    if (!m) return [0.62, 0.75, 1.0] as const;
    return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] as const;
}
function makeStarfield(stars: Star) {
    return null; // placeholder to satisfy TS when copy/pasting helpers around
}
function buildStarfield(stars: Star[]) {
    const n = stars.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const lum = new Float32Array(n);
    let vMin = Infinity, vMax = -Infinity;
    for (const s of stars) if (typeof s.verses === "number") {
        vMin = Math.min(vMin, s.verses);
        vMax = Math.max(vMax, s.verses);
    }
    if (!isFinite(vMin) || !isFinite(vMax) || vMin === vMax) { vMin = 10; vMax = 50; }
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
        const s = stars[i];
        v.copy(sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1));
        pos.set([v.x, v.y, v.z], i * 3);
        const [r, g, b] = hexToRgb01(s.division_color || "#9fbfff");
        col.set([r, g, b], i * 3);
        const t = Math.sqrt((Math.max(vMin, Math.min(vMax, s.verses ?? vMin)) - vMin) / (vMax - vMin + 1e-6));
        size[i] = t / 20;
        lum[i] = t;
    }
    const geom = new THREE.BufferGeometry(); geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(col, 3)); geom.setAttribute("aSize", new THREE.BufferAttribute(size, 1)); geom.setAttribute("aLum", new THREE.BufferAttribute(lum, 1));
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexColors: true, uniforms: { uPixelRatio: { value: (typeof window !== "undefined" ? window.devicePixelRatio : 1) } },
        vertexShader: /*glsl*/`attribute float aSize; attribute float aLum; varying vec3 vColor; varying float vLum; uniform float uPixelRatio; void main(){ vColor=color; vLum=aLum; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=aSize*uPixelRatio*(300.0/ -mv.z); gl_Position=projectionMatrix*mv; }`,
        fragmentShader: /*glsl*/`precision mediump float; varying vec3 vColor; varying float vLum; void main(){ vec2 p=gl_PointCoord*2.0-1.0; float r=length(p); if(r>1.0) discard; float core=smoothstep(0.0,0.2,1.0-r); float halo=smoothstep(1.0,0.0,r); float a=mix(halo*0.75,1.0,core)*mix(0.5,1.0,vLum); gl_FragColor=vec4(vColor,a);} `, });
    const points = new THREE.Points(geom, mat); points.frustumCulled = false; return points;
}

// ===== Book‑constellation lines (MST + nearest neighbors) =====
function pickDivisionColor(list: Array<{ division?: string; division_color?: string }>): number {
    for (const s of list) if (s.division_color) return new THREE.Color(...hexToRgb01(s.division_color)).getHex();
    const div = (list[0]?.division || "Division").toLowerCase(); let h = 2166136261 >>> 0; for (let i = 0; i < div.length; i++) { h ^= div.charCodeAt(i); h = Math.imul(h, 16777619); }
    const hue = (h % 360) / 360; const c = new THREE.Color().setHSL(hue, 0.45, 0.7); return c.getHex();
}
function createLineMaterial(colorHex: number, opacity = 0.5, fadeLow = -0.08, fadeHigh = 0.12) {
    return new THREE.ShaderMaterial({ transparent: true, depthTest: true, depthWrite: false, uniforms: { uColor: { value: new THREE.Color(colorHex) }, uOpacity: { value: opacity }, uFadeLow: { value: fadeLow }, uFadeHigh: { value: fadeHigh } },
        vertexShader: /*glsl*/`varying float vY; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vY=wp.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
        fragmentShader: /*glsl*/`precision mediump float; varying float vY; uniform vec3 uColor; uniform float uOpacity; uniform float uFadeLow; uniform float uFadeHigh; float smooth01(float x,float a,float b){ float t=clamp((x-a)/max(1e-5,b-a),0.0,1.0); return t*t*(3.0-2.0*t);} void main(){ float t=smooth01(vY,uFadeLow,uFadeHigh); float a=uOpacity*t; if(a<0.01) discard; gl_FragColor=vec4(uColor,a);} `, });
}
function computeLocalBasis(points: THREE.Vector3[]) { const n = new THREE.Vector3(); for (const p of points) n.add(p); if (n.lengthSq() < 1e-8) n.set(0, 1, 0); n.normalize(); const ref = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0); const u = new THREE.Vector3().crossVectors(ref, n).normalize(); const v = new THREE.Vector3().crossVectors(n, u).normalize(); return { u, v, n }; }
function mstEdges2D(P: THREE.Vector2[]) { const n = P.length; if (n <= 1) return [] as Array<[number, number]>; const inT = new Array(n).fill(false), minD = new Array(n).fill(Infinity), parent = new Array(n).fill(-1); inT[0] = true; for (let j = 1; j < n; j++) { minD[j] = P[0].distanceTo(P[j]); parent[j] = 0; } const E: Array<[number, number]> = []; for (let k = 0; k < n - 1; k++) { let v = -1, best = Infinity; for (let j = 0; j < n; j++) if (!inT[j] && minD[j] < best) { best = minD[j]; v = j; } if (v === -1) break; inT[v] = true; const p = parent[v]; E.push(p < v ? [p, v] : [v, p]); for (let w = 0; w < n; w++) if (!inT[w]) { const d = P[v].distanceTo(P[w]); if (d < minD[w]) { minD[w] = d; parent[w] = v; } } } return E; }
function nearestExtras(P: THREE.Vector2[], k: number, existing: Set<string>) { if (k <= 0) return [] as Array<[number, number]>; const n = P.length; const out: Array<[number, number]> = []; for (let i = 0; i < n; i++) { const order = Array.from({ length: n }, (_, j) => j).filter((j) => j !== i).sort((a, b) => P[i].distanceTo(P[a]) - P[i].distanceTo(P[b])); let added = 0; for (const j of order) { const key = i < j ? `${i}-${j}` : `${j}-${i}`; if (existing.has(key)) continue; existing.add(key); out.push(i < j ? [i, j] : [j, i]); if (++added >= k) break; } } return out; }
function buildBookConstellations(stars: Star[], radius = 1.0, opts: { extraNearestPerNode?: number; opacity?: number; fadeLow?: number; fadeHigh?: number } = {}) {
    const { extraNearestPerNode = 1, opacity = 0.5, fadeLow = -0.08, fadeHigh = 0.12 } = opts;
    const group = new THREE.Group();
    const byBook = new Map<string, Star[]>(); for (const s of stars) { const key = s.book || (s.name?.split(" ")[0] ?? ""); const arr = byBook.get(key) || []; arr.push(s); byBook.set(key, arr); }
    for (const [_, raw] of byBook) {
        const chapters = raw.slice().sort((a, b) => (a.chapter ?? 0) - (b.chapter ?? 0)); if (chapters.length < 2) continue;
        const P3 = chapters.map((s) => sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1).normalize());
        const { u, v, n } = computeLocalBasis(P3); const P2 = P3.map((p) => { const pn = p.clone().sub(n.clone().multiplyScalar(p.dot(n))).normalize(); return new THREE.Vector2(pn.dot(u), pn.dot(v)); });
        const mst = mstEdges2D(P2); const existing = new Set(mst.map(([i, j]) => (i < j ? `${i}-${j}` : `${j}-${i}`))); const extras = nearestExtras(P2, extraNearestPerNode, existing); const edges = mst.concat(extras);
        const arr: number[] = []; for (const [i, j] of edges) { const a = P3[i].clone().multiplyScalar(radius * 0.999); const b = P3[j].clone().multiplyScalar(radius * 0.999); arr.push(a.x, a.y, a.z, b.x, b.y, b.z); }
        if (!arr.length) continue; const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
        const mat = createLineMaterial(pickDivisionColor(chapters), opacity, fadeLow, fadeHigh); const lines = new THREE.LineSegments(geo, mat); lines.frustumCulled = false; lines.renderOrder = 0; group.add(lines);
    }
    return group;
}

// ===== Azimuth grid + cardinals =====
function makeAzimuthGrid(segments = 36) {
    const group = new THREE.Group();
    // Horizon ring
    const R = 1.001; const ring = new THREE.RingGeometry(R * 0.995, R, segments);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x416a8a, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ring, ringMat); ringMesh.rotation.x = Math.PI / 2; // y=0 plane
    group.add(ringMesh);
    // North–South meridian (semi‑circles)
    const curve = new THREE.RingGeometry(R * 0.995, R, segments, 1, 0, Math.PI);
    const mat = new THREE.MeshBasicMaterial({ color: 0x395a78, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const m1 = new THREE.Mesh(curve, mat); m1.rotation.z = Math.PI / 2; group.add(m1);
    const m2 = new THREE.Mesh(curve, mat); m2.rotation.z = -Math.PI / 2; group.add(m2);
    return group;
}
function makeCardinals() {
    const group = new THREE.Group();
    const labels = [
        { t: "N", a: 0 },
        { t: "E", a: Math.PI / 2 },
        { t: "S", a: Math.PI },
        { t: "W", a: -Math.PI / 2 },
    ];
    for (const { t, a } of labels) {
        const spr = makeLabel(t, 128);
        const r = 1.02; const x = r * Math.cos(a); const z = r * Math.sin(a);
        spr.position.set(x, 0.001, z);
        group.add(spr);
    }
    return group;
}

export default function SkyMap(props: any) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const controlsRef = useRef<any | null>(null);
    const skyGroupRef = useRef<THREE.Group | null>(null);
    const groundRef = useRef<THREE.Group | null>(null);
    const labelsRef = useRef<THREE.Group | null>(null);

    const starsUrl = "/stars.json"
    const fov = 75;
    const showGrid = true;
    const showCardinals = true;
    const maxDpr = 2;
    const nearestPerNode = 2;
    const autoConstellations = true;

    const data = useMemo(() => ({
        loadStars: async (): Promise<Star[]> => { const res = await fetch(starsUrl); return await res.json(); },
    }), [starsUrl]);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020814); sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 0.01);
        camera.up.set(0, 1, 0);
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(maxDpr, window.devicePixelRatio || 1)); renderer.setSize(container.clientWidth, container.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; rendererRef.current = renderer; container.appendChild(renderer.domElement);

        // Controls
        if (OrbitControls) {
            const c = new OrbitControls(camera, renderer.domElement);
            c.enableDamping = true;
            c.dampingFactor = 0.08;
            c.rotateSpeed = 0.5;
            c.enableZoom = true;
            c.minDistance = 0.01;
            c.maxDistance = 2;
            c.enablePan = false;
            controlsRef.current = c;
        }

        // Scene graph
        const sky = new THREE.Group();
        const ground = initLandscape();
        const labels = new THREE.Group();
        scene.add(sky);
        scene.add(ground);
        sky.add(labels);
        skyGroupRef.current = sky; groundRef.current = ground; labelsRef.current = labels;

        // Optional grid + cardinals
        if (showGrid) sky.add(makeAzimuthGrid());
        if (showCardinals) sky.add(makeCardinals());

        // Mouse wheel → FOV, double‑click → reset
        const MIN_FOV = 0, MAX_FOV = 120, STEP = 0.25;
        const onWheel = (e: WheelEvent) => { e.preventDefault(); const dir = Math.sign(e.deltaY); camera.fov = THREE.MathUtils.clamp(camera.fov + dir * STEP, MIN_FOV, MAX_FOV); camera.updateProjectionMatrix(); fitSpriteGroupToPixels(labels, camera, renderer); };
        const onDbl = () => { camera.fov = fov; camera.updateProjectionMatrix(); fitSpriteGroupToPixels(labels, camera, renderer); };
        renderer.domElement.addEventListener("wheel", onWheel, { passive: false }); renderer.domElement.addEventListener("dblclick", onDbl);

        const onResize = () => { const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); fitSpriteGroupToPixels(labels, camera, renderer); };
        window.addEventListener("resize", onResize);

        // Time model: rotate sky with Local Sidereal Time; tilt by latitude so the NCP altitude ≈ latitude
        const start = Date.now();


        let raf = 0; let running = true;
        const animate = () => {
            if (!running) return; raf = requestAnimationFrame(animate);
            controlsRef.current?.update?.();
            const t = Date.now();
            // advance GMST by elapsed real time (sidereal day ~ 86164s)
            updateLabelFading(labels, camera);
            renderer.render(scene, camera);
        };

        (async () => {
            const stars = await data.loadStars();
            const field = buildStarfield(stars);
            sky.add(field);
            // Labels (name + optional emoji icon)
            for (const s of stars) {
                const text = `${s.icon ? s.icon + " " : ""}${s.name ?? ""}`.trim(); if (!text) continue;
                const spr = makeLabel(text, 128);
                const p = sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1.01); spr.position.copy(p); labels.add(spr);
            }
            fitSpriteGroupToPixels(labels, camera, renderer);
            if (autoConstellations) sky.add(buildBookConstellations(stars, 1.0, { extraNearestPerNode: nearestPerNode, opacity: 0.5 }));
            animate();
        })();

        return () => {
            running = false; cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.domElement.removeEventListener("wheel", onWheel as any); renderer.domElement.removeEventListener("dblclick", onDbl as any); controlsRef.current?.dispose?.();
            scene.traverse((o: any) => { o.geometry?.dispose?.(); if (o.material) { Array.isArray(o.material) ? o.material.forEach((m: any) => m.dispose?.()) : o.material.dispose?.(); } });
            renderer.dispose(); container.removeChild(renderer.domElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [starsUrl, fov, maxDpr, nearestPerNode, showGrid, showCardinals]);

    return <div ref={containerRef} className="relative w-full h-full" />;
}