"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { initLandscape } from "@/app/play/[game]/map/utils/scene-utils";

let OrbitControls: any;
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls;
}

import { makeLabel, updateLabelLayoutAndFading, fitSpriteGroupToPixels } from "./utils/label-utils";
import { Star, buildStarfield, buildPickingPoints, sphToVec3, raHoursToRad, deg2rad } from "./utils/star-utils";
import {createGalaxy} from "@/app/play/[game]/map/utils/galaxy-utils";

export default function SkyMap(props: any){
    const containerRef=useRef<HTMLDivElement|null>(null); const rendererRef=useRef<THREE.WebGLRenderer|null>(null); const cameraRef=useRef<THREE.PerspectiveCamera|null>(null); const controlsRef=useRef<any|null>(null); const sceneRef=useRef<THREE.Scene|null>(null);
    const pickPtsRef=useRef<THREE.Points|null>(null); const starsRef=useRef<Star[]|null>(null); const starfieldRef=useRef<THREE.Points|null>(null); const labelsRef=useRef<THREE.Group|null>(null);
    const nebulaRef = useRef<THREE.Mesh|null>(null);
    const mouseRef=useRef(new THREE.Vector2());
    const horizonLabelsRef = useRef<THREE.Group|null>(null);
    const bookLabelsRef = useRef<THREE.Group|null>(null);

    // highlight & hover state
    const highlightIndex=useRef<number>(-1); const highlightAmt=useRef<number>(0); const prevTime=useRef<number>(performance.now()/1000);
    let hoverIdx=-1; let hoverEase=0; // 0..1
    let cycleList:number[]=[]; let cyclePos=0; let lastClick={x:0,y:0};

    // drag guard
    const downPos=useRef<{x:number;y:number}|null>(null); const DRAG_TOL=5;

    const BOOK_ZOOM_FOV = 42; // tweak to taste

    const starsUrl="/stars.json";
    const data=useMemo(()=>({ loadStars: async():Promise<Star[]>=>{ const res=await fetch(starsUrl); return await res.json(); } }),[starsUrl]);

    useEffect(()=> {
        if (!containerRef.current) return;
        const container: HTMLDivElement = containerRef.current;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020814);
        sceneRef.current = scene;

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        const galaxy = createGalaxy();
        scene.add(galaxy);

        const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 1000);
        camera.position.set(0,0,0.01);
        camera.up.set(0,1,0);
        cameraRef.current=camera;

        const renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.outputColorSpace=THREE.SRGBColorSpace; rendererRef.current=renderer;
        container.appendChild(renderer.domElement);

        if (OrbitControls) {
            const c=new OrbitControls(camera, renderer.domElement);
            c.enableDamping=true;
            c.dampingFactor=0.08;
            c.rotateSpeed=0.5;
            c.enableZoom=true;
            c.minDistance=0.01;
            c.maxDistance=2
            c.enablePan=false;
            controlsRef.current=c;
        }

        const labels = new THREE.Group();
        scene.add(labels);
        labelsRef.current = labels;

        const horizonLabels = new THREE.Group();
        scene.add(horizonLabels);
        horizonLabelsRef.current = horizonLabels;

        const bookLabels = new THREE.Group();
        scene.add(bookLabels);
        bookLabelsRef.current = bookLabels;

        bookLabels.visible = true;
        labels.visible = false;

        const ground: any = initLandscape();
        scene.add(ground);

        // Wheel zoom + double-click reset
        const BASE_FOV=75; const MIN_FOV=0, MAX_FOV=100, STEP=0.5;
        const onWheel: any = (e:WheelEvent): void => {
            e.preventDefault();
            const dir: number = Math.sign(e.deltaY);
            camera.fov = THREE.MathUtils.clamp(camera.fov+dir*STEP, MIN_FOV, MAX_FOV);
            camera.updateProjectionMatrix();
            if (labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer);
            if (bookLabelsRef.current) fitSpriteGroupToPixels(bookLabelsRef.current, camera, renderer);
        };
        const onDbl: any = (): void => {
            camera.fov=BASE_FOV;
            camera.updateProjectionMatrix();
            if (labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer);
            if (bookLabelsRef.current) fitSpriteGroupToPixels(bookLabelsRef.current, camera, renderer);
        };
        renderer.domElement.addEventListener('wheel', onWheel, { passive:false }); renderer.domElement.addEventListener('dblclick', onDbl);

        const onResize=()=>{
            const w=container.clientWidth, h=container.clientHeight;
            renderer.setSize(w,h);
            camera.aspect=w/h;
            camera.updateProjectionMatrix();
            if (labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer);
            if (bookLabelsRef.current) fitSpriteGroupToPixels(bookLabelsRef.current, camera, renderer);
            if (nebulaRef.current) {
                (nebulaRef.current.material as THREE.ShaderMaterial).uniforms.uResolution.value.x = w;
                (nebulaRef.current.material as THREE.ShaderMaterial).uniforms.uResolution.value.y = h;
            }
        };
        window.addEventListener('resize', onResize);
        onResize(); // initial call

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
            if (idx !== undefined) {
                hoverIdx = idx;
                highlightIndex.current = idx;
                highlightAmt.current = 1;
                const s=starsRef.current?.[idx];
                if (s && s.book && typeof s.chapter==='number' && typeof props?.select ==='function') {
                    props.select(s.book, s.chapter);
                }
            }
        };

        const onPointerMove=(e:PointerEvent)=>{ ndcFromEvent(e); rebuildHover(e); renderer.domElement.style.cursor = hoverIdx!==-1 ? 'pointer' : ''; };

        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('click', onClick);
        renderer.domElement.addEventListener('pointermove', onPointerMove);

        // animate
        let raf: number = 0;
        let running: boolean = true;
        const animate: any = ()=> {
            if (!running) return;
            raf=requestAnimationFrame(animate);
            controlsRef.current?.update?.();
            const now=performance.now()/1000;
            const dt=Math.max(0, Math.min(0.1, now - prevTime.current));
            prevTime.current=now;
            const k=1 - Math.exp(-dt/0.75);
            highlightAmt.current += (0 - highlightAmt.current)*k;

            if (starfieldRef.current){
                const mat=starfieldRef.current.material as THREE.ShaderMaterial; mat.uniforms.uTime.value = now; mat.uniforms.uHighlightIndex.value = highlightIndex.current; mat.uniforms.uHighlightAmt.value = highlightAmt.current; // hover easing fast
                const hk = 1 - Math.exp(-dt/0.12); hoverEase += ((hoverIdx!==-1?1:0) - hoverEase) * hk; mat.uniforms.uHoverIndex.value = hoverIdx; mat.uniforms.uHoverAmt.value = hoverEase;
            }

            if (bookLabelsRef.current || labelsRef.current){
                const bookMode = useBookMode();
                if (bookLabelsRef.current) bookLabelsRef.current.visible = bookMode;
                if (labelsRef.current)     labelsRef.current.visible     = !bookMode;

                if (bookMode && bookLabelsRef.current){
                    updateLabelLayoutAndFading(bookLabelsRef.current, camera, renderer);
                    fitSpriteGroupToPixels(bookLabelsRef.current, camera, renderer);
                } else if (!bookMode && labelsRef.current){
                    updateLabelLayoutAndFading(labelsRef.current, camera, renderer);
                    fitSpriteGroupToPixels(labelsRef.current, camera, renderer);
                }
            }

            if (horizonLabelsRef.current) fitSpriteGroupToPixels(horizonLabelsRef.current, camera, renderer);
            if (nebulaRef.current) {
                (nebulaRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = now;
            }

            renderer.render(scene, camera);
        };

        (async()=> {
            const stars: Star[] = await data.loadStars();
            starsRef.current = stars;

            const field = buildStarfield(stars, props.found, props.target);
            starfieldRef.current = field;
            scene.add(field);

            const picking = buildPickingPoints(stars);
            scene.add(picking);
            pickPtsRef.current = picking;

            // initial labels build (will also be called by update effect)
            rebuildLabels();
            rebuildBookLabels();
            rebuildHorizonDivisionLabels();
            animate();
        })();

        return ()=>{
            running=false;
            cancelAnimationFrame(raf);
            renderer.domElement.removeEventListener('wheel', onWheel as any);
            renderer.domElement.removeEventListener('dblclick', onDbl as any);
            window.removeEventListener('resize', onResize as any);
            renderer.domElement.removeEventListener('pointerdown', onPointerDown as any);
            renderer.domElement.removeEventListener('click', onClick as any);
            renderer.domElement.removeEventListener('pointermove', onPointerMove as any);
            controlsRef.current?.dispose?.();
            scene.traverse((o:any)=>{
                o.geometry?.dispose?.();
                if(o.material){ Array.isArray(o.material) ? o.material.forEach((m:any)=> m.dispose?.()) : o.material.dispose?.(); } });
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, [data]);


// --- UPDATE EFFECT: when found/target changes, swap starfield + rebuild labels only
    useEffect(() => {
        const scene = sceneRef.current;
        const stars = starsRef.current;
        if (!scene || !stars) return; // not initialized yet

        // dispose helper
        const disposePoints = (obj: THREE.Points | null) => {
            if (!obj) return;
            (obj.geometry as any)?.dispose?.();
            const mat = obj.material as any;
            if (Array.isArray(mat)) mat.forEach(m => m?.dispose?.());
            else mat?.dispose?.();
        };

        // replace starfield only; keep camera/controls/picking intact
        if (starfieldRef.current) {
            scene.remove(starfieldRef.current);
            disposePoints(starfieldRef.current);
            starfieldRef.current = null;
        }
        const newField = buildStarfield(stars, props.found, props.target);
        starfieldRef.current = newField;
        scene.add(newField);

        // labels reflect new filters/target
        rebuildLabels();
        rebuildBookLabels();
        rebuildHorizonDivisionLabels();
    }, [props.found, props.target]);

    function rebuildBookLabels(){
        const group = bookLabelsRef.current;
        const stars = starsRef.current;
        const camera = cameraRef.current!;
        const renderer = rendererRef.current!;
        if (!group || !stars || !starfieldRef.current) return;

        // clear old
        while (group.children.length) {
            const child = group.children.pop()!;
            (child as any).material?.dispose?.();
            (child as any).geometry?.dispose?.();
        }

        // prepare aLum per-star for prominence scoring
        const lumAttr = (starfieldRef.current.geometry as THREE.BufferGeometry).getAttribute('aLum') as THREE.BufferAttribute | undefined;

        // aggregate by book
        type Agg = { idxs: number[]; ras: number[]; decs: number[]; divColor?: string };
        const byBook = new Map<string, Agg>();
        for (let i=0; i<stars.length; i++){
            const s = stars[i];
            // respect your existing “found/target” filters (books outside the current slice shouldn’t get a label)
            let disabled = false;
            if (props.found.testamentFound && s.testament != props.target.testament) disabled = true;
            else if (props.found.divisionFound && s.division != props.target.division) disabled = true;
            if (disabled) continue;

            const key: string = s.book!;
            const e = byBook.get(key!) ?? { idxs: [], ras: [], decs: [], divColor: s.division_color as string | undefined };
            e.idxs.push(i);
            e.ras.push(s.ra_h);
            e.decs.push(s.dec_d);
            if (!e.divColor && s.division_color) e.divColor = s.division_color as string;
            byBook.set(key, e);
        }

        // build labels
        const R = 1.02;           // slightly outside the star sphere
        const LIFT = 6 * Math.PI/180; // nudge "above" centroid ~6° in Dec for readability
        for (const [book, agg] of byBook){
            // circular mean of RA to avoid wrap
            let sx=0, sy=0;
            for (const raH of agg.ras){ const a = raHoursToRad(raH); sx += Math.cos(a); sy += Math.sin(a); }
            const meanRA = Math.atan2(sy, sx);

            // average Dec then lift
            const meanDec = deg2rad(agg.decs.reduce((a,b)=>a+b, 0) / Math.max(1, agg.decs.length)) + LIFT;

            // approximate prominence = top luminance among that book
            let lum = 0.5;
            if (lumAttr && agg.idxs.length){
                lum = agg.idxs.reduce((m,i)=> Math.max(m, lumAttr.getX(i) ?? 0.5), 0.5);
            }

            const spr = makeLabel(book, {
                fontPx: 26,
                maxWidthPx: 360,
                paddingPx: 10,
                // if you added color support earlier, this will tint; if not, it's harmless and ignored
                // @ts-ignore optional enhancement (see label-utils tweak below)
                color: agg.divColor ?? "#ffffff",
                // @ts-ignore
                shadowColor: "rgba(0,0,0,0.95)",
            });
            (spr as any).userData.lum = lum;
            (spr as any).userData.scale = 1.0;

            // place slightly “above” the cluster
            const p = sphToVec3(meanRA, meanDec, R);
            spr.position.copy(p);

            // allow fader to manage occlusion/overlap
            (spr.material as THREE.SpriteMaterial).depthWrite = false;
            group.add(spr);
        }

        fitSpriteGroupToPixels(group, camera, renderer);
    }

    function useBookMode(){
        // force chapter mode when a book is “found”; otherwise use FOV to infer zoom
        if (props.found.bookFound) return false;
        const cam = cameraRef.current!;
        return cam.fov > BOOK_ZOOM_FOV;
    }

    function rebuildHorizonDivisionLabels() {
        const horizon = horizonLabelsRef.current;
        const stars = starsRef.current;
        const camera = cameraRef.current!;
        const renderer = rendererRef.current!;
        if (!horizon || !stars) return;

        // clear old
        while (horizon.children.length) {
            const child = horizon.children.pop()!;
            (child as any).material?.dispose?.();
            (child as any).geometry?.dispose?.();
        }

        // group stars by division
        const byDiv = new Map<string, { ras: number[]; color?: string }>();
        for (const s of stars) {
            const e = byDiv.get(s.division!) ?? { ras: [], color: s.division_color as string | undefined };
            e.ras.push(s.ra_h);
            if (!e.color && s.division_color) e.color = s.division_color as string;
            byDiv.set(s.division!, e);
        }

        // place on horizon (dec = 0°) slightly outside the star sphere
        const R = 1.015;
        for (const [division, info] of byDiv) {
            let sx = 0, sy = 0;
            for (const raH of info.ras) {
                const a = raHoursToRad(raH);
                sx += Math.cos(a); sy += Math.sin(a);
            }
            const meanA = Math.atan2(sy, sx);

            const spr = makeLabel(division, {
                fontPx: 24,
                maxWidthPx: 360,
                paddingPx: 10,
                color: info.color ?? "#ffffff",          // ← use division color
                shadowColor: "rgba(0,0,0,0.95)",
            });
            const mat = spr.material as THREE.SpriteMaterial;
            mat.depthTest = false; // always on top of geometry
            mat.opacity = 1.0;     // not managed by auto-fader

            const p = sphToVec3(meanA, deg2rad(0), R);
            spr.position.copy(p);
            (spr as any).userData.scale = 1.0;

            horizon.add(spr);
        }

        fitSpriteGroupToPixels(horizon, camera, renderer);
    }

// --- shared label rebuild used by init + updates
    function rebuildLabels(){
        const labels = labelsRef.current;
        const stars = starsRef.current;
        const camera = cameraRef.current!;
        const renderer = rendererRef.current!;
        if (!labels || !stars || !starfieldRef.current) return;

        // clear old labels (dispose materials/geometries)
        while (labels.children.length) {
            const child = labels.children.pop()!;
            (child as any).material?.dispose?.();
            (child as any).geometry?.dispose?.();
        }

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const text = s.name;
            let disabled = false;
            if (props.found.testamentFound && s.testament != props.target.testament) disabled = true;
            else if (props.found.divisionFound && s.division != props.target.division) disabled = true;
            else if (props.found.bookFound && s.book != props.target.book) disabled = true;
            if (!text || disabled) continue;

            const spr = makeLabel(text, { fontPx: 28, maxWidthPx: 320, paddingPx: 10 });
            const p = sphToVec3(raHoursToRad(s.ra_h + 0.1), deg2rad(s.dec_d + 0.1), 1.01);
            spr.position.copy(p);
            const lum=((starfieldRef.current!.geometry as THREE.BufferGeometry).getAttribute('aLum') as THREE.BufferAttribute).getX(i) ?? 0.5;
            (spr as any).userData.lum=lum;
            (spr as any).userData.scale = 0.9 + 0.45*lum;
            labels.add(spr);
        }
        fitSpriteGroupToPixels(labels, camera, renderer);
    }

    return <div ref={containerRef} className="absolute h-[100vh] w-full top-0" />;
}
