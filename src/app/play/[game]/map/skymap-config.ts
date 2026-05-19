import type {
    ConstellationConfig,
    HorizonThemeConfig,
    SceneModel,
    SceneNode,
    StarArrangement,
} from "@project-skymap/library";
import bibleRaw from "../../../../../public/bible.json";
import horizonPresetData from "../../../../../public/horizons/biblical-presets.v1.json";

type BibleBook = {
    key: string;
    name: string;
    chapters: number;
    verses: number[];
};

type BibleDivision = {
    name: string;
    books: BibleBook[];
};

type BibleTestament = {
    name: string;
    divisions: BibleDivision[];
};

type BibleData = {
    testaments: BibleTestament[];
};

type CanonChapter = {
    testament: string;
    divisionName: string;
    bookKey: string;
    bookName: string;
    chapterNumber: number;
    verseCount: number;
    globalIndex: number;
};

type Vec3 = {
    x: number;
    y: number;
    z: number;
};

type Quaternion = {
    x: number;
    y: number;
    z: number;
    w: number;
};

type NormalizedHorizonProfile = {
    rotateDeg: number;
    points: Array<{ azDeg: number; altDeg: number }>;
    baseAltDeg: number;
};

const bible = bibleRaw as BibleData;

const CANON: CanonChapter[] = [];
const CHAPTER_BY_ID = new Map<string, CanonChapter>();
for (const testament of bible.testaments) {
    for (const division of testament.divisions) {
        for (const book of division.books) {
            for (let chapterIndex = 0; chapterIndex < book.chapters; chapterIndex++) {
                const chapter: CanonChapter = {
                    testament: testament.name,
                    divisionName: division.name,
                    bookKey: book.key,
                    bookName: book.name,
                    chapterNumber: chapterIndex + 1,
                    verseCount: book.verses[chapterIndex] ?? 1,
                    globalIndex: CANON.length,
                };
                CANON.push(chapter);
                CHAPTER_BY_ID.set(`C:${book.key}:${chapter.chapterNumber}`, chapter);
            }
        }
    }
}

export const HORIZON_THEMES = (horizonPresetData.themes ?? []) as HorizonThemeConfig[];
export const DEFAULT_HORIZON_THEME_ID = (horizonPresetData.defaultThemeId ?? "") as string;

export function getDefaultHorizonTheme(): HorizonThemeConfig | undefined {
    return HORIZON_THEMES.find((theme) => theme.id === DEFAULT_HORIZON_THEME_ID) ?? HORIZON_THEMES[0];
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function normalizeAzimuthDeg(value: number): number {
    let result = value % 360;
    if (result < 0) result += 360;
    return result;
}

function vecLength(vec: Vec3): number {
    return Math.hypot(vec.x, vec.y, vec.z);
}

function normalizeVec(vec: Vec3): Vec3 {
    const length = vecLength(vec);
    if (length <= 1e-9) return { x: 0, y: 1, z: 0 };
    return {
        x: vec.x / length,
        y: vec.y / length,
        z: vec.z / length,
    };
}

function dotVec(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function crossVec(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    };
}

function quatIdentity(): Quaternion {
    return { x: 0, y: 0, z: 0, w: 1 };
}

function quatNormalize(quat: Quaternion): Quaternion {
    const length = Math.hypot(quat.x, quat.y, quat.z, quat.w);
    if (length <= 1e-9) return quatIdentity();
    return {
        x: quat.x / length,
        y: quat.y / length,
        z: quat.z / length,
        w: quat.w / length,
    };
}

function quatMultiply(a: Quaternion, b: Quaternion): Quaternion {
    return quatNormalize({
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    });
}

function quatFromAxisAngle(axis: Vec3, angleRad: number): Quaternion {
    const unitAxis = normalizeVec(axis);
    const half = angleRad / 2;
    const s = Math.sin(half);
    return quatNormalize({
        x: unitAxis.x * s,
        y: unitAxis.y * s,
        z: unitAxis.z * s,
        w: Math.cos(half),
    });
}

function quatFromUnitVectors(from: Vec3, to: Vec3): Quaternion {
    const a = normalizeVec(from);
    const b = normalizeVec(to);
    const dot = clamp(dotVec(a, b), -1, 1);
    if (dot > 0.999999) return quatIdentity();
    if (dot < -0.999999) {
        const orthogonal = Math.abs(a.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 0, z: 1 };
        return quatFromAxisAngle(crossVec(a, orthogonal), Math.PI);
    }
    const cross = crossVec(a, b);
    return quatNormalize({
        x: cross.x,
        y: cross.y,
        z: cross.z,
        w: 1 + dot,
    });
}

function rotateVec(vec: Vec3, quat: Quaternion): Vec3 {
    const qVec = { x: quat.x, y: quat.y, z: quat.z };
    const uv = crossVec(qVec, vec);
    const uuv = crossVec(qVec, uv);
    return {
        x: vec.x + 2 * (quat.w * uv.x + uuv.x),
        y: vec.y + 2 * (quat.w * uv.y + uuv.y),
        z: vec.z + 2 * (quat.w * uv.z + uuv.z),
    };
}

function directionFromAzAltDeg(azDeg: number, altDeg: number): Vec3 {
    const azRad = (azDeg * Math.PI) / 180;
    const altRad = (altDeg * Math.PI) / 180;
    const rc = Math.cos(altRad);
    return {
        x: rc * Math.cos(azRad),
        y: Math.sin(altRad),
        z: rc * Math.sin(azRad),
    };
}

function normalizeHorizonProfile(theme: HorizonThemeConfig | undefined): NormalizedHorizonProfile {
    const rawPoints = theme?.profile?.points ?? [];
    const rotateDeg = theme?.profile?.angleRotateZDeg ?? 0;
    if (rawPoints.length < 2) {
        return { rotateDeg, points: [], baseAltDeg: 0 };
    }
    const points = [...rawPoints]
        .map((point) => ({
            azDeg: normalizeAzimuthDeg(point.azDeg),
            altDeg: clamp(point.altDeg, -30, 35),
        }))
        .sort((a, b) => a.azDeg - b.azDeg);
    const baseAltDeg = points.reduce((sum, point) => sum + point.altDeg, 0) / points.length;
    return { rotateDeg, points, baseAltDeg };
}

function sampleHorizonAltitudeDeg(profile: NormalizedHorizonProfile, azDeg: number): number {
    if (profile.points.length < 2) return profile.baseAltDeg;
    const query = normalizeAzimuthDeg(azDeg + profile.rotateDeg);
    const first = profile.points[0]!;
    for (let index = 1; index < profile.points.length; index++) {
        const prev = profile.points[index - 1]!;
        const next = profile.points[index]!;
        if (query >= prev.azDeg && query <= next.azDeg) {
            const t = (query - prev.azDeg) / Math.max(0.0001, next.azDeg - prev.azDeg);
            return prev.altDeg + (next.altDeg - prev.altDeg) * t;
        }
    }
    const last = profile.points[profile.points.length - 1]!;
    const wrappedQuery = query < first.azDeg ? query + 360 : query;
    const t = (wrappedQuery - last.azDeg) / Math.max(0.0001, first.azDeg + 360 - last.azDeg);
    return last.altDeg + (first.altDeg - last.altDeg) * t;
}

function getChapterDirections(arrangement: StarArrangement): Vec3[] {
    const directions: Vec3[] = [];
    for (const [id, entry] of Object.entries(arrangement)) {
        if (!id.startsWith("C:") || !entry.position) continue;
        const [x, y, z] = entry.position;
        directions.push(normalizeVec({ x, y, z }));
    }
    return directions;
}

function evaluateArrangementMargin(
    directions: Vec3[],
    profile: NormalizedHorizonProfile,
    rotation: Quaternion,
): number {
    let minMarginDeg = Number.POSITIVE_INFINITY;
    for (const direction of directions) {
        const rotated = normalizeVec(rotateVec(direction, rotation));
        const altDeg = (Math.asin(clamp(rotated.y, -1, 1)) * 180) / Math.PI;
        const azDeg = normalizeAzimuthDeg((Math.atan2(rotated.z, rotated.x) * 180) / Math.PI);
        const marginDeg = altDeg - sampleHorizonAltitudeDeg(profile, azDeg);
        if (marginDeg < minMarginDeg) minMarginDeg = marginDeg;
    }
    return Number.isFinite(minMarginDeg) ? minMarginDeg : Number.NEGATIVE_INFINITY;
}

function applyQuaternionToArrangement(arrangement: StarArrangement, rotation: Quaternion): StarArrangement {
    const next: StarArrangement = {};
    for (const [id, entry] of Object.entries(arrangement)) {
        const transformed = { ...entry };
        if (entry.position) {
            const [x, y, z] = entry.position;
            const rotated = rotateVec({ x, y, z }, rotation);
            transformed.position = [rotated.x, rotated.y, rotated.z];
        }
        if (entry.center) {
            const [x, y, z] = entry.center;
            const rotated = rotateVec({ x, y, z }, rotation);
            transformed.center = [rotated.x, rotated.y, rotated.z];
        }
        next[id] = transformed;
    }
    return next;
}

function findBestVisibilityRotation(
    arrangement: StarArrangement,
    theme: HorizonThemeConfig | undefined,
    clearanceDeg: number,
): Quaternion {
    const chapterDirections = getChapterDirections(arrangement);
    if (chapterDirections.length === 0) return quatIdentity();

    const profile = normalizeHorizonProfile(theme);
    if (profile.points.length < 2) return quatIdentity();

    let bestRotation = quatIdentity();
    let bestMargin = evaluateArrangementMargin(chapterDirections, profile, bestRotation);

    for (let yawDeg = 2; yawDeg < 360; yawDeg += 2) {
        const rotation = quatFromAxisAngle({ x: 0, y: 1, z: 0 }, (yawDeg * Math.PI) / 180);
        const margin = evaluateArrangementMargin(chapterDirections, profile, rotation);
        if (margin > bestMargin) {
            bestMargin = margin;
            bestRotation = rotation;
        }
    }

    if (bestMargin >= clearanceDeg) return bestRotation;

    const centroid = normalizeVec(
        chapterDirections.reduce(
            (sum, direction) => ({
                x: sum.x + direction.x,
                y: sum.y + direction.y,
                z: sum.z + direction.z,
            }),
            { x: 0, y: 0, z: 0 },
        ),
    );

    for (let altDeg = 40; altDeg <= 90; altDeg += 10) {
        for (let azDeg = 0; azDeg < 360; azDeg += 10) {
            const targetDirection = directionFromAzAltDeg(azDeg, altDeg);
            const centerRotation = quatFromUnitVectors(centroid, targetDirection);
            for (let twistDeg = 0; twistDeg < 360; twistDeg += 10) {
                const twistRotation = quatFromAxisAngle(targetDirection, (twistDeg * Math.PI) / 180);
                const rotation = quatMultiply(twistRotation, centerRotation);
                const margin = evaluateArrangementMargin(chapterDirections, profile, rotation);
                if (margin > bestMargin) {
                    bestMargin = margin;
                    bestRotation = rotation;
                }
            }
        }
    }

    return bestRotation;
}

export function optimizeArrangementForVisibility(
    arrangement: StarArrangement,
    theme: HorizonThemeConfig | undefined,
): StarArrangement {
    const rotation = findBestVisibilityRotation(arrangement, theme, 0.5);
    if (rotation.w === 1 && rotation.x === 0 && rotation.y === 0 && rotation.z === 0) {
        return arrangement;
    }
    return applyQuaternionToArrangement(arrangement, rotation);
}

export function buildModelFromArrangement(arrangement: StarArrangement): SceneModel {
    const nodes: SceneNode[] = [];
    const addedTestaments = new Set<string>();
    const addedDivisions = new Set<string>();
    const addedBooks = new Set<string>();

    const chapterIds = Object.keys(arrangement)
        .filter((id) => id.startsWith("C:"))
        .sort((a, b) => (CHAPTER_BY_ID.get(a)?.globalIndex ?? 9999) - (CHAPTER_BY_ID.get(b)?.globalIndex ?? 9999));

    for (const id of chapterIds) {
        const chapter = CHAPTER_BY_ID.get(id);
        if (!chapter) continue;

        const testamentId = `T:${chapter.testament}`;
        if (!addedTestaments.has(testamentId)) {
            addedTestaments.add(testamentId);
            nodes.push({ id: testamentId, label: chapter.testament, level: 0, meta: { testament: chapter.testament } });
        }

        const divisionId = `D:${chapter.testament}:${chapter.divisionName}`;
        if (!addedDivisions.has(divisionId)) {
            addedDivisions.add(divisionId);
            nodes.push({
                id: divisionId,
                label: chapter.divisionName,
                level: 1,
                parent: testamentId,
                meta: { testament: chapter.testament, division: chapter.divisionName },
            });
        }

        const bookId = `B:${chapter.bookKey}`;
        if (!addedBooks.has(bookId)) {
            addedBooks.add(bookId);
            nodes.push({
                id: bookId,
                label: chapter.bookName,
                level: 2,
                parent: divisionId,
                meta: { bookKey: chapter.bookKey, book: chapter.bookName },
            });
        }

        nodes.push({
            id,
            label: `${chapter.bookKey} ${chapter.chapterNumber}`,
            level: 3,
            parent: bookId,
            weight: chapter.verseCount,
            meta: { bookKey: chapter.bookKey, chapter: chapter.chapterNumber },
        });
    }

    return { nodes };
}

const TRIANGULATION_MAX_EDGE_FACTOR = 2.35;

type TriPoint = {
    id: string;
    x: number;
    y: number;
};

type TriEdge = {
    a: string;
    b: string;
};

function triangulationKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function circumcircleContains(
    ax: number,
    ay: number,
    bx: number,
    by: number,
    cx: number,
    cy: number,
    px: number,
    py: number,
): boolean {
    const apx = ax - px;
    const apy = ay - py;
    const bpx = bx - px;
    const bpy = by - py;
    const cpx = cx - px;
    const cpy = cy - py;

    const det = (apx * apx + apy * apy) * (bpx * cpy - cpx * bpy)
        - (bpx * bpx + bpy * bpy) * (apx * cpy - cpx * apy)
        + (cpx * cpx + cpy * cpy) * (apx * bpy - bpx * apy);
    const orientation = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    return orientation > 0 ? det > 1e-9 : det < -1e-9;
}

function bowyerWatson(points: TriPoint[]): TriEdge[] {
    if (points.length < 3) return [];

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    const deltaMax = Math.max(dx, dy);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const superA: TriPoint = { id: "__super_a__", x: midX - 20 * deltaMax, y: midY - deltaMax };
    const superB: TriPoint = { id: "__super_b__", x: midX, y: midY + 20 * deltaMax };
    const superC: TriPoint = { id: "__super_c__", x: midX + 20 * deltaMax, y: midY - deltaMax };

    let triangles = [{ a: superA, b: superB, c: superC }];

    for (const point of points) {
        const bad = triangles.filter((triangle) =>
            circumcircleContains(
                triangle.a.x,
                triangle.a.y,
                triangle.b.x,
                triangle.b.y,
                triangle.c.x,
                triangle.c.y,
                point.x,
                point.y,
            ),
        );

        const polygon = new Map<string, { a: TriPoint; b: TriPoint; count: number }>();
        for (const triangle of bad) {
            const edges = [
                [triangle.a, triangle.b],
                [triangle.b, triangle.c],
                [triangle.c, triangle.a],
            ] as const;

            for (const [edgeA, edgeB] of edges) {
                const key = triangulationKey(edgeA.id, edgeB.id);
                const existing = polygon.get(key);
                if (existing) {
                    existing.count += 1;
                } else {
                    polygon.set(key, { a: edgeA, b: edgeB, count: 1 });
                }
            }
        }

        triangles = triangles.filter((triangle) => !bad.includes(triangle));

        for (const edge of polygon.values()) {
            if (edge.count !== 1) continue;
            triangles.push({ a: edge.a, b: edge.b, c: point });
        }
    }

    const edges = new Map<string, TriEdge>();
    for (const triangle of triangles) {
        const ids = [triangle.a.id, triangle.b.id, triangle.c.id];
        if (ids.some((id) => id.startsWith("__super_"))) continue;
        const pairs = [
            [triangle.a.id, triangle.b.id],
            [triangle.b.id, triangle.c.id],
            [triangle.c.id, triangle.a.id],
        ] as const;
        for (const [a, b] of pairs) edges.set(triangulationKey(a, b), { a, b });
    }

    return [...edges.values()];
}

function divisionTriangulationColor(divisionName: string): string {
    const key = divisionName.toLowerCase();
    if (key === "the law" || key === "paul's letters") return "#6eaaff";
    if (key === "history" || key === "prophecy") return "#b678ff";
    if (key === "wisdom" || key === "general letters") return "#ff6e6e";
    if (key === "major prophets" || key === "early church") return "#6ed692";
    if (key === "minor prophets" || key === "gospels") return "#ffd65c";
    return "#b4bedc";
}

export function buildTriangulatedConstellations(
    arrangement: StarArrangement,
    baseConfig: ConstellationConfig | null,
): ConstellationConfig | null {
    if (!baseConfig) return baseConfig;

    const books = new Map<string, {
        divisionName: string;
        points: Array<{ chapterId: string; x: number; y: number }>;
    }>();

    for (const [chapterId, entry] of Object.entries(arrangement)) {
        if (!chapterId.startsWith("C:") || !entry.position) continue;
        const chapter = CHAPTER_BY_ID.get(chapterId);
        if (!chapter) continue;

        let book = books.get(chapter.bookKey);
        if (!book) {
            book = { divisionName: chapter.divisionName, points: [] };
            books.set(chapter.bookKey, book);
        }
        book.points.push({
            chapterId,
            x: entry.position[0],
            y: entry.position[2],
        });
    }

    const lineDataByBookKey = new Map<string, {
        color: string;
        lineSegments: Array<{ from: string; to: string; color: string }>;
    }>();

    for (const [bookKey, book] of books.entries()) {
        const pointMap = new Map(book.points.map((point) => [point.chapterId, point] as const));
        const edgesRaw = book.points.length === 2
            ? [{ a: book.points[0]!.chapterId, b: book.points[1]!.chapterId }]
            : bowyerWatson(book.points.map((point) => ({
                id: point.chapterId,
                x: point.x,
                y: point.y,
            })));

        const lengths = edgesRaw
            .map((edge) => {
                const pointA = pointMap.get(edge.a);
                const pointB = pointMap.get(edge.b);
                if (!pointA || !pointB) return Infinity;
                return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
            })
            .filter(Number.isFinite);

        const averageLength = lengths.length > 0
            ? lengths.reduce((sum, value) => sum + value, 0) / lengths.length
            : 0;
        const maxLength = averageLength > 0 ? averageLength * TRIANGULATION_MAX_EDGE_FACTOR : Infinity;
        const color = divisionTriangulationColor(book.divisionName);

        const lineSegments = edgesRaw
            .map((edge) => {
                const pointA = pointMap.get(edge.a);
                const pointB = pointMap.get(edge.b);
                if (!pointA || !pointB) return null;
                const length = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
                if (length > maxLength) return null;
                return { from: pointA.chapterId, to: pointB.chapterId, color };
            })
            .filter((edge): edge is { from: string; to: string; color: string } => edge !== null);

        lineDataByBookKey.set(bookKey, { color, lineSegments });
    }

    return {
        ...baseConfig,
        constellations: baseConfig.constellations.map((constellation) => {
            const anchorBookKey = constellation.anchors[0]?.split(":")[1];
            if (!anchorBookKey) return constellation;
            const lineData = lineDataByBookKey.get(anchorBookKey);
            if (!lineData) {
                return {
                    ...constellation,
                    lineSegments: [],
                    linePaths: [],
                };
            }
            return {
                ...constellation,
                lineColor: lineData.color,
                linePaths: [],
                lineSegments: lineData.lineSegments,
            };
        }),
    };
}
