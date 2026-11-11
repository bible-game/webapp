/**
 * Checks that the Bible's structure the app ships with (src/core/config/bible.json) is the one the services use (the
 * deployment repo's configuration/<environment>/bible.json, which the passage service loads). Guesses are scored in the
 * browser from the app's copy, and nothing else can score them, so the two must never drift apart. If they differ the
 * build stops here; copy the services' file over the app's (or the other way round) so they match.
 *
 * It needs the deployment repo beside this one (../deployment), or BIBLE_CONFIG_DIR set to its configuration folder.
 * Where neither is there (on Vercel, which can't see that private repo) it says so and lets the build carry on.
 *
 *     npm run check:bible     (also run before every npm run build)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appFile = join(root, "src/core/config/bible.json");
const dir = process.env.BIBLE_CONFIG_DIR ?? resolve(root, "../deployment/configuration");

if (!existsSync(dir)) {
    console.warn(`check:bible skipped: no services' configuration at ${dir} (set BIBLE_CONFIG_DIR to check against it)`);
    process.exit(0);
}

const read = (file) => JSON.parse(readFileSync(file, "utf8"));
const books = (bible) => bible.testaments.flatMap((t) => t.divisions.flatMap((d) => d.books.map((b) => ({ ...b, testament: t.name, division: d.name }))));
// the same JSON, whatever order its keys were written in
const canonical = (value) => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])])) : value;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

/** The first place two structures part, in words: a book missing, renamed, moved or recounted */
function firstDifference(app, theirs) {
    const ours = books(app), others = books(theirs);
    for (let i = 0; i < Math.max(ours.length, others.length); i++) {
        const a = ours[i], b = others[i];
        if (!a || !b) return `the app has ${ours.length} books, the services ${others.length}`;
        if (!same(a, b)) {
            const fields = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => !same(a[k], b[k]));
            return `book ${i + 1} (app: ${a.name}, services: ${b.name}) differs in ${fields.join(", ")}`;
        }
    }
    return "outside the books (testament or division names, or other fields)";
}

const app = read(appFile);
const environments = readdirSync(dir).filter((name) => existsSync(join(dir, name, "bible.json"))).sort();
if (!environments.length) {
    console.warn(`check:bible skipped: no bible.json under ${dir}`);
    process.exit(0);
}

const drifted = environments.filter((name) => !same(app, read(join(dir, name, "bible.json"))));
if (drifted.length) {
    console.error("check:bible failed: the app's Bible structure (src/core/config/bible.json) differs from the services':");
    for (const name of drifted) console.error(`  ${name}: ${firstDifference(app, read(join(dir, name, "bible.json")))}`);
    process.exit(1);
}
console.log(`check:bible: src/core/config/bible.json matches the services' (${environments.join(", ")})`);
