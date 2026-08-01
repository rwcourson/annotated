/* annotated — side panel logic.
 * Tabs: Clip (capture flow), Feed, Settings.
 * Talks to the web app API at the configured base URL and to the content
 * script in the active tab for page capture.
 */
/* global chrome, AnnotatedShared */
'use strict';

const S = AnnotatedShared;
const $ = (id) => document.getElementById(id);

const els = {
  tabs: Array.from(document.querySelectorAll('.tab')),
  views: { clip: $('view-clip'), feed: $('view-feed'), settings: $('view-settings') },
  accountChip: $('account-chip'),
  accountDot: $('account-dot'),
  accountLabel: $('account-label'),

  clipSignedOut: $('clip-signed-out'),
  clipMain: $('clip-main'),
  clipSuccess: $('clip-success'),
  connectBtnClip: $('connect-btn-clip'),
  connectUrlHintClip: $('connect-url-hint-clip'),

  refreshSource: $('refresh-source'),
  pills: Array.from(document.querySelectorAll('#type-pills .pill')),
  sourceUrl: $('source-url'),
  sourceNote: $('source-note'),
  sourceGlyph: $('source-glyph'),

  form: $('clip-form'),
  modeArticle: $('mode-article'),
  modeMedia: $('mode-media'),
  quote: $('quote'),
  grabSelection: $('grab-selection'),
  author: $('author'),
  published: $('published'),
  startTime: $('start-time'),
  startNow: $('start-now'),
  endTime: $('end-time'),
  endNow: $('end-now'),
  clipDuration: $('clip-duration'),
  clamp90: $('clamp-90'),
  mediaHint: $('media-hint'),
  title: $('title'),
  siteName: $('site-name'),
  comment: $('comment'),

  recordBtn: $('record-btn'),
  recordLabel: $('record-label'),
  recTimer: $('rec-timer'),
  recPlayback: $('rec-playback'),
  recAudio: $('rec-audio'),
  recDiscard: $('rec-discard'),
  recError: $('rec-error'),

  formError: $('form-error'),
  submitBtn: $('submit-btn'),
  successLink: $('success-link'),
  clipAnother: $('clip-another'),

  feedSignedOut: $('feed-signed-out'),
  feedMain: $('feed-main'),
  connectBtnFeed: $('connect-btn-feed'),
  feedRefresh: $('feed-refresh'),
  feedStatus: $('feed-status'),
  feedList: $('feed-list'),

  baseUrl: $('base-url'),
  apiToken: $('api-token'),
  tokenShow: $('token-show'),
  saveSettings: $('save-settings'),
  connectBtnSettings: $('connect-btn-settings'),
  connectBtnManual: $('connect-btn-manual'),
  settingsSaved: $('settings-saved'),
  settingsStatus: $('settings-status'),
  settingsAvatar: $('settings-avatar'),
  settingsUser: $('settings-user'),
  settingsHandle: $('settings-handle'),
  disconnectBtn: $('disconnect-btn'),
};

const state = {
  baseUrl: S.DEFAULT_BASE_URL,
  token: '',
  user: null,
  connectionState: 'disconnected',
  type: 'article', // 'article' | 'video' | 'audio'
  typeOverridden: false,
  tabId: null,
  pageUrl: '',
  pageTitle: '',
  mediaUrl: '',
  recorder: {
    mediaRecorder: null,
    stream: null,
    chunks: [],
    dataUrl: null,
    startedAt: 0,
    timerId: null,
  },
};

/* ------------------------------ helpers ------------------------------ */

function showError(el, msg) {
  el.textContent = msg || '';
  el.classList.toggle('hidden', !msg);
}

function setBusy(busy) {
  els.submitBtn.disabled = busy;
  els.submitBtn.textContent = busy ? 'Publishing…' : 'Publish annotation';
}

function relativeTime(iso) {
  const t = Date.parse(iso);
  if (!isFinite(t)) return '';
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return min + 'm ago';
  const h = Math.floor(min / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 30) return d + 'd ago';
  return new Date(t).toLocaleDateString();
}

async function apiFetch(path, options) {
  const opts = options || {};
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
  const res = await fetch(state.baseUrl + path, Object.assign({}, opts, { headers }));
  let body = null;
  try {
    body = await res.json();
  } catch (e) { /* non-JSON response */ }
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || 'Request failed (' + res.status + ')';
    throw new Error(msg);
  }
  return body;
}

/* ------------------------------ tabs ------------------------------ */

function switchView(name) {
  for (const tab of els.tabs) {
    const active = tab.dataset.view === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  }
  for (const [key, view] of Object.entries(els.views)) {
    view.classList.toggle('active', key === name);
  }
  if (name === 'feed') loadFeed();
  if (name === 'clip') refreshCapture();
}

/* ------------------------------ settings ------------------------------ */

async function loadSettings() {
  const stored = await chrome.storage.local.get(['baseUrl', 'apiToken']);
  state.baseUrl = S.normalizeBaseUrl(stored.baseUrl || S.DEFAULT_BASE_URL);
  state.token = stored.apiToken || '';
  els.baseUrl.value = state.baseUrl;
  els.apiToken.value = state.token;
  renderAuthUI();
  if (state.token) await validateConnection();
}

async function saveSettings() {
  state.baseUrl = S.normalizeBaseUrl(els.baseUrl.value);
  state.token = els.apiToken.value.trim();
  await chrome.storage.local.set({ baseUrl: state.baseUrl, apiToken: state.token });
  els.settingsSaved.classList.remove('hidden');
  setTimeout(() => els.settingsSaved.classList.add('hidden'), 2000);
  renderAuthUI();
  if (state.token) await validateConnection();
  if (state.connectionState === 'connected') refreshCapture();
}

function renderAvatar() {
  const fallback = ((state.user && (state.user.name || state.user.username)) || 'A').trim().charAt(0).toUpperCase();
  els.settingsAvatar.textContent = '';
  if (state.user && state.user.image) {
    const img = document.createElement('img');
    img.src = state.user.image;
    img.alt = '';
    els.settingsAvatar.appendChild(img);
  } else {
    els.settingsAvatar.textContent = fallback;
  }
}

function renderAuthUI() {
  const signedIn = state.connectionState === 'connected' && !!state.user;
  els.clipSignedOut.classList.toggle('hidden', signedIn);
  els.clipMain.classList.toggle('hidden', !signedIn);
  els.clipSuccess.classList.add('hidden');
  els.feedSignedOut.classList.add('hidden');
  els.feedMain.classList.remove('hidden');
  els.connectUrlHintClip.textContent = state.baseUrl + S.API.connect;
  els.accountChip.classList.toggle('connected', signedIn);
  els.accountChip.classList.toggle('connecting', state.connectionState === 'checking');
  els.accountLabel.textContent = signedIn
    ? (state.user.name || (state.user.username ? '@' + state.user.username : 'Connected'))
    : state.connectionState === 'checking'
      ? 'Checking…'
      : 'Connect';
  els.settingsUser.textContent = signedIn
    ? (state.user.name || state.user.username || 'annotated user')
    : state.connectionState === 'invalid'
      ? 'Connection expired'
      : 'Not connected';
  els.settingsHandle.textContent = signedIn
    ? (state.user.username ? '@' + state.user.username : state.baseUrl)
    : state.connectionState === 'invalid'
      ? 'Reconnect to keep publishing as yourself'
      : 'Connect to publish as yourself';
  els.settingsStatus.innerHTML = '<span class="status-dot" aria-hidden="true"></span> ' +
    (signedIn ? 'Connected to ' + state.baseUrl : state.connectionState === 'invalid' ? 'Saved token is no longer valid.' : 'Not connected.');
  els.settingsStatus.closest('.account-card').classList.toggle('connected', signedIn);
  els.disconnectBtn.classList.toggle('hidden', !state.token);
  renderAvatar();
  if (els.views.feed.classList.contains('active')) loadFeed();
}

async function validateConnection() {
  if (!state.token) {
    state.user = null;
    state.connectionState = 'disconnected';
    renderAuthUI();
    return false;
  }
  state.connectionState = 'checking';
  renderAuthUI();
  try {
    const result = await apiFetch(S.API.me, { method: 'GET' });
    state.user = result && result.user ? result.user : null;
    state.connectionState = state.user ? 'connected' : 'invalid';
  } catch (err) {
    state.user = null;
    state.connectionState = 'invalid';
  }
  renderAuthUI();
  return state.connectionState === 'connected';
}

async function openConnectPage() {
  const nonce = crypto.randomUUID();
  await chrome.storage.local.set({ connectNonce: nonce });
  state.connectionState = 'checking';
  renderAuthUI();
  const url = state.baseUrl + S.API.connect + '?extension_nonce=' + encodeURIComponent(nonce);
  chrome.tabs.create({ url });
}

/* ------------------------------ content script bridge ------------------------------ */

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs[0] ? tabs[0] : null;
}

async function sendToTab(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (err) {
    // Content script not there (fresh install, restricted page) — inject and retry once.
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (err2) {
      return null;
    }
  }
}

/* ------------------------------ capture flow ------------------------------ */

function setType(type, fromUser) {
  state.type = type;
  if (fromUser) state.typeOverridden = true;
  for (const pill of els.pills) pill.classList.toggle('active', pill.dataset.type === type);
  const isArticle = type === 'article';
  els.modeArticle.classList.toggle('hidden', !isArticle);
  els.modeMedia.classList.toggle('hidden', isArticle);
  els.mediaHint.textContent =
    type === 'video'
      ? 'Tip: press “Now” while the video plays to stamp the current time.'
      : 'Tip: press “Now” while the audio plays to stamp the current time.';
  updateDurationIndicator();
}

function applyCapture(tab, meta, media, selection) {
  state.tabId = tab.id;
  state.pageUrl = (meta && (meta.canonical || meta.url)) || tab.url || '';
  state.pageTitle = (meta && meta.title) || tab.title || '';
  state.mediaUrl = media && media.found && !media.isYouTube ? (media.src || '') : '';

  els.sourceUrl.textContent = state.pageUrl || 'Unknown page';
  els.sourceUrl.title = state.pageUrl;
  try {
    const host = new URL(state.pageUrl).hostname.replace(/^www\./, '');
    els.sourceGlyph.textContent = (host.charAt(0) || 'A').toUpperCase();
  } catch (err) {
    els.sourceGlyph.textContent = 'A';
  }

  const detected = S.detectAnnotationType(tab.url || state.pageUrl, media);
  if (!state.typeOverridden) setType(detected, false);
  else setType(state.type, false);

  // Auto-fill editable fields (don't clobber text the user already typed).
  if (!els.title.value) els.title.value = state.pageTitle;
  if (!els.siteName.value) els.siteName.value = (meta && meta.siteName) || '';
  if (!els.author.value && meta && meta.author) els.author.value = meta.author;
  if (!els.published.value && meta && meta.publishedAt) els.published.value = meta.publishedAt;

  if (selection && selection.text && !els.quote.value) {
    els.quote.value = selection.text;
  }

  // Media note + default range.
  if (media && media.found) {
    const dur = media.duration > 0 ? ' · ' + S.formatTime(media.duration) + ' total' : '';
    els.sourceNote.textContent =
      (media.kind === 'video' ? 'Video' : 'Audio') + ' detected' + dur +
      (media.isYouTube ? ' · YouTube' : '');
    if (!els.startTime.value) els.startTime.value = '0:00';
    if (!els.endTime.value) {
      const end = media.duration > 0 ? Math.min(S.MAX_CLIP_SECONDS, media.duration) : S.MAX_CLIP_SECONDS;
      els.endTime.value = S.formatTime(end);
    }
  } else if (state.type !== 'article') {
    els.sourceNote.textContent = 'No playable media found on this page.';
  } else {
    els.sourceNote.textContent = meta && meta.siteName ? meta.siteName : '';
  }
  updateDurationIndicator();
}

async function refreshCapture() {
  if (!state.token) return;
  els.refreshSource.classList.add('spinning');
  state.typeOverridden = false;
  try {
    const tab = await getActiveTab();
    if (!tab || !tab.id || !/^https?:/.test(tab.url || '')) {
      els.sourceUrl.textContent = 'This page can’t be annotated';
      els.sourceNote.textContent = 'Open a regular web page (http/https) and try again.';
      return;
    }
    const [meta, media, selection] = await Promise.all([
      sendToTab(tab.id, { type: 'GET_PAGE_META' }),
      sendToTab(tab.id, { type: 'GET_MEDIA_STATE' }),
      sendToTab(tab.id, { type: 'GET_SELECTION' }),
    ]);
    applyCapture(tab, meta, media, selection);
  } finally {
    els.refreshSource.classList.remove('spinning');
  }
}

async function grabSelection() {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  const selection = await sendToTab(tab.id, { type: 'GET_SELECTION' });
  if (selection && selection.text) {
    els.quote.value = selection.text;
    els.quote.focus();
  } else {
    els.quote.placeholder = 'No selection found — highlight some text on the page first.';
  }
}

async function stampTime(field) {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  const media = await sendToTab(tab.id, { type: 'GET_MEDIA_STATE' });
  if (media && media.found) {
    field.value = S.formatTime(media.currentTime);
    updateDurationIndicator();
  }
}

/* ------------------------------ 90s validation ------------------------------ */

function currentRange() {
  return {
    start: S.parseTimeInput(els.startTime.value),
    end: S.parseTimeInput(els.endTime.value),
  };
}

function updateDurationIndicator() {
  if (state.type === 'article') return true;
  const { start, end } = currentRange();
  if (start == null && end == null) {
    els.clipDuration.textContent = 'Clip: —';
    els.clipDuration.className = 'clip-duration';
    return false;
  }
  const v = S.validateClipRange(start, end);
  if (v.ok) {
    els.clipDuration.textContent = 'Clip: ' + Math.round(v.duration) + 's / 90s';
    els.clipDuration.className = 'clip-duration ok';
    return true;
  }
  els.clipDuration.textContent =
    v.duration != null && v.duration > 0
      ? 'Clip: ' + Math.round(v.duration) + 's — too long'
      : 'Clip: invalid range';
  els.clipDuration.className = 'clip-duration over';
  return false;
}

function clampRange() {
  const { start, end } = currentRange();
  const c = S.clampToMax(start == null ? 0 : start, end);
  els.startTime.value = S.formatTime(c.startSec);
  els.endTime.value = S.formatTime(c.endSec);
  updateDurationIndicator();
}

/* ------------------------------ recorder ------------------------------ */

function updateRecTimer() {
  const secs = (Date.now() - state.recorder.startedAt) / 1000;
  els.recTimer.textContent = S.formatTime(secs);
}

function stopRecordingTracks() {
  if (state.recorder.stream) {
    for (const track of state.recorder.stream.getTracks()) track.stop();
    state.recorder.stream = null;
  }
}

async function startRecording() {
  showError(els.recError, '');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    state.recorder.stream = stream;
    state.recorder.mediaRecorder = mr;
    state.recorder.chunks = [];
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) state.recorder.chunks.push(e.data);
    };
    mr.onstop = () => {
      stopRecordingTracks();
      clearInterval(state.recorder.timerId);
      const blob = new Blob(state.recorder.chunks, { type: mr.mimeType || 'audio/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        state.recorder.dataUrl = reader.result;
        els.recAudio.src = reader.result;
        els.recPlayback.classList.remove('hidden');
      };
      reader.readAsDataURL(blob);
      els.recordBtn.classList.remove('recording');
      els.recordLabel.textContent = 'Re-record';
      els.recTimer.classList.add('hidden');
      els.submitBtn.disabled = false;
    };
    mr.start();
    state.recorder.startedAt = Date.now();
    els.recTimer.textContent = '0:00';
    els.recTimer.classList.remove('hidden');
    state.recorder.timerId = setInterval(updateRecTimer, 500);
    els.recordBtn.classList.add('recording');
    els.recordLabel.textContent = 'Stop recording';
    els.recPlayback.classList.add('hidden');
    state.recorder.dataUrl = null;
    els.submitBtn.disabled = true; // don't submit mid-recording
  } catch (err) {
    showError(
      els.recError,
      'Microphone unavailable: ' + (err && err.message ? err.message : String(err))
    );
  }
}

function stopRecording() {
  const mr = state.recorder.mediaRecorder;
  if (mr && mr.state !== 'inactive') mr.stop();
  state.recorder.mediaRecorder = null;
}

function discardRecording() {
  state.recorder.dataUrl = null;
  state.recorder.chunks = [];
  els.recAudio.removeAttribute('src');
  els.recPlayback.classList.add('hidden');
  els.recordLabel.textContent = 'Record audio note';
}

/* ------------------------------ submit ------------------------------ */

function buildPayload() {
  const payload = {
    type: state.type,
    sourceUrl: state.pageUrl,
    title: els.title.value.trim() || state.pageTitle || 'Untitled',
  };
  const siteName = els.siteName.value.trim();
  const author = els.author.value.trim();
  const published = els.published.value.trim();
  const comment = els.comment.value.trim();
  if (siteName) payload.siteName = siteName;
  if (author) payload.author = author;
  if (published) payload.publishedAt = published;
  if (comment) payload.comment = comment;

  if (state.type === 'article') {
    payload.quote = els.quote.value.trim();
  } else {
    const { start, end } = currentRange();
    payload.startSec = start;
    payload.endSec = end;
    if (state.mediaUrl) payload.mediaUrl = state.mediaUrl;
  }
  return payload;
}

function validatePayload(payload) {
  if (!payload.sourceUrl) return 'No source page detected — press the refresh button.';
  if (payload.type === 'article') {
    if (!payload.quote) return 'Grab or paste a passage to annotate.';
  } else {
    const v = S.validateClipRange(payload.startSec, payload.endSec);
    if (!v.ok) return v.error;
  }
  if (!payload.comment && !state.recorder.dataUrl) {
    return 'Add a comment or record an audio note.';
  }
  return null;
}

function showSuccess(id) {
  els.clipMain.classList.add('hidden');
  els.clipSuccess.classList.remove('hidden');
  els.successLink.href = state.baseUrl + S.API.annotationPath(id);
}

async function submitAnnotation(event) {
  event.preventDefault();
  showError(els.formError, '');

  const payload = buildPayload();
  const invalid = validatePayload(payload);
  if (invalid) {
    showError(els.formError, invalid);
    return;
  }

  setBusy(true);
  try {
    if (state.recorder.dataUrl) {
      const upload = await apiFetch(S.API.upload, {
        method: 'POST',
        body: JSON.stringify({ dataUrl: state.recorder.dataUrl }),
      });
      if (upload && upload.url) payload.commentAudioUrl = upload.url;
    }
    const result = await apiFetch(S.API.annotations, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const id = result && result.annotation && result.annotation.id;
    if (!id) throw new Error('Unexpected response from server.');
    showSuccess(id);
  } catch (err) {
    showError(els.formError, err && err.message ? err.message : String(err));
  } finally {
    setBusy(false);
  }
}

function resetClipForm() {
  els.clipSuccess.classList.add('hidden');
  els.clipMain.classList.remove('hidden');
  els.quote.value = '';
  els.comment.value = '';
  els.startTime.value = '';
  els.endTime.value = '';
  discardRecording();
  showError(els.formError, '');
  state.typeOverridden = false;
  refreshCapture();
}

/* ------------------------------ feed ------------------------------ */

function feedCard(a) {
  const card = document.createElement('article');
  card.className = 'feed-card';

  const top = document.createElement('div');
  top.className = 'feed-card-top';
  const avatar = document.createElement('span');
  avatar.className = 'feed-avatar';
  const authorName = a.author && typeof a.author === 'object'
    ? (a.author.name || a.author.username || '')
    : (a.authorName || '');
  avatar.textContent = (authorName || 'A').charAt(0).toUpperCase();
  const badge = document.createElement('span');
  const type = a.type || 'article';
  badge.className = 'badge badge-' + type;
  badge.textContent = type;
  const title = document.createElement('span');
  title.className = 'feed-card-title';
  title.textContent = a.title || 'Untitled';
  top.append(avatar, badge, title);
  card.appendChild(top);

  if (a.quote) {
    const quote = document.createElement('p');
    quote.className = 'feed-card-quote';
    quote.textContent = a.quote;
    card.appendChild(quote);
  }
  if (a.comment) {
    const comment = document.createElement('p');
    comment.className = 'feed-card-comment';
    comment.textContent = a.comment;
    card.appendChild(comment);
  }

  const meta = document.createElement('div');
  meta.className = 'feed-card-meta';
  const who = document.createElement('span');
  const bits = [authorName || a.siteName || '', relativeTime(a.createdAt || a.publishedAt)];
  who.textContent = bits.filter(Boolean).join(' · ') || 'annotated';
  const open = document.createElement('a');
  open.className = 'feed-open';
  open.href = state.baseUrl + S.API.annotationPath(a.id);
  open.target = '_blank';
  open.rel = 'noopener';
  open.textContent = 'Open ↗';
  meta.append(who, open);
  card.appendChild(meta);
  return card;
}

async function loadFeed() {
  els.feedStatus.textContent = 'Loading…';
  els.feedStatus.classList.remove('hidden');
  els.feedList.textContent = '';
  try {
    const data = await apiFetch(S.API.feed, { method: 'GET' });
    const items = Array.isArray(data) ? data : data.annotations || data.items || data.feed || [];
    if (items.length === 0) {
      els.feedStatus.textContent = 'Nothing here yet — clip your first annotation.';
      return;
    }
    els.feedStatus.classList.add('hidden');
    for (const a of items) els.feedList.appendChild(feedCard(a));
  } catch (err) {
    els.feedStatus.textContent =
      'Couldn’t load the feed: ' + (err && err.message ? err.message : String(err));
  }
}

/* ------------------------------ context-menu prefill ------------------------------ */

async function consumePendingSelection() {
  const stored = await chrome.storage.local.get('pendingSelection');
  const pending = stored.pendingSelection;
  if (!pending || !pending.text) return;
  // Only honor fresh stashes (2 minutes).
  if (Date.now() - (pending.ts || 0) > 2 * 60 * 1000) {
    chrome.storage.local.remove('pendingSelection');
    return;
  }
  chrome.storage.local.remove('pendingSelection');
  switchView('clip');
  setType('article', true);
  els.quote.value = pending.text;
  if (pending.title) els.title.value = pending.title;
}

/* ------------------------------ wiring ------------------------------ */

function wireEvents() {
  for (const tab of els.tabs) {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  }
  for (const pill of els.pills) {
    pill.addEventListener('click', () => setType(pill.dataset.type, true));
  }

  els.refreshSource.addEventListener('click', refreshCapture);
  els.grabSelection.addEventListener('click', grabSelection);
  els.startNow.addEventListener('click', () => stampTime(els.startTime));
  els.endNow.addEventListener('click', () => stampTime(els.endTime));
  els.clamp90.addEventListener('click', clampRange);
  els.startTime.addEventListener('input', updateDurationIndicator);
  els.endTime.addEventListener('input', updateDurationIndicator);

  els.recordBtn.addEventListener('click', () => {
    if (state.recorder.mediaRecorder) stopRecording();
    else startRecording();
  });
  els.recDiscard.addEventListener('click', discardRecording);

  els.form.addEventListener('submit', submitAnnotation);
  els.clipAnother.addEventListener('click', resetClipForm);

  els.feedRefresh.addEventListener('click', loadFeed);

  els.saveSettings.addEventListener('click', saveSettings);
  els.tokenShow.addEventListener('click', () => {
    const showing = els.apiToken.type === 'text';
    els.apiToken.type = showing ? 'password' : 'text';
    els.tokenShow.textContent = showing ? 'Show' : 'Hide';
  });
  els.connectBtnClip.addEventListener('click', openConnectPage);
  els.connectBtnFeed.addEventListener('click', openConnectPage);
  els.connectBtnSettings.addEventListener('click', openConnectPage);
  els.connectBtnManual.addEventListener('click', openConnectPage);
  els.accountChip.addEventListener('click', () => switchView('settings'));
  els.disconnectBtn.addEventListener('click', async () => {
    state.token = '';
    state.user = null;
    state.connectionState = 'disconnected';
    els.apiToken.value = '';
    await chrome.storage.local.remove('apiToken');
    renderAuthUI();
  });

  // Live prefill when the context menu fires while the panel is open.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.pendingSelection && changes.pendingSelection.newValue) {
      consumePendingSelection();
    }
    if (area === 'local' && (changes.apiToken || changes.baseUrl)) {
      loadSettings().then(() => {
        if (state.connectionState === 'connected') {
          switchView('clip');
          refreshCapture();
        }
      });
    }
  });

  // Re-detect when the user switches tabs while the panel is open.
  chrome.tabs.onActivated.addListener(() => {
    if (els.views.clip.classList.contains('active')) refreshCapture();
  });
}

async function init() {
  wireEvents();
  await loadSettings();
  await consumePendingSelection();
  if (state.connectionState === 'connected') refreshCapture();
}

document.addEventListener('DOMContentLoaded', init);
