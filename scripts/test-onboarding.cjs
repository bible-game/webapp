// Exercises state ownership and server-action boundaries without touching a real Clerk account or service.
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function loader(mocks = {}) {
    const cache = new Map();
    return function load(name) {
        const filename = path.resolve(root, name);
        if (cache.has(filename)) return cache.get(filename).exports;
        const module = { exports: {} }; cache.set(filename, module);
        const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        }).outputText;
        const localRequire = spec => {
            if (Object.hasOwn(mocks, spec)) return mocks[spec];
            if (spec.startsWith('@/')) return load('src/' + spec.slice(2) + '.ts');
            if (spec.startsWith('.')) return load(path.resolve(path.dirname(filename), spec) + '.ts');
            return require(spec);
        };
        new Function('require', 'module', 'exports', source)(localRequire, module, module.exports);
        return module.exports;
    };
}

let storage;
beforeEach(() => {
    const entries = new Map();
    storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, String(value)), removeItem: key => entries.delete(key) };
    global.localStorage = storage;
    global.document = { cookie: '' };
    global.location = { protocol: 'http:' };
    global.window = { dispatchEvent: () => {} };
    Object.defineProperty(global, 'navigator', { configurable: true, value: { locks: { request: async (_key, fn) => fn() } } });
});
const save = (key, value) => storage.setItem(key, JSON.stringify(value));
const game = (id, guesses = 1, playing = true) => ({ passageId: id, passageBook: 'John', passageChapter: '1', stars: 0, playing, guesses: Array.from({ length: guesses }, () => ({ book: 'John', chapter: '1', distance: 5 })) });

function device(sync = async () => 'synced') {
    const load = loader({ '@/core/action/state/sync-state': { syncState: sync } });
    return { Storage: load('src/core/util/storage-util.ts').StorageUtil, State: load('src/core/util/state-util.ts').StateUtil,
        prepare: load('src/core/util/account-storage.ts').prepareAccountStorage, sync: load('src/core/util/state-sync.ts').syncLocalState };
}

test('first-time guest progress transfers once and stays isolated from another account', async () => {
    save('games', [[1, game(1)]]); save('reads', [['John1', { passageKey: 'John1' }]]);
    const d = device(); await d.prepare(null); d.Storage.selectOwner(null);
    assert.equal(d.State.getAllGames().size, 1);
    await d.prepare('user_A'); d.Storage.selectOwner('user_A');
    assert.equal(d.State.getUnsynced().games.length, 1);
    assert.equal(d.State.getUnsynced().reads.length, 1);
    await d.prepare('user_B'); d.Storage.selectOwner('user_B');
    assert.equal(d.State.getAllGames().size, 0);
    d.Storage.selectOwner('user_A'); assert.equal(d.State.getAllGames().size, 1);
    d.Storage.selectOwner(null); assert.equal(d.State.getAllGames().size, 0);
    assert.ok(storage.getItem('games'), 'original unscoped storage remains a backup');
});

test('an ambiguous legacy account cache is retained and never transferred into a different account', async () => {
    document.cookie = 'known_user=1'; save('games', [[9, game(9)]]);
    const d = device(); await d.prepare('user_B'); d.Storage.selectOwner('user_B');
    assert.equal(d.State.getAllGames().size, 0);
    assert.equal(JSON.parse(storage.getItem('games')).length, 1);
});

test('completed account games and existing reviews survive a guest transfer', async () => {
    const d = device(); await d.prepare(null);
    save(d.Storage.key('games', null), [[1, game(1, 4)], [2, game(2, 3)]]);
    save(d.Storage.key('games', 'user_A'), [[1, game(1, 2, false)], [2, game(2, 1)]]);
    save(d.Storage.key('reviews', null), [['John1', { summary: 'Guest' }]]);
    save(d.Storage.key('reviews', 'user_A'), [['John1', { summary: 'Account' }]]);
    await d.prepare('user_A'); d.Storage.selectOwner('user_A');
    assert.equal(d.State.getGame(1).guesses.length, 2);
    assert.equal(d.State.getGame(2).guesses.length, 3);
    assert.equal(d.State.getReview('John1').summary, 'Account');
});

test('a storage quota failure leaves the guest source intact and the transfer can retry', async () => {
    const d = device(); await d.prepare(null);
    save(d.Storage.key('games', null), [[1, game(1)]]);
    save(d.Storage.key('reads', null), [['John1', { passageKey: 'John1' }]]);
    const original = storage.setItem;
    storage.setItem = (key, value) => { if (key === d.Storage.key('reads', 'user_A')) throw Error('quota'); original(key, value); };
    await assert.rejects(d.prepare('user_A'));
    assert.equal(JSON.parse(storage.getItem(d.Storage.key('games', null))).length, 1);
    storage.setItem = original;
    await d.prepare('user_A'); d.Storage.selectOwner('user_A');
    assert.equal(d.State.getAllGames().size, 1);
    assert.equal(d.State.getAllReads().size, 1);
});

test('an unsupported transfer lock preserves guest data', async () => {
    const d = device(); await d.prepare(null);
    save(d.Storage.key('games', null), [[1, game(1)]]);
    navigator.locks = undefined;
    assert.equal(await d.prepare('user_A'), false);
    assert.ok(storage.getItem(d.Storage.key('games', null)));
});

test('server snapshots cannot erase pending local progress', async () => {
    const d = device(); await d.prepare('user_A'); d.Storage.selectOwner('user_A');
    d.State.setGame(game(1, 3));
    d.State.setAllGame(new Map([[1, game(1, 1)], [2, game(2)]]));
    assert.equal(d.State.getGame(1).guesses.length, 3);
    assert.equal(d.State.getUnsynced().games.length, 1);
});

test('failed sync keeps its snapshot pending; a successful retry acknowledges it', async () => {
    let count = 0;
    const d = device(async (body, owner) => {
        assert.equal(owner, 'user_A');
        assert.equal(body.games[0].guesses[0].passageBook, 'John');
        return ++count === 1 ? 'retry' : 'synced';
    });
    await d.prepare('user_A'); d.Storage.selectOwner('user_A'); d.State.setGame(game(1));
    assert.equal(await d.sync(), 'retry'); assert.equal(d.State.getUnsynced().games.length, 1);
    assert.equal(await d.sync(), 'synced'); assert.equal(d.State.getUnsynced().games.length, 0);
});

test('an old response cannot acknowledge a different account after a session switch', async () => {
    let finish;
    const d = device(() => new Promise(resolve => { finish = resolve; }));
    await d.prepare('user_A'); d.Storage.selectOwner('user_A'); d.State.setGame(game(1));
    const pending = d.sync();
    await d.prepare('user_B'); d.Storage.selectOwner('user_B'); d.State.setGame(game(2));
    finish('synced');
    assert.equal(await pending, 'signed-out'); assert.equal(d.State.getUnsynced().games.length, 1);
    d.Storage.selectOwner('user_A'); assert.equal(d.State.getUnsynced().games.length, 1);
});

test('redirects retain local destinations and reject external URLs and onboarding loops', () => {
    const { accountNext, continueTo } = loader()('src/core/auth/paths.ts');
    assert.equal(accountNext('/study/John1?view=quiz#answer'), '/study/John1?view=quiz#answer');
    assert.equal(accountNext('/account/manage'), '/account/manage');
    assert.equal(accountNext('/account/manage/security'), '/account/manage/security');
    assert.equal(accountNext('/account/manage/../profile'), '/play/today');
    for (const input of ['https://evil.example', '//evil.example', '/\\evil', '/\nevil', '/account/continue', '/%61ccount/profile', '/sign-in', '/%']) {
        assert.equal(accountNext(input), '/play/today', input);
    }
    assert.equal(continueTo('/stats'), '/account/continue?next=%2Fstats');
});

test('server sync and progress writes reject snapshots belonging to another active session', async () => {
    const load = loader({
        '@clerk/nextjs/server': { auth: async () => ({ isAuthenticated: true, userId: 'user_B' }) },
        '@/core/util/auth-util': { getToken: async () => { throw Error('must not retrieve a token'); } },
        'next/headers': { cookies: async () => { throw Error('must not change cookies'); } },
    });
    const { syncState } = load('src/core/action/state/sync-state.ts');
    assert.equal(await syncState({ games: [game(1)], reads: [], reviews: [] }, 'user_A'), 'signed-out');
    assert.equal(await syncState({ games: [], reads: [], reviews: [] }), 'signed-out');
    const { post } = load('src/core/action/http/post.ts');
    assert.equal(await post('/state/read', {}, 'user_A'), undefined);
    assert.equal(await post('https://evil.example/steal-token', {}, 'user_B'), undefined);
});


test('profile completion cannot bypass required names with empty fields or a skip intent', async () => {
    let updates = 0;
    const load = loader({
        '@clerk/nextjs/server': { auth: async () => ({ isAuthenticated: true, userId: 'user_A' }),
            currentUser: async () => { updates++; throw Error('must not reach Clerk'); } },
        '@/core/auth/account-service': { accountStatus: async () => ({ status: 'ready', info: { firstname: '', lastname: '', profileCompleted: true } }) },
        'next/navigation': { redirect: () => { throw Error('must not redirect an incomplete profile'); } },
    });
    const { completeProfile } = load('src/core/action/account/complete-profile.ts');
    for (const [first, last, intent] of [['', '', 'save'], ['  ', 'Smith', 'save'], ['', '', 'skip']]) {
        const form = new FormData();
        for (const [key, value] of Object.entries({ owner: 'user_A', firstname: first, lastname: last, intent })) form.set(key, value);
        const result = await completeProfile({ error: '' }, form);
        assert.match(result.error, /first and last names/);
    }
    assert.equal(updates, 0);
});

test('profile completion preserves social names and never forwards church collection', async () => {
    const savedFetch = global.fetch;
    let payload;
    global.fetch = async (_url, options) => { payload = JSON.parse(options.body); return { ok: true, json: async () => ({ profileCompleted: true }) }; };
    try {
        const load = loader({
            '@clerk/nextjs/server': {
                auth: async () => ({ isAuthenticated: true, userId: 'user_A', getToken: async () => 'token' }),
                currentUser: async () => ({ id: 'user_A', firstName: 'Élodie', lastName: 'O’Connor-李' }),
                clerkClient: async () => { throw Error('existing social names must not be rewritten'); },
            },
            '@/core/auth/account-service': { accountStatus: async () => ({ status: 'ready', info: { firstname: 'Élodie', lastname: 'O’Connor-李', profileCompleted: false } }) },
            'next/navigation': { redirect: url => { throw Object.assign(Error('redirect'), { destination: url }); } },
        });
        const form = new FormData(); form.set('owner', 'user_A'); form.set('intent', 'skip'); form.set('church', 'Unwanted church submission'); form.set('next', '/stats');
        await assert.rejects(load('src/core/action/account/complete-profile.ts').completeProfile({ error: '' }, form), error => error.destination === '/stats');
        assert.deepEqual(payload, { firstname: 'Élodie', lastname: 'O’Connor-李' });
    } finally { global.fetch = savedFetch; }
});
