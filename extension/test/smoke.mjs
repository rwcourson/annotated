/* annotated — extension smoke test.
 * 1. Manifest parses and declares everything the product needs.
 * 2. Every file referenced by the manifest exists on disk.
 * 3. Pure logic (mm:ss parsing, 90s validation, clamping, type detection)
 *    behaves per spec — shared.js is evaluated in a VM sandbox.
 * 4. Every API path the panel calls matches the documented contract.
 *
 * Run: node test/smoke.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;

function ok(cond, name) {
  if (cond) {
    passed++;
    console.log(`  ok  ${name}`);
  } else {
    failed++;
    console.error(`FAIL  ${name}`);
  }
}

/* ---------- 1. manifest ---------- */
console.log('\nmanifest.json');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
ok(manifest.manifest_version === 3, 'manifest_version is 3');
ok(manifest.name === 'annotated', 'name is "annotated"');
for (const perm of ['sidePanel', 'activeTab', 'scripting', 'storage', 'contextMenus', 'tabs']) {
  ok(manifest.permissions.includes(perm), `permission: ${perm}`);
}
ok(
  manifest.host_permissions.includes('<all_urls>'),
  'host_permissions includes <all_urls>'
);
ok(manifest.background && manifest.background.service_worker === 'background.js', 'service worker declared');
ok(manifest.side_panel && manifest.side_panel.default_path === 'sidepanel.html', 'side panel declared');
ok(manifest.action && manifest.action.default_title, 'action declared');

/* ---------- 2. referenced files exist ---------- */
console.log('\nreferenced files');
const refs = new Set([
  manifest.background.service_worker,
  manifest.side_panel.default_path,
  ...Object.values(manifest.icons || {}),
  ...Object.values((manifest.action && manifest.action.default_icon) || {}),
  ...(manifest.content_scripts || []).flatMap((cs) => cs.js || []),
]);
for (const rel of refs) {
  ok(existsSync(join(root, rel)), `exists: ${rel}`);
}
// Files the HTML loads:
const html = readFileSync(join(root, 'sidepanel.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const rel = m[1];
  if (/^https?:/.test(rel)) continue;
  ok(existsSync(join(root, rel)), `exists (from HTML): ${rel}`);
}
ok(!/<[a-z]+\s[^>]*\son[a-z]+=/i.test(html), 'no inline event handlers in HTML (MV3 CSP)');

/* ---------- 3. pure logic from shared.js ---------- */
console.log('\nshared.js logic');
// Mirror the browser globals shared.js relies on (vm contexts don't inject them).
const sandbox = { URL };
vm.createContext(sandbox);
vm.runInContext(readFileSync(join(root, 'shared.js'), 'utf8'), sandbox);
const S = sandbox.AnnotatedShared;
ok(!!S, 'AnnotatedShared global is defined');

// parseTimeInput
ok(S.parseTimeInput('1:30') === 90, 'parse "1:30" -> 90');
ok(S.parseTimeInput('90') === 90, 'parse "90" -> 90');
ok(S.parseTimeInput('0:05') === 5, 'parse "0:05" -> 5');
ok(S.parseTimeInput('1:02:03') === 3723, 'parse "1:02:03" -> 3723');
ok(S.parseTimeInput('') === null, 'parse "" -> null');
ok(S.parseTimeInput('abc') === null, 'parse "abc" -> null');
ok(S.parseTimeInput('1:99') === null, 'parse "1:99" -> null (invalid seconds)');

// formatTime
ok(S.formatTime(90) === '1:30', 'format 90 -> "1:30"');
ok(S.formatTime(5) === '0:05', 'format 5 -> "0:05"');
ok(S.formatTime(3723) === '1:02:03', 'format 3723 -> "1:02:03"');

// validateClipRange (the 90s rule)
ok(S.MAX_CLIP_SECONDS === 90, 'MAX_CLIP_SECONDS is 90');
ok(S.validateClipRange(0, 90).ok === true, '0 -> 90 is allowed (exactly 90s)');
ok(S.validateClipRange(10, 100).ok === true, '10 -> 100 is allowed');
ok(S.validateClipRange(0, 91).ok === false, '0 -> 91 is rejected (over 90s)');
ok(S.validateClipRange(0, 600).ok === false, '0 -> 600 is rejected');
ok(S.validateClipRange(60, 30).ok === false, 'end before start is rejected');
ok(S.validateClipRange(-5, 30).ok === false, 'negative start is rejected');
ok(S.validateClipRange(null, 30).ok === false, 'missing start is rejected');
ok(S.validateClipRange(0, 90).duration === 90, 'duration reported correctly');

// clampToMax
const c = S.clampToMax(30, 200);
ok(c.endSec - c.startSec === 90, 'clampToMax clamps to exactly 90s');
const c2 = S.clampToMax(0, 45);
ok(c2.endSec === 45, 'clampToMax leaves short ranges alone');

// detectAnnotationType
ok(
  S.detectAnnotationType('https://www.youtube.com/watch?v=abc123', null) === 'video',
  'YouTube watch URL -> video'
);
ok(
  S.detectAnnotationType('https://example.com/pod', { found: true, kind: 'audio' }) === 'audio',
  'page with audio element -> audio'
);
ok(
  S.detectAnnotationType('https://example.com/post', { found: false }) === 'article',
  'plain page -> article'
);

// normalizeBaseUrl
ok(S.normalizeBaseUrl('http://localhost:3000/') === 'http://localhost:3000', 'trailing slash stripped');
ok(S.normalizeBaseUrl('') === S.DEFAULT_BASE_URL, 'empty falls back to default');

/* ---------- 4. API contract ---------- */
console.log('\nAPI contract');
ok(S.API.upload === '/api/upload', 'upload path');
ok(S.API.annotations === '/api/annotations', 'annotations path');
ok(S.API.feed === '/api/feed', 'feed path');
ok(S.API.me === '/api/extension/me', 'authenticated profile path');
ok(S.API.connect === '/connect', 'connect path');
ok(S.API.annotationPath('xyz') === '/a/xyz', 'annotation page path');

// The panel must call exactly these paths (no drift from the contract).
const panelJs = readFileSync(join(root, 'sidepanel.js'), 'utf8');
for (const path of ['/api/upload', '/api/annotations', '/api/feed', '/api/extension/me', '/connect']) {
  const key = path === '/connect' ? 'connect' : path === '/api/extension/me' ? 'me' : path.split('/').pop();
  const viaShared = panelJs.includes(`S.API.${key}`);
  ok(viaShared, `sidepanel.js uses shared constant for ${path}`);
}
ok(panelJs.includes('S.API.annotationPath('), 'sidepanel.js builds view links via annotationPath');
ok(
  !/fetch\(\s*['"]/.test(panelJs),
  'no hardcoded fetch URLs in sidepanel.js (all via baseUrl + S.API)'
);
ok(panelJs.includes("'Bearer ' + state.token"), 'Authorization: Bearer header sent');
ok(panelJs.includes("crypto.randomUUID()"), 'connect flow creates a one-time nonce');
ok(panelJs.includes("extension_nonce="), 'connect flow carries nonce to the web app');
ok(
  panelJs.includes("state.mediaUrl = media && media.found && !media.isYouTube") &&
    panelJs.includes("payload.mediaUrl = state.mediaUrl"),
  'direct media stream is preserved separately from the attributed source page'
);

const backgroundJs = readFileSync(join(root, 'background.js'), 'utf8');
const contentJs = readFileSync(join(root, 'content.js'), 'utf8');
ok(backgroundJs.includes("COMPLETE_ACCOUNT_CONNECTION"), 'service worker handles account handoff');
ok(backgroundJs.includes("stored.connectNonce === msg.nonce"), 'service worker verifies the pending nonce');
ok(backgroundJs.includes("isConnectPage"), 'service worker restricts handoff to /connect');
ok(contentJs.includes("ANNOTATED_EXTENSION_CONNECT"), 'content script relays web account handoff');
ok(contentJs.includes("ANNOTATED_EXTENSION_CONNECT_RESULT"), 'content script reports handoff result');

/* ---------- 5. account handoff behavior ---------- */
console.log('\naccount handoff');
let messageListener = null;
const storageState = { connectNonce: '1234567890abcdef', apiToken: '', baseUrl: '' };
const workerSandbox = {
  URL,
  console,
  chrome: {
    sidePanel: {
      setPanelBehavior: () => Promise.resolve(),
      open: () => Promise.resolve(),
    },
    contextMenus: {
      removeAll: (callback) => callback(),
      create: () => {},
      onClicked: { addListener: () => {} },
    },
    runtime: {
      onInstalled: { addListener: () => {} },
      onStartup: { addListener: () => {} },
      onMessage: { addListener: (listener) => { messageListener = listener; } },
    },
    storage: {
      local: {
        get: async (key) => typeof key === 'string' ? { [key]: storageState[key] } : { ...storageState },
        set: async (values) => Object.assign(storageState, values),
        remove: async (key) => { delete storageState[key]; },
      },
    },
  },
};
vm.createContext(workerSandbox);
vm.runInContext(backgroundJs, workerSandbox);
ok(typeof messageListener === 'function', 'service worker message listener registered');

const handoffResponse = await new Promise((resolve) => {
  messageListener(
    {
      type: 'COMPLETE_ACCOUNT_CONNECTION',
      nonce: '1234567890abcdef',
      token: 'annotated-demo-token-9f2c7a41e83b',
    },
    { tab: { url: 'http://localhost:3000/connect?extension_nonce=1234567890abcdef' } },
    resolve
  );
});
ok(handoffResponse.ok === true, 'matching connect request is accepted');
ok(storageState.apiToken === 'annotated-demo-token-9f2c7a41e83b', 'accepted token is stored');
ok(storageState.baseUrl === 'http://localhost:3000', 'connect-page origin becomes base URL');
ok(!('connectNonce' in storageState), 'one-time nonce is consumed');

storageState.connectNonce = 'fresh-nonce-123456';
const rejectedResponse = await new Promise((resolve) => {
  messageListener(
    {
      type: 'COMPLETE_ACCOUNT_CONNECTION',
      nonce: 'wrong-nonce-12345',
      token: 'annotated-demo-token-9f2c7a41e83b',
    },
    { tab: { url: 'http://localhost:3000/connect' } },
    resolve
  );
});
ok(rejectedResponse.ok === false, 'mismatched nonce is rejected');

/* ---------- summary ---------- */
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
