import * as THREE from "three";

export function initLandscape() {
    const r = 995;
    const groundGroup = new THREE.Group();

    // inside-facing lower hemisphere that WRITES depth (hides below-horizon stars)
    const hemi = new THREE.SphereGeometry(r, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI);
    hemi.scale(-1, 1, 1);

    // vertex color gradient (bottom: #040127 → horizon: #050730)
    const pos = hemi.attributes['position'] as THREE.BufferAttribute;
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    const cBottom = new THREE.Color("#040127");
    const cTop = new THREE.Color("#050730");
    for (let i = 0; i < count; i++) {
        // y is in [-r, 0] because this is the lower hemisphere
        const y = pos.getY(i);
        const t = THREE.MathUtils.clamp((y + r) / r, 0, 1); // 0 at bottom, 1 at horizon
        const col = cBottom.clone().lerp(cTop, t);
        const o = i * 3;
        colors[o + 0] = col.r;
        colors[o + 1] = col.g;
        colors[o + 2] = col.b;
    }
    hemi.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const groundMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.FrontSide,
        depthWrite: true,   // important: occlude stars under horizon
        depthTest: true
    });
    groundGroup.add(new THREE.Mesh(hemi, groundMat));

    // subtle horizon glow (thin ring in XZ plane at y=0)
    const inner = 980, outer = 1000;
    const ringGeo = new THREE.RingGeometry(inner, outer, 128);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
            uInner: { value: inner },
            uOuter: { value: outer },
            uColor: { value: new THREE.Color(0x7aa2ff) }
        },
        vertexShader: `
        varying vec2 vXY;
        void main() {
          vXY = position.xz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
        fragmentShader: `
        precision mediump float;
        varying vec2 vXY;
        uniform float uInner;
        uniform float uOuter;
        uniform vec3 uColor;
        void main(){
          float r = length(vXY);
          float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
          float a = (1.0 - t) * 0.35;
          gl_FragColor = vec4(uColor, a);
        }
      `
    });
    const glow = new THREE.Mesh(ringGeo, ringMat);
    glow.position.y = 0;
    groundGroup.add(glow);

    return groundGroup;
}
