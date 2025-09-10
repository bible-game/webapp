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

export default function SkyMap(props: any){
    const containerRef=useRef<HTMLDivElement|null>(null); const rendererRef=useRef<THREE.WebGLRenderer|null>(null); const cameraRef=useRef<THREE.PerspectiveCamera|null>(null); const controlsRef=useRef<any|null>(null);
    const pickPtsRef=useRef<THREE.Points|null>(null); const starsRef=useRef<Star[]|null>(null); const starfieldRef=useRef<THREE.Points|null>(null); const labelsRef=useRef<THREE.Group|null>(null);
    const nebulaRef = useRef<THREE.Mesh|null>(null);
    const mouseRef=useRef(new THREE.Vector2());

    // highlight & hover state
    const highlightIndex=useRef<number>(-1); const highlightAmt=useRef<number>(0); const prevTime=useRef<number>(performance.now()/1000);
    let hoverIdx=-1; let hoverEase=0; // 0..1
    let cycleList:number[]=[]; let cyclePos=0; let lastClick={x:0,y:0};

    // drag guard
    const downPos=useRef<{x:number;y:number}|null>(null); const DRAG_TOL=5;

    const starsUrl="/stars.json";
    const data=useMemo(()=>({ loadStars: async():Promise<Star[]>=>{ const res=await fetch(starsUrl); return await res.json(); } }),[starsUrl]);

    useEffect(()=> {
        if (!containerRef.current) return;
        const container: HTMLDivElement = containerRef.current;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020814);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

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

        const ground: any = initLandscape();
        scene.add(ground);

        // Wheel zoom + double-click reset
        const BASE_FOV=75; const MIN_FOV=0, MAX_FOV=100, STEP=0.5;
        const onWheel=(e:WheelEvent)=>{ e.preventDefault(); const dir=Math.sign(e.deltaY); camera.fov=THREE.MathUtils.clamp(camera.fov+dir*STEP, MIN_FOV, MAX_FOV); camera.updateProjectionMatrix(); if (labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer); };
        const onDbl=()=>{ camera.fov=BASE_FOV; camera.updateProjectionMatrix(); if (labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer); };
        renderer.domElement.addEventListener('wheel', onWheel, { passive:false }); renderer.domElement.addEventListener('dblclick', onDbl);

        const onResize=()=>{
            const w=container.clientWidth, h=container.clientHeight;
            renderer.setSize(w,h);
            camera.aspect=w/h;
            camera.updateProjectionMatrix();
            if(labelsRef.current) fitSpriteGroupToPixels(labelsRef.current, camera, renderer);
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
        let raf=0; let running=true; const animate=()=>{ if(!running) return; raf=requestAnimationFrame(animate); controlsRef.current?.update?.(); const now=performance.now()/1000; const dt=Math.max(0, Math.min(0.1, now - prevTime.current)); prevTime.current=now; const k=1 - Math.exp(-dt/0.75); highlightAmt.current += (0 - highlightAmt.current)*k;
            if (starfieldRef.current){
                const mat=starfieldRef.current.material as THREE.ShaderMaterial; mat.uniforms.uTime.value = now; mat.uniforms.uHighlightIndex.value = highlightIndex.current; mat.uniforms.uHighlightAmt.value = highlightAmt.current; // hover easing fast
                const hk = 1 - Math.exp(-dt/0.12); hoverEase += ((hoverIdx!==-1?1:0) - hoverEase) * hk; mat.uniforms.uHoverIndex.value = hoverIdx; mat.uniforms.uHoverAmt.value = hoverEase;
            }
            if (labelsRef.current){
                updateLabelLayoutAndFading(labelsRef.current, camera, renderer);
                fitSpriteGroupToPixels(labelsRef.current, camera, renderer);
            }
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

            // labels - question :: move to labels util?
            for (let i=0; i < stars.length; i++){
                const s: Star = stars[i];
                const text: string = `${s.icon ? s.icon+" " : ""}${s.name ?? ""}`.trim();

                let disabled = false;
                if (props.found.testamentFound && s.testament != props.target.testament) {
                    disabled = true;
                } else if (props.found.divisionFound && s.division != props.target.division) {
                    disabled = true;
                } else if (props.found.bookFound && s.book != props.target.book) {
                    disabled = true;
                }
                if (!text || disabled) continue;

                const spr = makeLabel(text, { fontPx: 28, maxWidthPx: 320, paddingPx: 10 });
                const p = sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1.01);
                spr.position.copy(p);
                const lum=((starfieldRef.current!.geometry as THREE.BufferGeometry).getAttribute('aLum') as THREE.BufferAttribute).getX(i) ?? 0.5;
                (spr as any).userData.lum=lum;
                (spr as any).userData.scale = 0.9 + 0.45*lum;
                labels.add(spr);
            }
            fitSpriteGroupToPixels(labels, camera, renderer);
            animate(); })();

        return ()=>{ running=false; cancelAnimationFrame(raf); renderer.domElement.removeEventListener('wheel', onWheel as any); renderer.domElement.removeEventListener('dblclick', onDbl as any); window.removeEventListener('resize', onResize as any); renderer.domElement.removeEventListener('pointerdown', onPointerDown as any); renderer.domElement.removeEventListener('click', onClick as any); renderer.domElement.removeEventListener('pointermove', onPointerMove as any); controlsRef.current?.dispose?.(); scene.traverse((o:any)=>{ o.geometry?.dispose?.(); if(o.material){ Array.isArray(o.material) ? o.material.forEach((m:any)=>m.dispose?.()) : o.material.dispose?.(); } }); renderer.dispose(); container.removeChild(renderer.domElement); };
    }, [data, props.found]);

    // useEffect(() => {
    //
    // }, [props.found])

    return <div ref={containerRef} className="absolute h-[100vh] w-full top-0" />;
}
