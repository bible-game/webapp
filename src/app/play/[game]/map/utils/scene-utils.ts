import * as THREE from "three";

export function initLandscape() {
    const r = 995;
    const groundGroup = new THREE.Group();

    // inside-facing lower hemisphere that WRITES depth (hides below-horizon stars)
    const hemi = new THREE.SphereGeometry(r, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI);
    hemi.scale(-1, 1, 1);

    // vertex color gradient (darker down, brighter near horizon)
    const count = hemi.attributes['position'].count;
    const colors = new Float32Array(count * 3);
    const yArr = hemi.attributes['position'] as THREE.BufferAttribute;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
        const y = yArr.getY(i); // [-r,0]
        const t = THREE.MathUtils.clamp(1 - Math.abs(y) / r, 0, 1);
        c.setRGB(
            THREE.MathUtils.lerp(0x06/255, 0x15/255, t),
            THREE.MathUtils.lerp(0x10/255, 0x23/255, t),
            THREE.MathUtils.lerp(0x17/255, 0x35/255, t)
        );
        colors.set([c.r, c.g, c.b], i * 3);
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
