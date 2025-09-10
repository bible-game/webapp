"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { initLandscape } from "@/app/play/[game]/map/scene-utils";

let OrbitControls: any;
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls;
}

export type Star = {
    name: string;
    ra_h: number;
    dec_d: number;
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

// ===== Labels =====
/**
 * Make a crisp, auto-sized sprite label with word-wrapping.
 * - Sizes the canvas to the measured text (no more fixed square!)
 * - Stores desired CSS pixel size on sprite.userData so we can keep
 *   label size constant on screen in `fitSpriteToPixels`.
 */
function makeLabel(text: string, opts?: { fontPx?: number; maxWidthPx?: number; paddingPx?: number; align?: CanvasTextAlign }) {
    const fontPx = opts?.fontPx ?? 28;           // visual font size in CSS px
    const maxWidthPx = opts?.maxWidthPx ?? 280;  // wrap long titles nicely
    const paddingPx = opts?.paddingPx ?? 12;
    const align: CanvasTextAlign = opts?.align ?? "center";

    // Prepare a measuring context
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const dpr = Math.min(2, window.devicePixelRatio || 1); // cap for memory
    const font = `500 ${fontPx}px system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.font = font;

    // Simple word-wrap (spaces and hyphens)
    const words = text.split(/([\s\-])/); // keep delimiters so we don't lose hyphens
    const lines: string[] = [];
    let line = "";
    const measure = (t: string) => ctx.measureText(t).width;
    for (const w of words) {
        const candidate = line + w;
        if (measure(candidate) > maxWidthPx && line) {
            lines.push(line.trim());
            line = w.trimStart();
        } else {
            line = candidate;
        }
    }
    if (line.trim()) lines.push(line.trim());

    const textW = Math.min(maxWidthPx, Math.max(...lines.map(measure), 1));
    const lineHeight = Math.round(fontPx * 1.2);
    const textH = lines.length * lineHeight;

    // Final CSS size we want on screen
    const cssW = Math.ceil(textW + paddingPx * 2);
    const cssH = Math.ceil(textH + paddingPx * 2);

    // Backing store pixels for crisp rendering
    canvas.width = Math.max(2, Math.ceil(cssW * dpr));
    canvas.height = Math.max(2, Math.ceil(cssH * dpr));

    // Draw at CSS scale
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";

    // Style
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = Math.round(fontPx * 0.4);

    // Draw
    const x = align === "center" ? cssW / 2 : align === "right" ? cssW - paddingPx : paddingPx;
    const y0 = Math.round(cssH / 2 - ((lines.length - 1) * lineHeight) / 2);
    lines.forEach((l, i) => ctx.fillText(l, x, y0 + i * lineHeight));

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false; // NPOT safety & crisper text

    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 });
    const spr = new THREE.Sprite(mat);
    (spr as any).userData = { cssW, cssH, scale: 1, lum: 0.5 };
    return spr;
}
const fadeState = new WeakMap<THREE.Sprite, { a: number; t: number }>();
let _lastCompute = 0; let _lastFrame = 0; const _tmp = new THREE.Vector3();
function updateLabelLayoutAndFading(group: THREE.Group, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, opts?: { maxLabels?: number; marginPx?: number; throttleMs?: number; fadeInMs?: number; fadeOutMs?: number }) {
    const now = performance.now();
    const maxLabels = opts?.maxLabels ?? 26;
    const marginPx = opts?.marginPx ?? 6;
    const throttleMs = opts?.throttleMs ?? 120;
    const fadeInMs = opts?.fadeInMs ?? 140;
    const fadeOutMs = opts?.fadeOutMs ?? 220;
    const dt = Math.max(0, now - _lastFrame); _lastFrame = now;

    const rect = renderer.domElement.getBoundingClientRect();

    if (now - _lastCompute > throttleMs) {
        _lastCompute = now;
        type Cand = { s: THREE.Sprite; lum: number; cx: number; cy: number; w: number; h: number; r2: number; z: number };
        const cand: Cand[] = [];
        group.traverse((o)=>{
            if ((o as any).isSprite){ const s=o as THREE.Sprite; s.getWorldPosition(_tmp); const p=_tmp.clone().project(camera); if(Math.abs(p.z)>1) return; const u=(s as any).userData || { cssW:0, cssH:0, scale:1, lum:0.5 }; const w=u.cssW*u.scale; const h=u.cssH*u.scale; const cx=(p.x*0.5+0.5)*rect.width; const cy=(-p.y*0.5+0.5)*rect.height; const r2=p.x*p.x + p.y*p.y; cand.push({ s, lum: u.lum ?? 0.5, cx, cy, w, h, r2, z: Math.abs(p.z) }); }
        });
        cand.sort((a,b)=> (b.lum - a.lum) || (a.r2 - b.r2) || (a.z - b.z));
        const chosen: Cand[]=[];
        const overlap=(a:Cand,b:Cand)=> !(a.cx+a.w/2+marginPx < b.cx-b.w/2 || a.cx-a.w/2-marginPx > b.cx+b.w/2 || a.cy+a.h/2+marginPx < b.cy-b.h/2 || a.cy-a.h/2-marginPx > b.cy+b.h/2);
        for (const c of cand){ if (chosen.length>=maxLabels) break; const within = c.cx>-c.w && c.cx<rect.width+c.w && c.cy>-c.h && c.cy<rect.height+c.h; if (!within) continue; let ok=true; for(const d of chosen){ if (overlap(c,d)){ ok=false; break; } } if (ok) chosen.push(c); }
        const set = new Set(chosen.map(c=>c.s));
        group.traverse((o)=>{ if ((o as any).isSprite){ const s=o as THREE.Sprite; let st=fadeState.get(s); if(!st){st={a:0,t:0}; fadeState.set(s,st);} st.t = set.has(s)? 1:0; } });
    }
    group.traverse((o)=>{ if ((o as any).isSprite){ const s=o as THREE.Sprite; let st=fadeState.get(s) ?? { a:0, t:0 }; fadeState.set(s, st); const tau = st.t > st.a ? fadeInMs : fadeOutMs; const k = 1 - Math.exp(-(dt/Math.max(1, tau))); st.a = THREE.MathUtils.lerp(st.a, st.t, k); (s.material as THREE.SpriteMaterial).opacity = st.a; } });
}
function worldUnitsPerCssPixel(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, worldPos: THREE.Vector3) {
    const dist = camera.position.distanceTo(worldPos);
    const worldH = 2 * dist * Math.tan(deg2rad(camera.fov * 0.5));
    const px = renderer.domElement.clientHeight || 1;
    return worldH / px;
}
function fitSpriteToPixels(s: THREE.Sprite, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    const u = (s as any).userData; if (!u) return; const wp = new THREE.Vector3(); s.getWorldPosition(wp); const wu = worldUnitsPerCssPixel(camera, renderer, wp); s.scale.set(u.cssW*wu, u.cssH*wu, 1);
}
function fitSpriteGroupToPixels(group: THREE.Group, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) { group.traverse((o)=>{ if ((o as any).isSprite) fitSpriteToPixels(o as THREE.Sprite, camera, renderer); }); }

// ===== Starfield shader =====
function hexToRgb01(hex: string) { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim()); if (!m) return [0.62,0.75,1.0] as const; return [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] as const; }
function buildStarfield(stars: Star[]) {
    const n = stars.length; const pos = new Float32Array(n*3); const col = new Float32Array(n*3); const size = new Float32Array(n); const lum = new Float32Array(n);
    let vMin=Infinity,vMax=-Infinity; for (const s of stars) if (typeof s.verses === 'number'){ vMin=Math.min(vMin,s.verses); vMax=Math.max(vMax,s.verses); }
    if (!isFinite(vMin)||!isFinite(vMax)||vMin===vMax){ vMin=10; vMax=50; }
    const v=new THREE.Vector3();
    for (let i=0;i<n;i++){ const s=stars[i]; v.copy(sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1)); pos.set([v.x,v.y,v.z], i*3); const [r,g,b]=hexToRgb01(s.division_color||"#9fbfff"); col.set([r,g,b], i*3); const t=Math.sqrt((Math.max(vMin, Math.min(vMax, s.verses ?? vMin))-vMin)/(vMax-vMin+1e-6)); size[i]=t/20; lum[i]=t; }
    const geom=new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.BufferAttribute(pos,3)); geom.setAttribute('color', new THREE.BufferAttribute(col,3)); geom.setAttribute('aSize', new THREE.BufferAttribute(size,1)); geom.setAttribute('aLum', new THREE.BufferAttribute(lum,1));
    const mat=new THREE.ShaderMaterial({ transparent:true, depthWrite:false, vertexColors:true, uniforms:{ uPixelRatio:{value: (typeof window!=='undefined'? window.devicePixelRatio:1)}, uHighlightIndex:{value:-1}, uHighlightAmt:{value:0}, uHoverIndex:{value:-1}, uHoverAmt:{value:0}, uTime:{value:0}},
        vertexShader: /*glsl*/`attribute float aSize; attribute float aLum; varying vec3 vColor; varying float vLum; varying float vIndex; uniform float uPixelRatio; void main(){ vColor=color; vLum=aLum; vIndex=float(gl_VertexID); vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=aSize*uPixelRatio*(300.0/ -mv.z); gl_Position=projectionMatrix*mv; }`,
        fragmentShader: /*glsl*/`precision mediump float; varying vec3 vColor; varying float vLum; varying float vIndex; uniform float uTime; uniform float uHighlightIndex; uniform float uHighlightAmt; uniform float uHoverIndex; uniform float uHoverAmt; void main(){ vec2 p=gl_PointCoord*2.0-1.0; float r=length(p); if(r>1.0) discard; float core=smoothstep(0.0,0.2,1.0-r); float halo=smoothstep(1.0,0.0,r); float a=mix(halo*0.75,1.0,core)*mix(0.5,1.0,vLum); vec3 col=vColor; if(abs(vIndex-uHoverIndex)<0.5){ float pulse=0.5+0.5*sin(uTime*6.28318); float amt=clamp(uHoverAmt*(0.4+0.6*pulse),0.0,1.0); col=mix(col,vec3(0.9,0.95,1.0),amt); a=mix(a,1.0,amt*0.6);} if(abs(vIndex-uHighlightIndex)<0.5){ float pulse=0.5+0.5*sin(uTime*6.28318); float amt=clamp(uHighlightAmt*(0.6+0.4*pulse),0.0,1.0); col=mix(col,vec3(1.0,1.0,0.5),amt); a=mix(a,1.0,amt);} gl_FragColor=vec4(col,a);} `});
    const points=new THREE.Points(geom, mat); points.frustumCulled=false; return points;
}

function buildPickingPoints(stars: Star[]) { const n=stars.length; const pos=new Float32Array(n*3); for (let i=0;i<n;i++){ const s=stars[i]; const v=sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1); pos.set([v.x,v.y,v.z], i*3);} const geom=new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.BufferAttribute(pos,3)); const mat=new THREE.PointsMaterial({ size:8, sizeAttenuation:false, transparent:true, opacity:0.0, depthTest:false }); const pts=new THREE.Points(geom, mat); pts.renderOrder=-1; return pts; }

export default function SkyMap(props: any){
    const containerRef=useRef<HTMLDivElement|null>(null); const rendererRef=useRef<THREE.WebGLRenderer|null>(null); const cameraRef=useRef<THREE.PerspectiveCamera|null>(null); const controlsRef=useRef<any|null>(null);
    const pickPtsRef=useRef<THREE.Points|null>(null); const starsRef=useRef<Star[]|null>(null); const starfieldRef=useRef<THREE.Points|null>(null); const labelsRef=useRef<THREE.Group|null>(null);
    const mouseRef=useRef(new THREE.Vector2());

    // highlight & hover state
    const highlightIndex=useRef<number>(-1); const highlightAmt=useRef<number>(0); const prevTime=useRef<number>(performance.now()/1000);
    let hoverIdx=-1; let hoverEase=0; // 0..1
    let cycleList:number[]=[]; let cyclePos=0; let lastClick={x:0,y:0};

    // drag guard
    const downPos=useRef<{x:number;y:number}|null>(null); const DRAG_TOL=5;

    const starsUrl="/stars.json";
    const data=useMemo(()=>({ loadStars: async():Promise<Star[]>=>{ const res=await fetch(starsUrl); return await res.json(); } }),[starsUrl]);

    useEffect(()=>{
        if (!containerRef.current) return; const container=containerRef.current;
        const scene=new THREE.Scene(); scene.background=new THREE.Color(0x020814);

        const camera=new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 1000); camera.position.set(0,0,0.01); camera.up.set(0,1,0); cameraRef.current=camera;
        const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); renderer.setSize(container.clientWidth, container.clientHeight); renderer.outputColorSpace=THREE.SRGBColorSpace; rendererRef.current=renderer; container.appendChild(renderer.domElement);

        if (OrbitControls){ const c=new OrbitControls(camera, renderer.domElement); c.enableDamping=true; c.dampingFactor=0.08; c.rotateSpeed=0.5; c.enableZoom=true; c.minDistance=0.01; c.maxDistance=2; c.enablePan=false; controlsRef.current=c; }

        const labels=new THREE.Group(); scene.add(labels); labelsRef.current=labels;
        const ground=initLandscape(); scene.add(ground);

        // Wheel zoom + double-click reset
        const BASE_FOV=75; const MIN_FOV=0, MAX_FOV=100, STEP=0.5;
        const onWheel=(e:WheelEvent)=>{ e.preventDefault(); const dir=Math.sign(e.deltaY); camera.fov=THREE.MathUtils.clamp(camera.fov+dir*STEP, MIN_FOV, MAX_FOV); camera.updateProjectionMatrix(); if (labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer); };
        const onDbl=()=>{ camera.fov=BASE_FOV; camera.updateProjectionMatrix(); if (labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer); };
        renderer.domElement.addEventListener('wheel', onWheel, { passive:false }); renderer.domElement.addEventListener('dblclick', onDbl);

        const onResize=()=>{ const w=container.clientWidth, h=container.clientHeight; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); if(labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer); };
        window.addEventListener('resize', onResize);

        // pointer helpers
        const ndcFromEvent=(e:MouseEvent|PointerEvent)=>{ const rect=renderer.domElement.getBoundingClientRect(); mouseRef.current.set(((e.clientX-rect.left)/rect.width)*2-1, -((e.clientY-rect.top)/rect.height)*2+1); };

        // Core: screen-space nearest candidates with adaptive tolerance and prominence tiebreak
        function collectCandidates(e: MouseEvent|PointerEvent){
            const cam=cameraRef.current, pick=pickPtsRef.current, rend=rendererRef.current, stars=starsRef.current; if(!cam||!pick||!rend||!stars) return null;
            const rect=rend.domElement.getBoundingClientRect(); const cx=e.clientX, cy=e.clientY; const posAttr=(pick.geometry as THREE.BufferGeometry).getAttribute('position') as THREE.BufferAttribute; const lumAttr=((starfieldRef.current?.geometry as THREE.BufferGeometry)?.getAttribute('aLum') as THREE.BufferAttribute|undefined);
            const tmp=new THREE.Vector3(); const list: Array<{index:number; d:number; lum:number}> = [];
            for (let i=0,n=posAttr.count;i<n;i++){ tmp.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)).project(cam); const sx=(tmp.x*0.5+0.5)*rect.width+rect.left; const sy=(-tmp.y*0.5+0.5)*rect.height+rect.top; const d=Math.hypot(cx-sx, cy-sy); const lum = lumAttr? lumAttr.getX(i) : 0.5; list.push({index:i, d, lum}); }
            list.sort((a,b)=> a.d - b.d || b.lum - a.lum);
            return { rect, list };
        }

        function adaptiveTolPx(){ const cam=cameraRef.current!; const dpr=window.devicePixelRatio||1; const fovT=THREE.MathUtils.clamp((cam.fov-20)/(100-20),0,1); return (Math.max(8, 10 + 6*fovT))*dpr; }

        function rebuildHover(e: PointerEvent){ const res=collectCandidates(e); if(!res) return; const enterTol=adaptiveTolPx(); const leaveTol=enterTol*1.5; if (hoverIdx!==-1){ // maintain or switch
            const currentD = res.list.find(c=>c.index===hoverIdx)?.d ?? Infinity; if (currentD>leaveTol){ const within=res.list.filter(c=>c.d<=enterTol); hoverIdx = within.length? within[0].index : -1; cycleList = within.map(c=>c.index); cyclePos=0; }
        } else { const within=res.list.filter(c=>c.d<=enterTol); if (within.length){ hoverIdx=within[0].index; cycleList=within.map(c=>c.index); cyclePos=0; } }
        }

        // drag guard helpers
        const onPointerDown=(e:PointerEvent)=>{ downPos.current={x:e.clientX, y:e.clientY}; };
        const exceededDrag=(e:MouseEvent|PointerEvent)=>{ if(!downPos.current) return false; const dx=e.clientX-downPos.current.x; const dy=e.clientY-downPos.current.y; return Math.hypot(dx,dy)>DRAG_TOL; };

        const onClick=(e:MouseEvent)=>{ ndcFromEvent(e); if (exceededDrag(e)) return; const res=collectCandidates(e); if(!res) return; const enterTol=adaptiveTolPx(); const moved = Math.hypot(e.clientX-lastClick.x, e.clientY-lastClick.y) <= 5; let idx:number|undefined;
            const within = res.list.filter(c=>c.d<=enterTol);
            if (moved && cycleList.length>1){ idx = cycleList[cyclePos % cycleList.length]; cyclePos++; }
            else if (within.length){ cycleList = within.map(c=>c.index); cyclePos=1; idx = within[0].index; lastClick={x:e.clientX,y:e.clientY}; }
            if (idx!==undefined){ hoverIdx = idx; highlightIndex.current = idx; highlightAmt.current = 1; const s=starsRef.current?.[idx]; if (s && s.book && typeof s.chapter==='number' && typeof props?.select==='function'){ props.select(s.book, s.chapter); } }
        };

        const onPointerMove=(e:PointerEvent)=>{ ndcFromEvent(e); rebuildHover(e); renderer.domElement.style.cursor = hoverIdx!==-1 ? 'pointer' : ''; };

        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('click', onClick);
        renderer.domElement.addEventListener('pointermove', onPointerMove);

        // animate
        let raf=0; let running=true; const animate=()=>{ if(!running) return; raf=requestAnimationFrame(animate); controlsRef.current?.update?.(); const now=performance.now()/1000; const dt=Math.max(0, Math.min(0.1, now - prevTime.current)); prevTime.current=now; const k=1 - Math.exp(-dt/0.75); highlightAmt.current += (0 - highlightAmt.current)*k; if (starfieldRef.current){ const mat=starfieldRef.current.material as THREE.ShaderMaterial; mat.uniforms.uTime.value = now; mat.uniforms.uHighlightIndex.value = highlightIndex.current; mat.uniforms.uHighlightAmt.value = highlightAmt.current; // hover easing fast
            const hk = 1 - Math.exp(-dt/0.12); hoverEase += ((hoverIdx!==-1?1:0) - hoverEase) * hk; mat.uniforms.uHoverIndex.value = hoverIdx; mat.uniforms.uHoverAmt.value = hoverEase; }
            if (labelsRef.current){ updateLabelLayoutAndFading(labelsRef.current, camera, renderer); fitSpriteGroupToPixels(labelsRef.current, camera, renderer); }
            renderer.render(scene, camera); };

        (async()=>{
            const stars=await data.loadStars(); starsRef.current=stars; const field=buildStarfield(stars); starfieldRef.current=field; scene.add(field); const picking=buildPickingPoints(stars); scene.add(picking); pickPtsRef.current=picking;
            // labels
            for (let i=0;i<stars.length;i++){ const s=stars[i]; const text=`${s.icon ? s.icon+" " : ""}${s.name ?? ""}`.trim(); if(!text) continue; const spr=makeLabel(text, { fontPx: 28, maxWidthPx: 320, paddingPx: 10 }); const p=sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1.01); spr.position.copy(p); const lum=((starfieldRef.current!.geometry as THREE.BufferGeometry).getAttribute('aLum') as THREE.BufferAttribute).getX(i) ?? 0.5; (spr as any).userData.lum=lum; (spr as any).userData.scale = 0.9 + 0.45*lum; labels.add(spr);}  fitSpriteGroupToPixels(labels, camera, renderer);
            animate(); })();

        return ()=>{ running=false; cancelAnimationFrame(raf); renderer.domElement.removeEventListener('wheel', onWheel as any); renderer.domElement.removeEventListener('dblclick', onDbl as any); window.removeEventListener('resize', onResize as any); renderer.domElement.removeEventListener('pointerdown', onPointerDown as any); renderer.domElement.removeEventListener('click', onClick as any); renderer.domElement.removeEventListener('pointermove', onPointerMove as any); controlsRef.current?.dispose?.(); scene.traverse((o:any)=>{ o.geometry?.dispose?.(); if(o.material){ Array.isArray(o.material) ? o.material.forEach((m:any)=>m.dispose?.()) : o.material.dispose?.(); } }); renderer.dispose(); container.removeChild(renderer.domElement); };
    }, [data]);

    return <div ref={containerRef} className="absolute h-[100vh] w-full top-0" />;
}
