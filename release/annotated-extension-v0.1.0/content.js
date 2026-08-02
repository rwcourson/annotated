/* annotated — content script.
 * Registered for <all_urls> in the manifest and also injectable on demand via
 * chrome.scripting (guarded against double-injection). Answers panel queries:
 *   PING             -> { ok: true }
 *   GET_SELECTION    -> { text, context }
 *   GET_PAGE_META    -> { title, siteName, description, image, author, publishedAt, canonical, url }
 *   GET_MEDIA_STATE  -> { found, kind, currentTime, duration, paused, src, isYouTube, videoId }
 */
(() => {
  'use strict';
  if (window.__annotatedContentLoaded) return;
  window.__annotatedContentLoaded = true;

  const $q = (sel) => document.querySelector(sel);
  const metaContent = (sel) => {
    const el = $q(sel);
    return el ? (el.getAttribute('content') || '').trim() : '';
  };

  function getJsonLdNodes() {
    const nodes = [];
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (!item || typeof item !== 'object') continue;
          const group = Array.isArray(item['@graph']) ? item['@graph'] : [item];
          for (const node of group) {
            if (node && typeof node === 'object') nodes.push(node);
          }
        }
      } catch (e) { /* malformed JSON-LD — ignore */ }
    }
    return nodes;
  }

  function getSelectionInfo() {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    let context = '';
    if (text && sel.rangeCount > 0) {
      const container = sel.getRangeAt(0).commonAncestorContainer;
      const el = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
      const block = el && el.closest
        ? el.closest('p, blockquote, li, figure, article, section')
        : null;
      if (block && block.innerText) context = block.innerText.trim().slice(0, 800);
    }
    return { text, context };
  }

  function getPageMeta() {
    const ldNodes = getJsonLdNodes();
    const articleNode = ldNodes.find((n) =>
      /Article|NewsArticle|BlogPosting|Report/.test(String(n['@type'] || ''))
    );
    const mediaNode = ldNodes.find((n) =>
      /VideoObject|AudioObject|PodcastEpisode/.test(String(n['@type'] || ''))
    );
    const node = articleNode || mediaNode || {};

    const authorFromLd = (() => {
      const a = node.author;
      if (!a) return '';
      if (typeof a === 'string') return a;
      if (Array.isArray(a)) return a.map((x) => (x && x.name) || '').filter(Boolean).join(', ');
      return a.name || '';
    })();

    const timeEl = $q('time[datetime]');
    return {
      title: metaContent('meta[property="og:title"]') || (document.title || '').trim(),
      siteName: metaContent('meta[property="og:site_name"]'),
      description:
        metaContent('meta[property="og:description"]') || metaContent('meta[name="description"]'),
      image: metaContent('meta[property="og:image"]'),
      author:
        metaContent('meta[name="author"]') ||
        metaContent('meta[property="article:author"]') ||
        authorFromLd,
      publishedAt:
        metaContent('meta[property="article:published_time"]') ||
        (timeEl ? timeEl.getAttribute('datetime') || '' : '') ||
        node.datePublished ||
        node.uploadDate ||
        '',
      canonical: ($q('link[rel="canonical"]') || {}).href || '',
      url: location.href,
    };
  }

  function getMediaState() {
    const isYouTube = /(^|\.)youtube\.com$/.test(location.hostname);
    let videoId = null;
    if (isYouTube) {
      try {
        videoId = new URLSearchParams(location.search).get('v');
      } catch (e) { /* ignore */ }
    }

    let el = null;
    if (isYouTube) {
      el =
        document.querySelector('video.html5-main-video') ||
        document.querySelector('#movie_player video') ||
        document.querySelector('video');
    }
    if (!el) {
      const media = Array.from(document.querySelectorAll('audio, video'));
      el =
        media.find((m) => !m.paused && !m.ended && m.currentTime > 0) ||
        media.find((m) => m.duration > 0 && m.readyState > 0) ||
        media.find((m) => m.duration > 0) ||
        media[0] ||
        null;
    }
    if (!el) return { found: false, isYouTube, videoId };

    const mediaSrc = el.currentSrc || el.src || location.href;
    let mediaPath = '';
    try {
      mediaPath = new URL(mediaSrc, location.href).pathname.toLowerCase();
    } catch (e) { /* retain empty path */ }
    const isAudioResource = /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac)$/.test(mediaPath);

    return {
      found: true,
      kind: el.tagName === 'AUDIO' || isAudioResource ? 'audio' : 'video',
      currentTime: el.currentTime || 0,
      duration: el.duration && isFinite(el.duration) ? el.duration : 0,
      paused: el.paused,
      src: el.currentSrc || el.src || '',
      isYouTube,
      videoId,
    };
  }

  // Secure one-click account handoff. The side panel creates a one-time nonce
  // before opening /connect; the service worker accepts a token only when the
  // nonce and sender page both match that pending request.
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || data.type !== 'ANNOTATED_EXTENSION_CONNECT') return;
    if (typeof data.nonce !== 'string' || typeof data.token !== 'string') return;

    chrome.runtime.sendMessage(
      {
        type: 'COMPLETE_ACCOUNT_CONNECTION',
        nonce: data.nonce,
        token: data.token,
      },
      (response) => {
        window.postMessage(
          {
            type: 'ANNOTATED_EXTENSION_CONNECT_RESULT',
            nonce: data.nonce,
            ok: !!(response && response.ok),
          },
          window.location.origin
        );
      }
    );
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || typeof msg.type !== 'string') return undefined;
    switch (msg.type) {
      case 'PING':
        sendResponse({ ok: true, from: 'content' });
        return undefined;
      case 'GET_SELECTION':
        sendResponse(getSelectionInfo());
        return undefined;
      case 'GET_PAGE_META':
        sendResponse(getPageMeta());
        return undefined;
      case 'GET_MEDIA_STATE':
        sendResponse(getMediaState());
        return undefined;
      default:
        return undefined;
    }
  });
})();
