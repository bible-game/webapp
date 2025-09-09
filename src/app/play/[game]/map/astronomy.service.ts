
import * as THREE from 'three';

// ===== Label fading declutter =====
type FadeDeclutterOpts = {
  /** Max labels allowed on screen */
  maxLabels?: number;
  /** NDC radius from center (0..1); smaller = stricter */
  radius?: number;
  /** How often (ms) to recompute "target alphas" with sorting */
  throttleMs?: number;
  /** Fade-in / fade-out time constants (ms) */
  fadeInMs?: number;
  fadeOutMs?: number;
};

export type BibleStar = {
  name: string;          // "Genesis 1"
  ra_h: number;          // 0..24
  dec_d: number;         // -90..+90 (your JSON keeps these >0)
  book?: string;         // short code like "GEN"
  chapter?: number;      // 1..n
  testament?: string;    // "Old" | "New"
  division?: string;     // e.g. "The Law"
  division_color?: string; // "#rrggbb"
  verses?: number;
  icon?: string;
};

export class AstronomyService {
  private readonly DATA_URL = '/stars.json';

  private starsData?: BibleStar[];
  private starsDataPromise?: Promise<BibleStar[]>;
  // Keep a single manager (or extend to support multiple groups if you like)
  private _labelMgr?: _LabelSizeManager;

  // --- PUBLIC API -----------------------------------------------------------

  async loadStarsData(): Promise<BibleStar[]> {
    if (this.starsData) return this.starsData;
    if (!this.starsDataPromise) {
      this.starsDataPromise = fetch(this.DATA_URL)
        .then(res => res.json())
        .then(d => {
          this.starsData = d;
          return d;
        });
    }
    return this.starsDataPromise;
  }

  /** Stars as additive glowy points (shader) */
  createStars(radius = 1000): THREE.Points {
    const geo = new THREE.BufferGeometry();
    // empty; we’ll fill after JSON loads
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(0), 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(new Float32Array(0), 1));
    geo.setAttribute('aLum',     new THREE.BufferAttribute(new Float32Array(0), 1));

    const mat = this.makeStarShader();
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;

    this.loadStarsData().then(data => {
      const n = data.length;
      const pos  = new Float32Array(n * 3);
      const col  = new Float32Array(n * 3);
      const size = new Float32Array(n);
      const lum  = new Float32Array(n);

      // normalize verses for brightness/size
      let vMin = Infinity, vMax = -Infinity;
      for (const s of data) {
        if (typeof s.verses === 'number') {
          vMin = Math.min(vMin, s.verses);
          vMax = Math.max(vMax, s.verses);
        }
      }
      if (!isFinite(vMin) || !isFinite(vMax) || vMin === vMax) { vMin = 10; vMax = 50; }

      const v = new THREE.Vector3();
      for (let i = 0; i < n; i++) {
        const s = data[i];
        v.copy(this.raDecToVec(s.ra_h, s.dec_d, radius));
        pos.set([v.x, v.y, v.z], i * 3);

        const c = this.hexToRgb01(s.division_color || '#9fbfff');
        col.set(c, i * 3);

        const t = Math.sqrt((Math.max(vMin, Math.min(vMax, s.verses ?? vMin)) - vMin) / (vMax - vMin + 1e-6));
        size[i] = 2.0 + t * 7.0; // 2..9 px
        lum[i]  = t;             // 0..1
      }

      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color',    new THREE.BufferAttribute(col, 3));
      g.setAttribute('aSize',    new THREE.BufferAttribute(size, 1));
      g.setAttribute('aLum',     new THREE.BufferAttribute(lum, 1));
      g.computeBoundingSphere?.();

      points.geometry.dispose();
      points.geometry = g;
    });

    return points;
  }

  /** Constellations per book using MST + a few nearest-neighbor edges, with horizon fading. */
  createBookConstellations(
    radius = 1000,
    opts: { extraNearestPerNode?: number; opacity?: number; fadeLow?: number; fadeHigh?: number } = {}
  ): THREE.Group {
    const { extraNearestPerNode = 1, opacity = 0.5, fadeLow = -80, fadeHigh = 120 } = opts;
    const group = new THREE.Group();

    this.loadStarsData().then(data => {
      const byBook = this.groupBy(data, s => s.book || s.name.split(' ')[0]);

      for (const [bookKey, raw] of byBook) {
        const chapters = raw.slice().sort((a,b) => (a.chapter ?? 0) - (b.chapter ?? 0));
        if (chapters.length < 2) continue;

        // 3D points on sphere (slightly inside radius)
        const P3 = chapters.map(s => this.raDecToVec(s.ra_h, s.dec_d, radius - 1).normalize());

        // Local tangent-plane basis -> 2D coords
        const { u, v, n } = this.computeLocalBasis(P3);
        const P2 = P3.map(p => {
          const pn = p.clone().sub(n.clone().multiplyScalar(p.dot(n))).normalize();
          return new THREE.Vector2(pn.dot(u), pn.dot(v));
        });

        // Graph edges
        const mst = this.mstEdges(P2);
        const existing = new Set(mst.map(([i,j]) => (i<j?`${i}-${j}`:`${j}-${i}`)));
        const extras = this.nearestNeighborEdges(P2, extraNearestPerNode, existing);
        const edges = mst.concat(extras);

        // Build line segments
        const linePos = new Float32Array(edges.length * 2 * 3);
        let k = 0;
        for (const [i, j] of edges) {
          const a = P3[i].clone().multiplyScalar(radius - 1);
          const b = P3[j].clone().multiplyScalar(radius - 1);
          linePos[k++] = a.x; linePos[k++] = a.y; linePos[k++] = a.z;
          linePos[k++] = b.x; linePos[k++] = b.y; linePos[k++] = b.z;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));

        // Division color for this book
        const colorHex = this.pickDivisionColor(chapters) ?? 0x6ea8ff;

        // Horizon-fading material
        const mat = this.createLineMaterialWithHorizonFade(colorHex, opacity, fadeLow, fadeHigh);

        const lines = new THREE.LineSegments(geo, mat);
        lines.frustumCulled = false;
        lines.renderOrder = 0;
        group.add(lines);
      }
    });

    return group;
  }

  /** Optional: label every star (book + chapter) */
  createStarLabels(radius = 1000, opts: { fontSize?: number; pad?: number; useIcon?: boolean } = {}): THREE.Group {
    const { fontSize = 22, pad = 6, useIcon = true } = opts;
    const group = new THREE.Group();
    group.renderOrder = 2;

    this.loadStarsData().then(data => {
      for (const s of data) {
        const text = `${useIcon && s.icon ? s.icon + ' ' : ''}${s.name}`;
        const spr = this.makeSprite(text, fontSize, pad);
        const p = this.raDecToVec(s.ra_h, s.dec_d, radius - 2);
        spr.position.copy(p);
        // world scale ~2 units per pixel at radius ~1000
        const w = spr.material.map!.image.width;
        const h = spr.material.map!.image.height;
        const worldPerPx = 2.0;
        spr.scale.set(w * worldPerPx, h * worldPerPx, 1);
        group.add(spr);
      }
    });

    return group;
  }

  // --- SHADERS / HELPERS ----------------------------------------------------

  private makeStarShader(): THREE.ShaderMaterial {
    const uniforms = {
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1 },
    };

    const vert = `
      attribute float aSize;
      attribute float aLum;
      varying vec3 vColor;
      varying float vLum;
      void main() {
        vColor = color;
        vLum = aLum;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio;
      }
    `;

    const frag = `
      precision mediump float;
      varying vec3 vColor;
      varying float vLum;
      void main() {
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r = length(uv);
        if (r > 1.0) discard;

        float core = 1.0 - smoothstep(0.0, 1.0, r);
        float halo = smoothstep(0.4, 1.0, r);

        vec3 col = mix(vec3(1.0), vColor, core);
        float bright = 0.65 + 0.6 * clamp(vLum, 0.0, 1.0);
        float a = max(core, halo * 0.6) * bright;

        gl_FragColor = vec4(col * bright, a);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });
  }

  private groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
    const m = new Map<K, T[]>();
    for (const it of arr) {
      const k = key(it);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    }
    return m;
  }

  raDecToVec(ra_h: number, dec_d: number, r = 1000): THREE.Vector3 {
    const ra = ra_h * (Math.PI * 2 / 24);
    const dec = THREE.MathUtils.degToRad(dec_d);
    return new THREE.Vector3(
      r * Math.cos(dec) * Math.cos(ra),
      r * Math.sin(dec),
      r * Math.cos(dec) * Math.sin(ra),
    );
    // y is "altitude" at latitude=0; your skyGroup tilt handles latitude
  }

  private hexToRgb01(hex: string): [number, number, number] {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    if (!m) return [0.75, 0.85, 1.0];
    return [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255];
  }

  private makeSprite(text: string, fs = 22, pad = 6): THREE.Sprite {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d')!;
    ctx.font = `${fs}px system-ui, -apple-system, Segoe UI, Inter, Roboto`;
    const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
    const h = fs + pad * 2;
    c.width = w; c.height = h;

    ctx.font = `${fs}px system-ui, -apple-system, Segoe UI, Inter, Roboto`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#e5e7eb'; ctx.fillText(text, pad, h/2);

    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, depthWrite: false });
    return new THREE.Sprite(mat);
  }

  private _fadeState = new WeakMap<THREE.Sprite, { alpha: number; target: number }>();
  private _fadeLastCompute = 0;
  private _fadeLastFrame = 0;
  private _vecWorld = new THREE.Vector3();
  private _vecNdc = new THREE.Vector3();

  /**
   * Fade labels toward visibility based on center proximity & horizon test.
   * Call this every frame from your render loop.
   */
  updateLabelFading(group: THREE.Group, camera: THREE.Camera, opts: FadeDeclutterOpts = {}) {
    const now = performance.now();

    const radius = opts.radius ?? 0.65;        // 0.55 tighter, 0.75 looser
    const maxLabels = opts.maxLabels ?? 80;    // cap
    const throttleMs = opts.throttleMs ?? 120; // compute targets ~8 Hz
    const fadeInMs = Math.max(1, opts.fadeInMs ?? 180);
    const fadeOutMs = Math.max(1, opts.fadeOutMs ?? 220);

    // 1) Occasionally recompute "target alphas" (expensive sorting)
    if (now - this._fadeLastCompute >= throttleMs) {
      this._fadeLastCompute = now;

      const candidates: { spr: THREE.Sprite; dist: number }[] = [];

      for (const child of group.children) {
        const spr = child as THREE.Sprite;
        if (!spr) continue;

        // Ensure sprite material supports opacity (once)
        const mat = spr.material as THREE.SpriteMaterial;
        mat.transparent = true;
        mat.depthTest = true;
        mat.depthWrite = false;

        // World space position (respects skyGroup rotation)
        spr.getWorldPosition(this._vecWorld);

        // Horizon cull — labels below y<=0 fade out
        if (this._vecWorld.y <= 0.0) {
          this._ensureFadeState_(spr).target = 0.0;
          continue;
        }

        // Project to NDC
        this._vecNdc.copy(this._vecWorld).project(camera);
        if (this._vecNdc.z < -1.0 || this._vecNdc.z > 1.0) {
          this._ensureFadeState_(spr).target = 0.0;
          continue;
        }

        const dist = Math.hypot(this._vecNdc.x, this._vecNdc.y);
        if (dist <= radius) candidates.push({ spr, dist });
        else this._ensureFadeState_(spr).target = 0.0;
      }

      // Keep the closest K labels by center distance
      candidates.sort((a, b) => a.dist - b.dist);
      const K = Math.min(maxLabels, candidates.length);

      for (let i = 0; i < candidates.length; i++) {
        const { spr, dist } = candidates[i];
        const st = this._ensureFadeState_(spr);
        if (i < K) {
          // Smooth ramp: 1 at center → 0 at radius
          const t = dist / Math.max(1e-6, radius);
          const w = 1.0 - smoothstep(0.3, 1.0, t); // softer near center
          st.target = Math.max(0.0, Math.min(1.0, w));
        } else {
          st.target = 0.0;
        }
      }

      function smoothstep(edge0: number, edge1: number, x: number) {
        const t = Math.min(1, Math.max(0, (x - edge0) / Math.max(1e-6, edge1 - edge0)));
        return t * t * (3 - 2 * t);
      }
    }

    // 2) Every frame: ease alpha → target
    const dt = Math.max(0, this._fadeLastFrame ? (now - this._fadeLastFrame) : 16);
    this._fadeLastFrame = now;

    for (const child of group.children) {
      const spr = child as THREE.Sprite;
      const st = this._fadeState.get(spr);
      const mat = spr.material as THREE.SpriteMaterial;
      if (!st || !mat) continue;

      const target = st.target;
      const tau = (target > st.alpha) ? fadeInMs : fadeOutMs; // different speeds
      // Exponential smoothing toward target
      const k = 1.0 - Math.exp(-dt / tau);
      st.alpha += (target - st.alpha) * k;

      // Apply opacity; toggle visibility only when essentially gone
      mat.opacity = st.alpha;
      spr.visible = st.alpha > 0.02;
    }
  }

  private _ensureFadeState_(spr: THREE.Sprite) {
    let st = this._fadeState.get(spr);
    if (!st) {
      st = { alpha: 0.0, target: 0.0 };
      this._fadeState.set(spr, st);
      // start hidden
      const mat = spr.material as THREE.SpriteMaterial;
      if (mat) { mat.transparent = true; mat.opacity = 0.0; }
      spr.visible = false;
    }
    return st;
  }

  public updateLabelAutoSizingGroup(group?: THREE.Group) {
    this._labelMgr?.setGroup(group);
  }

  /** Pick a consistent color for a book/chapters' division. */
  private pickDivisionColor(list: Array<{ division?: string; division_color?: string }>): number {
    // 1) Prefer explicit hex from data (first non-empty)
    for (const s of list) {
      if (s.division_color) {
        const [r,g,b] = this.hexToRgb01(s.division_color);
        return new THREE.Color(r, g, b).getHex();
      }
    }
    // 2) Else hash the division name into a pleasant pastel
    const divName = (list[0]?.division || 'Division').toLowerCase();
    let h = 2166136261 >>> 0; // FNV-1a
    for (let i = 0; i < divName.length; i++) {
      h ^= divName.charCodeAt(i); h = Math.imul(h, 16777619);
    }
    // map hash → HSL then to RGB
    const hue = (h % 360) / 360;           // 0..1
    const sat = 0.45;                      // pastel-ish
    const lit = 0.70;
    const c = new THREE.Color().setHSL(hue, sat, lit);
    return c.getHex();
  }

  /** Create a line material that fades near/below the horizon (y≈0 in world). */
  private createLineMaterialWithHorizonFade(colorHex: number, opacity = 0.5, fadeLow = -80, fadeHigh = 120) {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthTest: true,     // still occluded by ground hemisphere
      depthWrite: false,
      blending: THREE.NormalBlending, // or THREE.AdditiveBlending if you prefer a glow
      uniforms: {
        uColor:    { value: new THREE.Color(colorHex) },
        uOpacity:  { value: opacity },
        uFadeLow:  { value: fadeLow },  // y where alpha≈0
        uFadeHigh: { value: fadeHigh }, // y where alpha≈1
      },
      vertexShader: `
      varying float vY;
      void main() {
        // world-space Y (height above horizon)
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vY = worldPos.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      precision mediump float;
      varying float vY;
      uniform vec3  uColor;
      uniform float uOpacity;
      uniform float uFadeLow;
      uniform float uFadeHigh;

      float smooth01(float x, float a, float b) {
        float t = clamp((x - a) / max(1e-5, b - a), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t); // smoothstep
      }

      void main() {
        float t = smooth01(vY, uFadeLow, uFadeHigh);
        float alpha = uOpacity * t;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
    });
  }

  private computeLocalBasis(points: THREE.Vector3[]) {
    const n = new THREE.Vector3();
    for (const p of points) n.add(p);
    if (n.lengthSq() < 1e-9) n.set(0, 1, 0);
    n.normalize();
    const ref = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0,1,0) : new THREE.Vector3(1,0,0);
    const u = new THREE.Vector3().crossVectors(ref, n).normalize();
    const v = new THREE.Vector3().crossVectors(n, u).normalize();
    return { u, v, n };
  }

  private mstEdges(points: THREE.Vector2[]): Array<[number, number]> {
    const n = points.length;
    if (n <= 1) return [];
    const inTree = new Array(n).fill(false);
    const minD   = new Array(n).fill(Infinity);
    const parent = new Array(n).fill(-1);
    inTree[0] = true;
    for (let j = 1; j < n; j++) { minD[j] = points[0].distanceTo(points[j]); parent[j] = 0; }
    const edges: Array<[number, number]> = [];
    for (let k = 0; k < n - 1; k++) {
      let v = -1, best = Infinity;
      for (let j = 0; j < n; j++) if (!inTree[j] && minD[j] < best) { best = minD[j]; v = j; }
      if (v === -1) break;
      inTree[v] = true;
      const p = parent[v]; edges.push(p < v ? [p, v] : [v, p]);
      for (let w = 0; w < n; w++) if (!inTree[w]) {
        const d = points[v].distanceTo(points[w]);
        if (d < minD[w]) { minD[w] = d; parent[w] = v; }
      }
    }
    return edges;
  }

  private nearestNeighborEdges(
    points: THREE.Vector2[], kPerNode: number, existing: Set<string>
  ): Array<[number, number]> {
    if (kPerNode <= 0) return [];
    const n = points.length, extras: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      const order = Array.from({ length: n }, (_, j) => j)
        .filter(j => j !== i)
        .sort((a,b) => points[i].distanceTo(points[a]) - points[i].distanceTo(points[b]));
      let added = 0;
      for (const j of order) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (existing.has(key)) continue;
        existing.add(key);
        extras.push(i < j ? [i, j] : [j, i]);
        if (++added >= kPerNode) break;
      }
    }
    return extras;
  }

  // --- Keep track of the live Points instance / stars array ---
  private _pointsRef?: THREE.Points;
  get pointsRef() { return this._pointsRef; }

// Call this inside createStars() after you construct Points:
  private _rememberPoints(p: THREE.Points) { this._pointsRef = p; }

// Expose a safe copy of current star data (after load)
  public async getStarsSnapshot(): Promise<BibleStar[]> {
    const data = await this.loadStarsData();
    return data.map(s => ({ ...s })); // copy
  }

// Convert 3D -> RA/Dec
  public vecToRaDec(v: THREE.Vector3): { ra_h: number; dec_d: number } {
    const r = v.length() || 1;
    const x = v.x / r, y = v.y / r, z = v.z / r;
    const dec = Math.asin(y); // radians
    let ra = Math.atan2(z, x); // [-π, π]
    if (ra < 0) ra += Math.PI * 2;
    return {
      ra_h: (ra / (Math.PI * 2)) * 24.0,
      dec_d: THREE.MathUtils.radToDeg(dec)
    };
  }

// Intersect a camera ray with the celestial sphere at radius R
  public intersectRayWithSphere(ray: THREE.Ray, R = 1000): THREE.Vector3 | null {
    const o = ray.origin, d = ray.direction.clone().normalize();
    // Solve |o + t d| = R
    const b = o.dot(d);
    const c = o.lengthSq() - R * R;
    const disc = b*b - c;
    if (disc < 0) return null;
    // two solutions: t = -b ± sqrt(disc). Take the smallest positive
    const t1 = -b - Math.sqrt(disc);
    const t2 = -b + Math.sqrt(disc);
    const t = t1 > 0 ? t1 : (t2 > 0 ? t2 : -1);
    if (t <= 0) return null;
    return o.clone().add(d.multiplyScalar(t));
  }

// Find nearest star to a given direction on the sphere (within max angular distance)
  public async findNearestStarIndex(dirWorld: THREE.Vector3, maxDeg = 1.2, radius = 1000): Promise<number> {
    const data = await this.loadStarsData();
    const geo = this._pointsRef?.geometry as THREE.BufferGeometry | undefined;
    const pos = geo?.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!data.length || !pos) return -1;

    const uDir = dirWorld.clone().normalize();
    let bestI = -1, bestAng = Infinity;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
      const v = new THREE.Vector3(vx, vy, vz).normalize();
      const cos = THREE.MathUtils.clamp(uDir.dot(v), -1, 1);
      const ang = THREE.MathUtils.radToDeg(Math.acos(cos));
      if (ang < bestAng) { bestAng = ang; bestI = i; }
    }
    return bestAng <= maxDeg ? bestI : -1;
  }

// Update one star’s RA/Dec + geometry + (optional) label sprite position
  public async updateStarByIndex(i: number, ra_h: number, dec_d: number, radius = 1000, labelSprite?: THREE.Sprite) {
    const data = await this.loadStarsData();
    if (i < 0 || i >= data.length || !this._pointsRef) return;

    // clamp to keep above horizon (optional)
    dec_d = Math.max(2, Math.min(88, dec_d));

    // update data
    data[i].ra_h = ra_h;
    data[i].dec_d = dec_d;

    // move vertex
    const v = this.raDecToVec(ra_h, dec_d, radius);
    const geo = this._pointsRef.geometry as THREE.BufferGeometry;
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    pos.setXYZ(i, v.x, v.y, v.z);
    pos.needsUpdate = true;
    geo.computeBoundingSphere?.();

    // move label too
    if (labelSprite) {
      labelSprite.position.copy(this.raDecToVec(ra_h, dec_d, radius - 2));
    }
  }

// Export current catalog as JSON string (preserves all fields)
  public async exportStarsJson(pretty = true): Promise<string> {
    const data = await this.loadStarsData();
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /** Convert desired on-screen CSS pixels to world units at a given world position. */
  private worldUnitsPerCssPixel(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, worldPos: THREE.Vector3) {
    // distance from camera to label
    const dist = camera.position.distanceTo(worldPos);
    // visible world height at that distance
    const worldHeight = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    // css pixels of the canvas’ height
    const pixels = renderer.domElement.clientHeight;
    return worldHeight / pixels; // world units per CSS pixel
  }

  /** Resize one sprite so its on-screen size equals its canvas CSS size (pixel-perfect). */
  public fitSpriteToPixels(spr: THREE.Sprite, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    const u = (spr as any).userData;
    if (!u) return;
    const cssW = u.cssW as number;
    const cssH = u.cssH as number;

    const worldPos = new THREE.Vector3();
    spr.getWorldPosition(worldPos);

    const wuPerPx = this.worldUnitsPerCssPixel(camera, renderer, worldPos);
    spr.scale.set(cssW * wuPerPx, cssH * wuPerPx, 1);
  }

  /** Resize all Sprite children in a group so 1 canvas pixel = 1 screen pixel. */
  public fitSpriteGroupToPixels(
    group: THREE.Group,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
  ) {
    for (const child of group.children) {
      const spr = child as THREE.Sprite;
      if ((spr as any).isSprite) this.fitSpriteToPixels(spr, camera, renderer);
    }
  }

  public startLabelAutoSizing(
    group: THREE.Group | undefined,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    controls?: any,
    opts: Partial<LabelAutoSizeOptions> = {}
  ) {
    if (!group) {
      console.warn('[labels] startLabelAutoSizing called without a group; ignoring until group is set.');
      return;
    }
    this._labelMgr?.stop();
    this._labelMgr = new _LabelSizeManager(this, group, camera, renderer, controls, opts);
    this._labelMgr.start();
  }

  /** Stop auto-sizing/fading. */
  public stopLabelAutoSizing() {
    this._labelMgr?.stop();
    this._labelMgr = undefined;
  }

  /** Ask the manager to run a refresh on the next frame (e.g., after changing FOV). */
  public scheduleLabelRefresh() {
    this._labelMgr?.schedule();
  }

  /** Update options on the fly (e.g., from a HUD). */
  public setLabelAutoSizeOptions(opts: Partial<LabelAutoSizeOptions>) {
    this._labelMgr?.setOptions(opts);
    this._labelMgr?.schedule();
  }


}

// Keep this file-local (not exported)
type LabelAutoSizeOptions = {
  // size behavior
  basePx?: number;       // nominal label height at FOV=90 (default 22)
  minPx?: number;        // clamp (default 16)
  maxPx?: number;        // clamp (default 28)
  strength?: number;     // FOV adaptation 0..1 (default 0.25)
  retargetLowRatio?: number;   // rebuild texture if targetPx/cssH < this (default 0.75)
  retargetHighRatio?: number;  // rebuild texture if targetPx/cssH > this (default 1.33)
  // declutter behavior
  baseMaxLabels?: number;  // max labels at FOV=90 on ~720p (default 80)
  minLabels?: number;      // clamp (default 30)
  maxLabels?: number;      // clamp (default 160)
  fovExponent?: number;    // FOV influence on label count (default 0.8)
  baseRadius?: number;     // declutter radius in NDC (default 0.62)
  radiusSpread?: number;   // how radius grows toward wide FOV (default 0.08)
  fadeInMs?: number;       // default 160
  fadeOutMs?: number;      // default 240
  fadeThrottleMs?: number; // default 100
};

class _LabelSizeManager {
  private running = false;
  private raf = 0;
  private onControlsChange = () => this.schedule();
  private onResize = () => this.schedule();

  constructor(
    private svc: any,                          // AstronomyService
    private group: THREE.Group,
    private camera: THREE.PerspectiveCamera,
    private renderer: THREE.WebGLRenderer,
    private controls?: any,
    private opts: LabelAutoSizeOptions = {}
  ) {}

  start() {
    if (this.running) return;
    this.running = true;
    window.addEventListener('resize', this.onResize, { passive: true });
    this.controls?.addEventListener?.('change', this.onControlsChange);
    this.refreshNow(); // initial pass
  }
  stop() {
    if (!this.running) return;
    this.running = false;
    window.removeEventListener('resize', this.onResize as any);
    this.controls?.removeEventListener?.('change', this.onControlsChange as any);
    if (this.raf) cancelAnimationFrame(this.raf), (this.raf = 0);
  }
  setOptions(opts: Partial<LabelAutoSizeOptions>) {
    this.opts = { ...this.opts, ...opts };
    this.schedule();
  }
  schedule() {
    if (!this.running || this.raf) return;
    this.raf = requestAnimationFrame(() => { this.raf = 0; this.refreshNow(); });
  }

  setGroup(group?: THREE.Group) {
    this.group = group as any;
    this.schedule();
  }

  // inside AstronomyService
  refreshNow() {
    // ----- guards: bail early if anything we need is missing -----
    const group = this.group as THREE.Group | undefined;
    const camera = this.camera as THREE.PerspectiveCamera | undefined;
    const renderer = this.renderer as THREE.WebGLRenderer | undefined;
    if (!group || !camera || !renderer || !(group as any).isObject3D) return;

    // ----- A) Adaptive pixel-perfect sizing -----
    const basePx = this.opts.basePx ?? 22;
    const minPx  = this.opts.minPx  ?? 16;
    const maxPx  = this.opts.maxPx  ?? 28;
    const k      = this.opts.strength ?? 0.25;
    const loR    = this.opts.retargetLowRatio  ?? 0.75;
    const hiR    = this.opts.retargetHighRatio ?? 1.33;

    const targetPx = THREE.MathUtils.clamp(
      basePx * Math.pow(90 / camera.fov, k),
      minPx, maxPx
    );

    const worldPos = new THREE.Vector3();
    const children = (group.children ?? []) as THREE.Object3D[];
    for (const child of children) {
      const spr = child as THREE.Sprite;
      const ud = (spr as any)?.userData;
      if (!(spr as any)?.isSprite || !ud?.cssW || !ud?.cssH) continue;

      const ratio = targetPx / ud.cssH;
      if (ratio < loR || ratio > hiR) {
        const newFont = Math.round(targetPx);
        this.svc.retargetSpriteTexture(spr, newFont);
      }

      spr.getWorldPosition(worldPos);
      const wuPerPx = this.svc['worldUnitsPerCssPixel'](camera, renderer, worldPos);
      const factor = targetPx / ud.cssH;
      spr.scale.set(ud.cssW * wuPerPx * factor, ud.cssH * wuPerPx * factor, 1);
    }

    // ----- B) Dynamic declutter/fading -----
    const baseMax = this.opts.baseMaxLabels ?? 80;
    const minLab  = this.opts.minLabels ?? 30;
    const maxLab  = this.opts.maxLabels ?? 160;
    const exp     = this.opts.fovExponent ?? 0.8;

    const fovFactor = Math.pow(90 / camera.fov, exp);
    const canvas = renderer.domElement;
    if (!canvas) return;

    const areaFactor = Math.sqrt(
      (canvas.clientWidth * canvas.clientHeight) / (1280 * 720)
    );

    const dynamicMax = THREE.MathUtils.clamp(
      Math.round(baseMax * fovFactor * areaFactor),
      minLab, maxLab
    );

    const baseR   = this.opts.baseRadius ?? 0.62;
    const spread  = this.opts.radiusSpread ?? 0.08;
    const fovT    = (camera.fov - 90) / (175 - 1);
    const dynRadius = THREE.MathUtils.clamp(baseR + spread * fovT, 0.48, 0.78);

    this.svc.updateLabelFading(group, camera, {
      maxLabels: dynamicMax,
      radius: dynRadius,
      throttleMs: this.opts.fadeThrottleMs ?? 100,
      fadeInMs: this.opts.fadeInMs ?? 160,
      fadeOutMs: this.opts.fadeOutMs ?? 240
    });
  }

}
