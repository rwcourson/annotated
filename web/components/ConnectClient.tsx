"use client";

import { useEffect, useState } from "react";
import CopyButton from "./CopyButton";

type HandoffState = "idle" | "connecting" | "connected" | "fallback";

export default function ConnectClient({
  extensionNonce,
}: {
  extensionNonce?: string;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [handoff, setHandoff] = useState<HandoffState>(
    extensionNonce ? "connecting" : "idle"
  );

  useEffect(() => {
    fetch("/api/extension/token")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setToken(d.token))
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!token || !extensionNonce) return;

    let attempts = 0;
    const payload = {
      type: "ANNOTATED_EXTENSION_CONNECT",
      nonce: extensionNonce,
      token,
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window || event.origin !== window.location.origin) return;
      if (
        event.data?.type === "ANNOTATED_EXTENSION_CONNECT_RESULT" &&
        event.data?.nonce === extensionNonce
      ) {
        if (event.data.ok) {
          setHandoff("connected");
          window.clearInterval(interval);
          window.clearTimeout(timeout);
        }
      }
    };

    window.addEventListener("message", onMessage);
    window.postMessage(payload, window.location.origin);
    const interval = window.setInterval(() => {
      attempts += 1;
      if (attempts < 12) window.postMessage(payload, window.location.origin);
    }, 400);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setHandoff((current) => current === "connected" ? current : "fallback");
    }, 5200);

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [extensionNonce, token]);

  return (
    <div className="surface overflow-hidden">
      <div className="border-b hairline bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${handoff === "connected" ? "bg-[#4a8d55]" : handoff === "fallback" || error ? "bg-[var(--action)]" : "animate-pulse bg-[var(--cobalt)]"}`} />
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[var(--ink)]">
              {handoff === "connected"
                ? "Extension connected"
                : extensionNonce
                  ? "Connecting your sidebar…"
                  : "Extension access"}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--muted-ink)]">
              {handoff === "connected"
                ? "You can return to the side panel and start clipping."
                : handoff === "fallback"
                  ? "Automatic handoff was unavailable. Use the recovery token below."
                  : extensionNonce
                    ? "Keep this tab open for a moment. No copy and paste needed."
                    : "Open this page from the Chrome sidebar for one-click setup."}
            </p>
          </div>
        </div>
      </div>

      {token ? (
        <div className={`p-6 sm:p-7 ${handoff === "connected" ? "hidden" : "block"}`}>
          <p className="label">Recovery token</p>
          <div className="mt-2 flex items-center gap-3">
            <code className="min-w-0 flex-1 truncate rounded-xl bg-[var(--soft)] px-4 py-3 font-mono text-sm text-[var(--ink)]">
              {token}
            </code>
            <CopyButton text={token} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--muted-ink)]">
            Only paste this into the extension&apos;s Manual setup section. Treat it like a password.
          </p>
        </div>
      ) : error ? (
        <p className="p-6 text-sm text-red-600">
          Couldn&apos;t load your token — try refreshing.
        </p>
      ) : (
        <div className="m-6 h-[46px] animate-pulse rounded-xl bg-[var(--soft)]" />
      )}
    </div>
  );
}
