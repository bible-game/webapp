"use client";

// skymap.tsx — One-file Next.js (App Router) port of the Angular + three.js sky demo
// Drop this into: app/components/skymap.tsx
// Then render with a client-only dynamic import from app/page.tsx
// Data: put your catalog at /public/stars.json (uses { name, ra_h, dec_d, division_color, verses, icon, ...})

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// OrbitControls must be browser-only
let OrbitControls: any;
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls;
}

// ===== Types from your dataset =====
export type Star = {
    name: string;
    ra_h: number;       // 0..24 (hours)
    dec_d: number;      // -90..+90 (degrees)
    book?: string;
    chapter?: number;
    testament?: string;
    division?: string;
    division_color?: string;
    verses?: number;
    icon?: string;
};

export type SkyMapProps = {
    starsUrl?: string;              // default "/stars.json"
    horizonLocked?: boolean;        // lock camera above horizon
    maxDpr?: number;                // cap device pixel ratio
    fov?: number;                   // initial FOV (deg)
    autoConstellations?: boolean;   // build edges via nearest-neighbor
    nearestPerNode?: number;        // edges per node for auto-graph
};

// ===== Math helpers =====
function sphToVec3(raRad: number, decRad: number, r = 1) {
    const x = r * Math.cos(decRad) * Math.cos(raRad);
    const y = r * Math.sin(decRad);
    const z = r * Math.cos(decRad) * Math.sin(raRad);
    return new THREE.Vector3(x, y, z);
}

function raHoursToRad(h: number) { return (h / 24) * Math.PI * 2; }
function degToRad(d: number) { return THREE.MathUtils.degToRad(d); }

// Great-circle distance on unit sphere
function chordDistance(a: THREE.Vector3, b: THREE.Vector3) { return a.distanceTo(b); }

// ===== Label drawing =====
function makeLabel(text: string, cssPx = 128) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const px = cssPx; canvas.width = px; canvas.height = px;
    ctx.clearRect(0,0,px,px);
    ctx.font = `500 ${Math.round(px*0.28)}px system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "white"; ctx.shadowBlur = Math.round(px*0.06); ctx.shadowColor = "rgba(0,0,0,0.9)";
    const lines = text.split("");
    if (lines.length === 1) ctx.fillText(text, px/2, px/2);
    else { const y0 = px/2 - (lines.length-1)*(px*0.25); lines.forEach((l,i)=>ctx.fillText(l, px/2, y0 + i*(px*0.5))); }
    const tex = new THREE.CanvasTexture(canvas); tex.anisotropy = 4; tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.0 });
    const spr = new THREE.Sprite(mat);
    (spr as any).userData = { cssW: px, cssH: px };
    return spr;
}

// Label fading & declutter (unchanged)
const fadeState = new WeakMap<THREE.Sprite, { a: number; t: number }>();
let lastCompute = 0; let lastFrame = 0; const tmp = new THREE.Vector3();
function updateLabelFading(group: THREE.Group, camera: THREE.PerspectiveCamera, opts?: { maxLabels?: number; radius?: number; throttleMs?: number; fadeInMs?: number; fadeOutMs?: number }) {
    const now = performance.now();
    const maxLabels = opts?.maxLabels ?? 24;
    const radius = opts?.radius ?? 0.65; // radius in NDC
    const throttleMs = opts?.throttleMs ?? 120;
    const fadeInMs = opts?.fadeInMs ?? 140;
    const fadeOutMs = opts?.fadeOutMs ?? 220;
    const dt = Math.max(0, now - lastFrame); lastFrame = now;

    if (now - lastCompute > throttleMs) {
        lastCompute = now;
        const sprites: { s: THREE.Sprite; r2: number; on: boolean }[] = [];
        group.traverse(obj => {
            if ((obj as any).isSprite) {
                const s = obj as THREE.Sprite; s.getWorldPosition(tmp); tmp.project(camera);
                const r2 = tmp.x*tmp.x + tmp.y*tmp.y; const on = Math.abs(tmp.z) <= 1 && r2 <= radius*radius;
                sprites.push({ s, r2, on });
            }
        });
        sprites.sort((a,b)=>a.r2-b.r2);
        let shown = 0;
        for (const { s, on } of sprites) {
            let st = fadeState.get(s); if (!st) { st = { a: 0, t: 0 }; fadeState.set(s, st); }
            st.t = (on && shown < maxLabels) ? 1 : 0; if (on && shown < maxLabels) shown++;
        }
    }

    group.traverse(obj => {
        if ((obj as any).isSprite) {
            const s = obj as THREE.Sprite; let st = fadeState.get(s) ?? { a:0, t:0 }; fadeState.set(s, st);
            const tau = st.t > st.a ? fadeInMs : fadeOutMs; const k = 1 - Math.exp(-(dt/Math.max(1,tau)));
            st.a = THREE.MathUtils.lerp(st.a, st.t, k);
            (s.material as THREE.SpriteMaterial).opacity = st.a;
        }
    });
}

// Pixel-precise auto-sizing for sprites (Angular-compatible)
function worldUnitsPerCssPixel(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, worldPos: THREE.Vector3) {
    const dist = camera.position.distanceTo(worldPos);
    const worldHeight = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const pixels = renderer.domElement.clientHeight || 1;
    return worldHeight / pixels; // world units per CSS pixel
}

function fitSpriteToPixels(spr: THREE.Sprite, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    const u = (spr as any).userData; if (!u) return;
    const cssW = u.cssW as number, cssH = u.cssH as number;
    const wp = new THREE.Vector3(); spr.getWorldPosition(wp);
    const wuPerPx = worldUnitsPerCssPixel(camera, renderer, wp);
    spr.scale.set(cssW * wuPerPx, cssH * wuPerPx, 1);
}

function fitSpriteGroupToPixels(group: THREE.Group, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    group.traverse(obj => { if ((obj as any).isSprite) fitSpriteToPixels(obj as THREE.Sprite, camera, renderer); });
}

// ===== Starfield =====
function hexToRgb01(hex: string) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
    if (!m) return [0.62, 0.75, 1.0] as const;
    return [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] as const;
}

function makeStarfield(stars: Star[]) {
    const n = stars.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const lum  = new Float32Array(n);

    let vMin = Infinity, vMax = -Infinity;
    for (const s of stars) if (typeof s.verses === "number") {
        vMin = Math.min(vMin, s.verses);
        vMax = Math.max(vMax, s.verses);
    }
    if (!isFinite(vMin) || !isFinite(vMax) || vMin === vMax) { vMin = 10; vMax = 50; }

    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
        const s = stars[i];
        v.copy(sphToVec3(raHoursToRad(s.ra_h), degToRad(s.dec_d), 1));
        pos.set([v.x, v.y, v.z], i * 3);

        const [r, g, b] = hexToRgb01(s.division_color || "#9fbfff");
        col.set([r, g, b], i * 3);

        // verse-weighted brightness (root curve)
        const t = Math.sqrt((Math.max(vMin, Math.min(vMax, s.verses ?? vMin)) - vMin) / (vMax - vMin + 1e-6));
        size[i] = 2.0 + t * 7.0;  // 2..9 px
        lum[i]  = t;              // 0..1
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geom.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    geom.setAttribute("aSize",    new THREE.BufferAttribute(size, 1));
    geom.setAttribute("aLum",     new THREE.BufferAttribute(lum, 1));

    const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        uniforms: { uPixelRatio: { value: (typeof window !== "undefined" ? window.devicePixelRatio : 1) } },
        vertexShader: /*glsl*/`
      attribute float aSize;
      attribute float aLum;
      varying vec3 vColor;
      varying float vLum;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vLum = aLum;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
        fragmentShader: /*glsl*/`
      precision mediump float;
      varying vec3 vColor;
      varying float vLum;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float core = smoothstep(0.0, 0.2, 1.0 - r);
        float halo = smoothstep(1.0, 0.0, r);
        float a = mix(halo * 0.75, 1.0, core) * mix(0.5, 1.0, vLum);
        gl_FragColor = vec4(vColor, a);
      }
    `,
    });

    const points = new THREE.Points(geom, mat);
    points.frustumCulled = false;
    return points;
}

// ===== Auto-constellation lines (nearest-neighbor graph) =====
function pickDivisionColor(list: Array<{ division?: string; division_color?: string }>): number {
    for (const s of list) if (s.division_color) return new THREE.Color(...hexToRgb01(s.division_color)).getHex();
    const div = (list[0]?.division || 'Division').toLowerCase();
    let h = 2166136261 >>> 0; for (let i=0;i<div.length;i++){ h ^= div.charCodeAt(i); h = Math.imul(h, 16777619); }
    const hue = (h % 360) / 360; const sat = 0.45; const lit = 0.70; const c = new THREE.Color().setHSL(hue, sat, lit);
    return c.getHex();
}

function createLineMaterialWithHorizonFade(colorHex: number, opacity = 0.5, fadeLow = -80, fadeHigh = 120) {
    return new THREE.ShaderMaterial({
        transparent: true, depthTest: true, depthWrite: false, blending: THREE.NormalBlending,
        uniforms: { uColor:{value:new THREE.Color(colorHex)}, uOpacity:{value:opacity}, uFadeLow:{value:fadeLow}, uFadeHigh:{value:fadeHigh} },
        vertexShader: /*glsl*/`
      varying float vY; void main(){ vec4 worldPos = modelMatrix * vec4(position,1.0); vY = worldPos.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
        fragmentShader: /*glsl*/`
      precision mediump float; varying float vY; uniform vec3 uColor; uniform float uOpacity; uniform float uFadeLow; uniform float uFadeHigh;
      float smooth01(float x, float a, float b){ float t = clamp((x-a)/max(1e-5, b-a), 0.0, 1.0); return t*t*(3.0-2.0*t); }
      void main(){ float t = smooth01(vY, uFadeLow, uFadeHigh); float alpha = uOpacity * t; if (alpha < 0.01) discard; gl_FragColor = vec4(uColor, alpha); }
    `,
    });
}

function computeLocalBasis(points: THREE.Vector3[]) {
    const n = new THREE.Vector3(); for (const p of points) n.add(p); if (n.lengthSq() < 1e-8) n.set(0,1,0); n.normalize();
    const ref = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0,1,0) : new THREE.Vector3(1,0,0);
    const u = new THREE.Vector3().crossVectors(ref, n).normalize();
    const v = new THREE.Vector3().crossVectors(n, u).normalize();
    return { u, v, n };
}

function mstEdges2D(points: THREE.Vector2[]): Array<[number, number]> {
    const n = points.length; if (n<=1) return [];
    const inTree = new Array(n).fill(false), minD = new Array(n).fill(Infinity), parent = new Array(n).fill(-1);
    inTree[0]=true; for(let j=1;j<n;j++){ minD[j]=points[0].distanceTo(points[j]); parent[j]=0; }
    const edges: Array<[number,number]> = [];
    for(let k=0;k<n-1;k++){
        let v=-1, best=Infinity; for(let j=0;j<n;j++) if(!inTree[j] && minD[j]<best){ best=minD[j]; v=j; }
        if(v===-1) break; inTree[v]=true; const p=parent[v]; edges.push(p<v?[p,v]:[v,p]);
        for(let w=0;w<n;w++) if(!inTree[w]){ const d=points[v].distanceTo(points[w]); if(d<minD[w]){ minD[w]=d; parent[w]=v; } }
    }
    return edges;
}

function nearestNeighborExtras(points: THREE.Vector2[], kPerNode: number, existing: Set<string>): Array<[number, number]> {
    if (kPerNode<=0) return [];
    const n = points.length, extras: Array<[number,number]> = [];
    for (let i=0;i<n;i++){
        const order = Array.from({length:n},(_,j)=>j).filter(j=>j!==i).sort((a,b)=>points[i].distanceTo(points[a]) - points[i].distanceTo(points[b]));
        let added=0; for(const j of order){ const key = i<j?`${i}-${j}`:`${j}-${i}`; if(existing.has(key)) continue; existing.add(key); extras.push(i<j?[i,j]:[j,i]); if(++added>=kPerNode) break; }
    }
    return extras;
}

function buildBookConstellations(stars: Star[], radius = 1.0, opts: { extraNearestPerNode?: number; opacity?: number; fadeLow?: number; fadeHigh?: number } = {}) {
    const { extraNearestPerNode = 1, opacity = 0.5, fadeLow = -0.08, fadeHigh = 0.12 } = opts; // y thresholds on unit sphere
    const group = new THREE.Group();
    // Group by book
    const byBook = new Map<string, Star[]>();
    for (const s of stars){ const key = s.book || (s.name?.split(' ')[0] ?? ''); const arr = byBook.get(key) || []; arr.push(s); byBook.set(key, arr); }
    for (const [book, raw] of byBook){
        const chapters = raw.slice().sort((a,b)=> (a.chapter??0)-(b.chapter??0)); if (chapters.length<2) continue;
        const P3 = chapters.map(s => sphToVec3(raHoursToRad(s.ra_h), degToRad(s.dec_d), 1).normalize());
        const { u, v, n } = computeLocalBasis(P3);
        const P2 = P3.map(p => { const pn = p.clone().sub(n.clone().multiplyScalar(p.dot(n))).normalize(); return new THREE.Vector2(pn.dot(u), pn.dot(v)); });
        const mst = mstEdges2D(P2);
        const existing = new Set(mst.map(([i,j]) => i<j?`${i}-${j}`:`${j}-${i}`));
        const extras = nearestNeighborExtras(P2, extraNearestPerNode, existing);
        const edges = mst.concat(extras);
        const arr: number[] = [];
        for (const [i,j] of edges){ const a = P3[i].clone().multiplyScalar(radius*0.999); const b = P3[j].clone().multiplyScalar(radius*0.999); arr.push(a.x,a.y,a.z,b.x,b.y,b.z); }
        if (!arr.length) continue;
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(arr,3));
        const colorHex = pickDivisionColor(chapters);
        const mat = createLineMaterialWithHorizonFade(colorHex, opacity, fadeLow, fadeHigh);
        const lines = new THREE.LineSegments(geo, mat); lines.frustumCulled=false; lines.renderOrder=0; group.add(lines);
    }
    return group;
}

// ===== Ground dome + horizon glow (occludes below-horizon stars) =====
function makeGround() {
    const group = new THREE.Group();
    // Occluding hemisphere (depthWrite true, BackSide)
    const hemiGeom = new THREE.SphereGeometry(50, 48, 32);
    const hemiMat = new THREE.MeshBasicMaterial({ color: 0x041425, side: THREE.BackSide, depthWrite: true, transparent: true, opacity: 0.42 });
    group.add(new THREE.Mesh(hemiGeom, hemiMat));
    // Horizon ring glow (screen-facing) — simple shader quad billboard
    const plane = new THREE.PlaneGeometry(100,100);
    const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: {},
        vertexShader: /*glsl*/`
      varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
        fragmentShader: /*glsl*/`
      varying vec2 vUv; void main(){ vec2 p = vUv*2.0-1.0; float r = length(p);
        float a = smoothstep(1.0, 0.6, r) * 0.25; gl_FragColor = vec4(0.5,0.7,1.0, a); }
    `,
        blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(plane, mat); glow.position.set(0,0, -10); group.add(glow);
    return group;
}

// ===== Main component =====
export default function SkyMap({
                                   starsUrl = "/stars.json",
                                   horizonLocked = true,
                                   maxDpr = 2,
                                   fov = 75,
                                   autoConstellations = true,
                                   nearestPerNode = 2,
                               }: SkyMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<any | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);

    const skyGroupRef = useRef<THREE.Group | null>(null);   // rotates with time
    const groundGroupRef = useRef<THREE.Group | null>(null); // static horizon/ground
    const labelGroupRef = useRef<THREE.Group | null>(null);

    const loaders = useMemo(() => ({
        loadStars: async (): Promise<Star[]> => { const res = await fetch(starsUrl); return await res.json(); },
    }), [starsUrl]);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020814); sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(fov, container.clientWidth/container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 2.8); cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(maxDpr, window.devicePixelRatio || 1));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace; rendererRef.current = renderer; container.appendChild(renderer.domElement);

        // Stash viewport height so worldUnitsPerCssPixel works
        (camera as any).viewportHeightPx = container.clientHeight;

        // Controls
        if (OrbitControls) {
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; controls.dampingFactor = 0.08; controls.rotateSpeed = 0.5;
            controls.enablePan = false; controls.enableZoom = true; controls.minDistance = 1.2; controls.maxDistance = 10;
            if (horizonLocked) { const EPS = THREE.MathUtils.degToRad(0.5); controls.minPolarAngle = EPS; controls.maxPolarAngle = Math.PI/2 - EPS; }
            else { controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI; }
            controlsRef.current = controls;
        }

        // Ambient light
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));

        // Groups
        const skyGroup = new THREE.Group(); const groundGroup = new THREE.Group(); const labelGroup = new THREE.Group();
        scene.add(skyGroup); scene.add(groundGroup); skyGroup.add(labelGroup);
        skyGroupRef.current = skyGroup; groundGroupRef.current = groundGroup; labelGroupRef.current = labelGroup;

        // Ground dome + glow
        groundGroup.add(makeGround());

        // Wheel-to-FOV & double-click reset
        const MIN_FOV = 35, MAX_FOV = 90, FOV_STEP = 3;
        const onWheel = (e: WheelEvent) => { e.preventDefault(); const dir = Math.sign(e.deltaY);
            camera.fov = THREE.MathUtils.clamp(camera.fov + dir*FOV_STEP, MIN_FOV, MAX_FOV); camera.updateProjectionMatrix(); fitSpriteGroupToPixels(labelGroup, camera, renderer, 128); };
        const onDblClick = () => { camera.fov = fov; camera.updateProjectionMatrix(); fitSpriteGroupToPixels(labelGroup, camera, renderer, 128); };
        renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
        renderer.domElement.addEventListener("dblclick", onDblClick);

        let raf = 0; let running = true;
        const animate = () => {
            if (!running) return; raf = requestAnimationFrame(animate);
            controlsRef.current?.update?.();
            // Simulate sky rotation (replace with real LST if desired)
            skyGroup.rotation.y += 0.0003;
            // Update labels
            updateLabelFading(labelGroup, camera);
            renderer.render(scene, camera);
        };

        const onResize = () => {
            const w = container.clientWidth, h = container.clientHeight;
            renderer.setSize(w, h); camera.aspect = w/h; (camera as any).viewportHeightPx = h; camera.updateProjectionMatrix();
            fitSpriteGroupToPixels(labelGroup, camera, renderer, 128);
        };
        window.addEventListener("resize", onResize);

        (async () => {
            const stars = await loaders.loadStars();
            const points = makeStarfield(stars); skyGroup.add(points);

            // Labels (icon + name)
            for (const s of stars) {
                const text = `${s.icon ? s.icon + ' ' : ''}${s.name ?? ''}`.trim(); if (!text) continue;
                const spr = makeLabel(text);
                const p = sphToVec3(raHoursToRad(s.ra_h), degToRad(s.dec_d), 1.01); spr.position.copy(p);
                labelGroup.add(spr);
            }

            // Initial pixel-fitting for labels
            fitSpriteGroupToPixels(labelGroup, camera, renderer, 128);

            // Auto-constellations (optional)
            if (autoConstellations) {
                const lines = buildBookConstellations(stars, 1.0, { extraNearestPerNode: nearestPerNode, opacity: 0.5, fadeLow: -0.08, fadeHigh: 0.12 });
                skyGroup.add(lines);
            }

            animate();
        })();

        return () => {
            running = false; cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            renderer.domElement.removeEventListener("wheel", onWheel as any);
            renderer.domElement.removeEventListener("dblclick", onDblClick as any);
            controlsRef.current?.dispose?.();
            scene.traverse(obj => {
                const anyObj = obj as any; anyObj.geometry?.dispose?.();
                if (anyObj.material) { Array.isArray(anyObj.material) ? anyObj.material.forEach((m: any)=>m.dispose?.()) : anyObj.material.dispose?.(); }
                anyObj.texture?.dispose?.();
            });
            renderer.dispose(); container.removeChild(renderer.domElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [starsUrl, horizonLocked, maxDpr, fov, autoConstellations, nearestPerNode]);

    return <div ref={containerRef} className="relative w-full h-full" />;
}
