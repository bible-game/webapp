
import * as THREE from "three";
import {brighten} from "@/core/util/colour-util";

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
export const deg2rad = (d: number) => THREE.MathUtils.degToRad(d);
export const raHoursToRad = (h: number) => (h / 24) * TAU;
export function sphToVec3(raRad: number, decRad: number, r = 1) {
    const x = r * Math.cos(decRad) * Math.cos(raRad);
    const y = r * Math.sin(decRad);
    const z = r * Math.cos(decRad) * Math.sin(raRad);
    return new THREE.Vector3(x, y, z);
}

// ===== Starfield shader =====
function hexToRgb(hex: string) {
    const m: any  = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
    if (!m) return [0.62,0.75,1.0] as const;
    return [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] as const;
}

export function buildStarfield(stars: Star[], found: any, target: any) {
    const n = stars.length;
    const pos = new Float32Array(n*3);
    const col = new Float32Array(n*3);
    const size = new Float32Array(n);
    const lum = new Float32Array(n);
    const random = new Float32Array(n);
    let vMin: number = Infinity, vMax: number = -Infinity;

    for (const s of stars) {
        if (typeof s.verses === 'number') {
            vMin = Math.min(vMin,s.verses);
            vMax = Math.max(vMax,s.verses);
        }
    }

    if (!isFinite(vMin)||!isFinite(vMax)||vMin===vMax){
        vMin=10;
        vMax=50;
    }
    const v = new THREE.Vector3();

    for (let i: number = 0; i < n; i++) {
        const s: Star = stars[i];
        v.copy(sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1));
        pos.set([v.x,v.y,v.z], i*3);

        let disabled = false;
        if (found.testamentFound && s.testament != target.testament) {
            disabled = true;
        } else if (found.divisionFound && s.division != target.division) {
            disabled = true;
        } else if (found.bookFound && s.book != target.book) {
            disabled = true;
        }

        const hex: string = brighten(disabled ? "#000000" : s.division_color!, disabled ? 0 : 75);
        const [r,g,b] = hexToRgb(hex);
        col.set([r,g,b], i * 3);
        const t: number = Math.sqrt((Math.max(vMin, Math.min(vMax, s.verses ?? vMin))-vMin)/(vMax-vMin+1e-6));
        size[i]=t/5;
        lum[i]= t;
        random[i] = Math.random();
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos,3));
    geom.setAttribute('color', new THREE.BufferAttribute(col,3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(size,1));
    geom.setAttribute('aLum', new THREE.BufferAttribute(lum,1));
    geom.setAttribute('aRandom', new THREE.BufferAttribute(random,1));
    const mat = new THREE.ShaderMaterial({ transparent:true, depthWrite:false, vertexColors:true, uniforms:{ uPixelRatio:{value: (typeof window!=='undefined'? window.devicePixelRatio:1)}, uHighlightIndex:{value:-1}, uHighlightAmt:{value:0}, uHoverIndex:{value:-1}, uHoverAmt:{value:0}, uTime:{value:0}},
        vertexShader: /*glsl*/`
            attribute float aSize;
            attribute float aLum;
            attribute float aRandom;
            varying vec3 vColor;
            varying float vLum;
            varying float vIndex;
            varying float vRandom;
            uniform float uPixelRatio;
            void main(){
                vColor=color;
                vLum=aLum;
                vIndex=float(gl_VertexID);
                vRandom=aRandom;
                vec4 mv=modelViewMatrix*vec4(position,1.0);
                gl_PointSize=clamp(aSize*uPixelRatio*(200.0/ -mv.z), 5.0, 200.0);
                gl_Position=projectionMatrix*mv;
            }
        `,
        fragmentShader: /*glsl*/`
            precision mediump float;
            varying vec3 vColor;
            varying float vLum;
            varying float vIndex;
            varying float vRandom;
            uniform float uTime;
            uniform float uHighlightIndex;
            uniform float uHighlightAmt;
            uniform float uHoverIndex;
            uniform float uHoverAmt;

            float noise(float x){ return fract(sin(x)*43758.5453); }

            void main(){
                vec2 p=gl_PointCoord*2.0-1.0;
                float r=length(p);
                if(r>1.0) discard;

                // Twinkling
                float twinkle = 0.5 + 0.5 * sin(uTime * (1.0 + vRandom * 2.0) + vRandom * 6.28318);
                twinkle = mix(twinkle, 1.0, 0.8);

                // More realistic star shape
                float core = smoothstep(0.4, 0.0, r);
                float halo1 = smoothstep(0.6, 0.0, r);
                float halo2 = smoothstep(1.0, 0.0, r);

                // Rays
                float angle = atan(p.y, p.x);
                float rays = pow(abs(sin(angle * 2.0)), 20.0) * 0.1 * smoothstep(0.5, 0.0, r);

                float a = (core * 0.8 + halo1 * 0.3 + halo2 * 0.1 + rays) * twinkle;
                a *= mix(0.7, 1.2, vLum);

                vec3 col=vColor;
                if(abs(vIndex-uHoverIndex)<0.5){
                    float pulse=0.5+0.5*sin(uTime*6.28318);
                    float amt=clamp(uHoverAmt*(0.4+0.6*pulse),0.0,1.0);
                    col=mix(col,vec3(0.9,0.95,1.0),amt);
                    a=mix(a,1.0,amt*0.6);
                }
                if(abs(vIndex-uHighlightIndex)<0.5){
                    float pulse=0.5+0.5*sin(uTime*6.28318);
                    float amt=clamp(uHighlightAmt*(0.6+0.4*pulse),0.0,1.0);
                    col=mix(col,vec3(1.0,1.0,0.5),amt);
                    a=mix(a,1.0,amt);
                }
                gl_FragColor=vec4(col,a);
            }
        `
    });

    const points = new THREE.Points(geom, mat);
    points.frustumCulled=false;

    return points;
}

export function buildPickingPoints(stars: Star[]) { const n=stars.length; const pos=new Float32Array(n*3); for (let i=0;i<n;i++){ const s=stars[i]; const v=sphToVec3(raHoursToRad(s.ra_h), deg2rad(s.dec_d), 1); pos.set([v.x,v.y,v.z], i*3);} const geom=new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.BufferAttribute(pos,3)); const mat=new THREE.PointsMaterial({ size:8, sizeAttenuation:false, transparent:true, opacity:0.0, depthTest:false }); const pts=new THREE.Points(geom, mat); pts.renderOrder=-1; return pts; }
