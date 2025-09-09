
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AstronomyService } from './astronomy.service';
import Hud from './hud';

/**
 * ThreeJS Component for displaying the Bible
 * @since 9th September 2025
 */
const Skymap = (props: any) => {
  const rendererContainer = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(12);
  const [latitude, setLatitude] = useState(34);
  const [fov, setFov] = useState(90);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [constellationsVisible, setConstellationsVisible] = useState(true);

  //@ts-ignore
  const sceneRef = useRef<THREE.Scene>();
  //@ts-ignore
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  //@ts-ignore
  const skyGroupRef = useRef<THREE.Group>();
  //@ts-ignore
  const labelsRef = useRef<THREE.Group>();
  //@ts-ignore
  const constellationsRef = useRef<THREE.Group>();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const astronomyService = new AstronomyService();

    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let groundGroup: THREE.Group;
    let stars: THREE.Points;
    let rafId: number;

    const initThree = () => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 5000);
      camera.position.set(0, 0, 0.01);
      camera.up.set(0, 1, 0);
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 1);
      rendererContainer.current?.appendChild(renderer.domElement);
      (renderer.domElement.style as any).touchAction = 'none';

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.enableRotate = true;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.screenSpacePanning = false;

      const EPS = THREE.MathUtils.degToRad(0.5);
      controls.minPolarAngle = EPS;
      controls.maxPolarAngle = Math.PI / 2 - EPS;
      controls.update();

      const skyGroup = new THREE.Group();
      skyGroupRef.current = skyGroup;
      groundGroup = new THREE.Group();
      scene.add(groundGroup);
      scene.add(skyGroup);
    };

    const initLandscape = () => {
      const r = 995;

      const hemi = new THREE.SphereGeometry(r, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI);
      hemi.scale(-1, 1, 1);

      const count = hemi.attributes['position'].count;
      const colors = new Float32Array(count * 3);
      const yArr = hemi.attributes['position'] as THREE.BufferAttribute;
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const y = yArr.getY(i);
        const t = THREE.MathUtils.clamp(1 - Math.abs(y) / r, 0, 1);
        c.setRGB(
          THREE.MathUtils.lerp(0x06 / 255, 0x15 / 255, t),
          THREE.MathUtils.lerp(0x10 / 255, 0x23 / 255, t),
          THREE.MathUtils.lerp(0x17 / 255, 0x35 / 255, t)
        );
        colors.set([c.r, c.g, c.b], i * 3);
      }
      hemi.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const groundMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.FrontSide,
        depthWrite: true,
        depthTest: true
      });
      groundGroup.add(new THREE.Mesh(hemi, groundMat));

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
    };

    const addSky = () => {
      stars = astronomyService.createStars(1000);
      (stars.material as THREE.Material).depthWrite = false;
      (stars.material as THREE.Material).transparent = true;
      skyGroupRef.current?.add(stars);

      const constellations = astronomyService.createBookConstellations(1000, {
        extraNearestPerNode: 1,
        opacity: 0.55,
        fadeLow: -80,
        fadeHigh: 120
      });
      constellationsRef.current = constellations;
      skyGroupRef.current?.add(constellations);

      const labels = astronomyService.createStarLabels(1000, { fontSize: 22, pad: 6, useIcon: true });
      labels.visible = true;
      labelsRef.current = labels;
      skyGroupRef.current?.add(labels);
    };

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();

      if (labelsRef.current && cameraRef.current) {
        astronomyService.updateLabelFading(labelsRef.current, cameraRef.current, {
          maxLabels: 120,
          radius: 0.75,
          throttleMs: 240,
          fadeInMs: 100,
          fadeOutMs: 100
        });
      }

      if (sceneRef.current && cameraRef.current) {
        renderer.render(sceneRef.current, cameraRef.current);
      }
    };

    const onWindowResize = () => {
      if (cameraRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
      }
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    initThree();
    initLandscape();
    addSky();
    animate();

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(rafId);
      controls?.dispose();
      renderer?.dispose();
      if (rendererContainer.current && renderer) {
        rendererContainer.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (skyGroupRef.current) {
      skyGroupRef.current.rotation.y = (time / 24) * Math.PI * 2;
    }
  }, [time]);

  useEffect(() => {
    if (skyGroupRef.current) {
      skyGroupRef.current.rotation.x = THREE.MathUtils.degToRad(90 - latitude);
    }
  }, [latitude]);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [fov]);

  useEffect(() => {
    if (labelsRef.current) {
      labelsRef.current.visible = labelsVisible;
    }
  }, [labelsVisible]);

  useEffect(() => {
    if (constellationsRef.current) {
      constellationsRef.current.visible = constellationsVisible;
    }
  }, [constellationsVisible]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Hud
        time={time}
        onTimeChange={setTime}
        latitude={latitude}
        onLatitudeChange={setLatitude}
        fov={fov}
        onFovChange={setFov}
        toggleLabels={() => setLabelsVisible(!labelsVisible)}
        toggleConstellations={() => setConstellationsVisible(!constellationsVisible)}
      />
      <div ref={rendererContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Skymap;
