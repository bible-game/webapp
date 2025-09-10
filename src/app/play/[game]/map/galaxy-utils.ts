
import * as THREE from 'three';

/**
 * Creates a distant starfield with a large number of small, faint stars.
 * @param radius The radius of the sphere in which stars are generated.
 * @param count The number of stars to generate.
 * @returns A THREE.Points object representing the starfield.
 */
export function createDistantStars(radius = 500, count = 10000) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const vertex = new THREE.Vector3(
            (Math.random() - 0.5) * 2 * radius,
            (Math.random() - 0.5) * 2 * radius,
            (Math.random() - 0.5) * 2 * radius
        );
        const distance = vertex.length();
        if (distance > radius || distance < radius * 0.8) {
            // ensure stars are in a spherical shell
            i--;
            continue;
        }
        positions[i * 3] = vertex.x;
        positions[i * 3 + 1] = vertex.y;
        positions[i * 3 + 2] = vertex.z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
    });

    const stars = new THREE.Points(geometry, material);
    stars.frustumCulled = false;
    return stars;
}

/**
 * Creates procedural nebula clouds using shaders.
 * @param radius The size of the nebula plane.
 * @returns A THREE.Mesh object representing the nebula.
 */
export function createNebula(radius = 600) {
    const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2() },
            uColor1: { value: new THREE.Color(0x432265) }, // A deep purple
            uColor2: { value: new THREE.Color(0x113265) }, // A dark blue
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec2 uResolution;
            uniform float uTime;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            varying vec2 vUv;

            // 2D Noise from https://www.shadertoy.com/view/4sfGDB
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 6; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec2 uv = vUv;
                float time = uTime * 0.1;
                float nebula = fbm(uv * 3.0 + time);
                nebula = smoothstep(0.4, 0.6, nebula);

                vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 1.0, fbm(uv * 2.0)));
                gl_FragColor = vec4(color * nebula, nebula * 0.5);
            }
        `,
        transparent: true,
        depthWrite: false,
    });

    const nebulaPlane = new THREE.PlaneGeometry(radius, radius);
    const nebula = new THREE.Mesh(nebulaPlane, nebulaMaterial);
    nebula.position.z = -radius / 2; // Place it behind the stars
    nebula.frustumCulled = false;
    return nebula;
}

/**
 * Creates a particle system for shooting stars.
 * @param count The number of shooting stars.
 * @param radius The radius of the sphere in which shooting stars are generated.
 * @returns A THREE.Points object representing the shooting stars.
 */
export function createShootingStars(count = 20, radius = 300) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        // Initialize off-screen
        positions[i * 3] = -radius * 10;
        positions[i * 3 + 1] = -radius * 10;
        positions[i * 3 + 2] = -radius * 10;
        velocities[i * 3] = 0;
        velocities[i * 3 + 1] = 0;
        velocities[i * 3 + 2] = 0;
        lifetimes[i] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
        size: 2,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: false,
    });

    const shootingStars = new THREE.Points(geometry, material);
    shootingStars.frustumCulled = false;
    return shootingStars;
}

/**
 * Animates the shooting stars.
 * @param shootingStars The shooting stars object.
 * @param dt The delta time since the last frame.
 * @param radius The radius of the sphere in which shooting stars are generated.
 */
export function updateShootingStars(shootingStars: THREE.Points, dt: number, radius = 300) {
    const positions = shootingStars.geometry.attributes.position as THREE.BufferAttribute;
    const velocities = shootingStars.geometry.attributes.velocity as THREE.BufferAttribute;
    const lifetimes = shootingStars.geometry.attributes.lifetime as THREE.BufferAttribute;

    for (let i = 0; i < positions.count; i++) {
        lifetimes.array[i] -= dt;

        if (lifetimes.array[i] <= 0) {
            // Respawn star
            const startPos = new THREE.Vector3(
                (Math.random() - 0.5) * radius,
                (Math.random() - 0.5) * radius,
                (Math.random() - 0.5) * radius
            );
            positions.setXYZ(i, startPos.x, startPos.y, startPos.z);

            const speed = Math.random() * 100 + 100;
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                (Math.random() - 0.5) * speed,
                (Math.random() - 0.5) * speed
            );
            velocities.setXYZ(i, velocity.x, velocity.y, velocity.z);
            lifetimes.array[i] = Math.random() * 2 + 1; // Lifetime of 1-3 seconds
        }

        // Update position
        const x = positions.getX(i) + velocities.getX(i) * dt;
        const y = positions.getY(i) + velocities.getY(i) * dt;
        const z = positions.getZ(i) + velocities.getZ(i) * dt;
        positions.setXYZ(i, x, y, z);
    }

    positions.needsUpdate = true;
}
