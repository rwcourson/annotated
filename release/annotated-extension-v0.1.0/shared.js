/* annotated — shared pure logic.
 * Loaded by sidepanel.html as a classic script (sets globalThis.AnnotatedShared)
 * and evaluated by test/smoke.mjs in a VM sandbox. No chrome/* APIs in here.
 */
(function (root) {
  'use strict';

  var MAX_CLIP_SECONDS = 90;
  var DEFAULT_BASE_URL = "https://annotated-social.vercel.app";

  // Documented API contract with the web app.
  var API = {
    upload: '/api/upload', // POST { dataUrl } -> { url }
    annotations: '/api/annotations', // POST annotation JSON, Authorization: Bearer <token>
    feed: '/api/feed', // GET (public)
    me: '/api/extension/me', // GET bearer token -> { user }
    connect: '/connect', // web page that shows the API token to copy
    annotationPath: function (id) { return '/a/' + id; },
  };

  // "1:30" -> 90, "90" -> 90, "1:02:03" -> 3723, "0:05.5" -> 5.5. Invalid -> null.
  function parseTimeInput(str) {
    if (str == null) return null;
    if (typeof str === 'number') return isFinite(str) && str >= 0 ? str : null;
    var s = String(str).trim();
    if (s === '') return null;
    if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    var m = s.match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:\.(\d+))?$/);
    if (!m) return null;
    var h = m[1] ? parseInt(m[1], 10) : 0;
    var min = parseInt(m[2], 10);
    var sec = parseInt(m[3], 10);
    if (min > 59 || sec > 59) return null;
    if (!m[1] && min > 59) return null;
    var frac = m[4] ? parseFloat('0.' + m[4]) : 0;
    return h * 3600 + min * 60 + sec + frac;
  }

  // 90 -> "1:30", 3723 -> "1:02:03", 5.5 -> "0:05"
  function formatTime(totalSeconds) {
    if (totalSeconds == null || !isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
    var s = Math.floor(totalSeconds);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    var ss = String(sec).padStart(2, '0');
    if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + ss;
    return m + ':' + ss;
  }

  // Enforce the 90-second clip window.
  function validateClipRange(startSec, endSec) {
    if (startSec == null || endSec == null || !isFinite(startSec) || !isFinite(endSec)) {
      return { ok: false, duration: null, error: 'Set a start and end time.' };
    }
    if (startSec < 0) return { ok: false, duration: null, error: 'Start time cannot be negative.' };
    if (endSec <= startSec) {
      return { ok: false, duration: endSec - startSec, error: 'End must be after start.' };
    }
    var duration = endSec - startSec;
    if (duration > MAX_CLIP_SECONDS) {
      return { ok: false, duration: duration, error: 'Clips are limited to 90 seconds.' };
    }
    return { ok: true, duration: duration, error: null };
  }

  // Clamp a range so it never exceeds the max clip length (anchored at start).
  function clampToMax(startSec, endSec) {
    if (startSec == null || !isFinite(startSec) || startSec < 0) startSec = 0;
    if (endSec == null || !isFinite(endSec) || endSec <= startSec) {
      endSec = startSec + MAX_CLIP_SECONDS;
    }
    if (endSec - startSec > MAX_CLIP_SECONDS) endSec = startSec + MAX_CLIP_SECONDS;
    return { startSec: startSec, endSec: endSec };
  }

  // Decide the annotation type for a page.
  // media is the GET_MEDIA_STATE result ({ found, kind, isYouTube, ... }) or null.
  function detectAnnotationType(url, media) {
    var isYouTubeWatch = false;
    try {
      var u = new URL(url);
      isYouTubeWatch =
        /(^|\.)youtube\.com$/.test(u.hostname) && u.pathname === '/watch' && !!u.searchParams.get('v');
      if (/(^|\.)youtu\.be$/.test(u.hostname)) isYouTubeWatch = true;
    } catch (e) { /* ignore */ }
    if (isYouTubeWatch) return 'video';
    if (media && media.found) {
      if (media.kind === 'video') return 'video';
      if (media.kind === 'audio') return 'audio';
    }
    return 'article';
  }

  function normalizeBaseUrl(url) {
    var s = (url || '').trim();
    if (s === '') s = DEFAULT_BASE_URL;
    return s.replace(/\/+$/, '');
  }

  var AnnotatedShared = {
    MAX_CLIP_SECONDS: MAX_CLIP_SECONDS,
    DEFAULT_BASE_URL: DEFAULT_BASE_URL,
    API: API,
    parseTimeInput: parseTimeInput,
    formatTime: formatTime,
    validateClipRange: validateClipRange,
    clampToMax: clampToMax,
    detectAnnotationType: detectAnnotationType,
    normalizeBaseUrl: normalizeBaseUrl,
  };

  root.AnnotatedShared = AnnotatedShared;
  if (typeof module !== 'undefined' && module.exports) module.exports = AnnotatedShared;
})(typeof globalThis !== 'undefined' ? globalThis : this);
