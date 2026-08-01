/* annotated — service worker.
 * - Opens the side panel when the toolbar action is clicked.
 * - "Annotate selection with annotated" context-menu item on text selections:
 *   stashes the selection for the panel to pre-fill, then opens the panel.
 * - Minimal message relay for the panel (PING / OPEN_PANEL).
 */
'use strict';

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.warn('[annotated] setPanelBehavior failed:', err));

const CONTEXT_MENU_ID = 'annotated-selection';

function registerContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Annotate selection with annotated',
      contexts: ['selection'],
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  registerContextMenu();
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => {});
});

chrome.runtime.onStartup.addListener(registerContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !tab) return;
  const pending = {
    text: (info.selectionText || '').trim(),
    url: tab.url || '',
    title: tab.title || '',
    ts: Date.now(),
  };
  chrome.storage.local.set({ pendingSelection: pending }, () => {
    if (tab.windowId != null) {
      chrome.sidePanel.open({ windowId: tab.windowId }).catch((err) => {
        console.warn('[annotated] sidePanel.open failed:', err);
      });
    }
  });
});

// Message relay — the panel can ask the worker to open the panel or health-check.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || typeof msg.type !== 'string') return undefined;
  if (msg.type === 'PING') {
    sendResponse({ ok: true, from: 'background' });
    return undefined;
  }
  if (msg.type === 'OPEN_PANEL') {
    const windowId = sender.tab ? sender.tab.windowId : msg.windowId;
    if (windowId != null) {
      chrome.sidePanel
        .open({ windowId })
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, error: String(err) }));
      return true; // async sendResponse
    }
    sendResponse({ ok: false, error: 'no windowId' });
    return undefined;
  }
  if (msg.type === 'COMPLETE_ACCOUNT_CONNECTION') {
    (async () => {
      try {
        const senderUrl = new URL(sender.tab && sender.tab.url ? sender.tab.url : '');
        const stored = await chrome.storage.local.get('connectNonce');
        const nonceMatches =
          typeof msg.nonce === 'string' &&
          msg.nonce.length >= 16 &&
          stored.connectNonce === msg.nonce;
        const tokenLooksValid =
          typeof msg.token === 'string' &&
          /^[A-Za-z0-9_-]{16,}$/.test(msg.token);
        const isConnectPage = /^\/connect\/?$/.test(senderUrl.pathname);

        if (!nonceMatches || !tokenLooksValid || !isConnectPage) {
          sendResponse({ ok: false, error: 'Connection request did not match.' });
          return;
        }

        await chrome.storage.local.set({
          apiToken: msg.token,
          baseUrl: senderUrl.origin,
          connectedAt: new Date().toISOString(),
        });
        await chrome.storage.local.remove('connectNonce');
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }
  return undefined;
});
