"use client";

// The approval layer. Every change — from anyone, including admins — arrives here as a pull
// request with a real diff before it can reach the live site.
import { useCallback, useEffect, useState } from "react";
import { api, type DiffFile, type QueueItem } from "@/lib/studio/api";

const CHECK_LABEL: Record<QueueItem["checks"], { text: string; className: string }> = {
  success: { text: "validated", className: "text-brand-strong" },
  failure: { text: "validation failed", className: "text-brand-orange" },
  pending: { text: "validating…", className: "text-text-faint" },
  unknown: { text: "unknown", className: "text-text-faint" },
};

export function ReviewQueue({ canApprove }: { canApprove: boolean }) {
  const [items, setItems] = useState<QueueItem[]>();
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState<number>();
  const [files, setFiles] = useState<DiffFile[]>();
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems((await api.queue()).queue);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the queue.");
    }
  }, []);

  useEffect(() => {
    // Fetching remote state on mount and polling it is the case effects exist for; the
    // setState happens in an async continuation, not synchronously during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    // Poll while the tab is open so a submission's CI result appears without a manual reload.
    const t = setInterval(() => void refresh(), 20000);
    return () => clearInterval(t);
  }, [refresh]);

  async function showDiff(n: number) {
    if (open === n) {
      setOpen(undefined);
      return;
    }
    setOpen(n);
    setFiles(undefined);
    try {
      setFiles((await api.queueFiles(n)).files);
    } catch {
      setFiles([]);
    }
  }

  async function act(n: number, action: "approve" | "reject") {
    const reason =
      action === "reject" ? (prompt("Why is this being returned? The submitter will see this.") ?? "") : "";
    if (action === "reject" && !reason.trim()) return;
    setBusy(true);
    try {
      if (action === "approve") await api.approve(n);
      else await api.reject(n, reason);
      setOpen(undefined);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="text-sm text-brand-orange">{error}</p>;
  if (!items) return <p className="text-sm text-text-faint">Loading queue…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-border py-12 text-center">
        <p className="text-sm font-medium text-foreground">Nothing waiting for review</p>
        <p className="mt-1 text-[12.5px] text-text-faint">Submissions appear here the moment they are made.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const check = CHECK_LABEL[item.checks];
        return (
          <div key={item.number} className="rounded-sm border border-border">
            <div className="flex flex-wrap items-start justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 font-mono text-[11px] text-text-faint">
                  #{item.number} · {new Date(item.createdAt).toLocaleString()} ·{" "}
                  <span className={check.className}>{check.text}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => void showDiff(item.number)} className="font-mono text-[11px] text-text-faint hover:text-foreground">
                  {open === item.number ? "Hide changes" : "View changes"}
                </button>
                {canApprove && (
                  <>
                    <button
                      onClick={() => void act(item.number, "approve")}
                      disabled={busy || item.checks === "failure" || item.checks === "pending"}
                      title={
                        item.checks === "failure"
                          ? "Validation is failing — this cannot be approved"
                          : item.checks === "pending"
                            ? "Validation is still running"
                            : undefined
                      }
                      className="rounded-sm bg-invert-bg px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-invert-fg uppercase disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => void act(item.number, "reject")}
                      disabled={busy}
                      className="font-mono text-[11px] text-brand-orange hover:underline disabled:opacity-40"
                    >
                      Return
                    </button>
                  </>
                )}
              </div>
            </div>

            {open === item.number && (
              <div className="border-t border-hairline bg-bg-alt p-3">
                {!files ? (
                  <p className="text-[12.5px] text-text-faint">Loading diff…</p>
                ) : files.length === 0 ? (
                  <p className="text-[12.5px] text-text-faint">No diff available.</p>
                ) : (
                  files.map((f) => (
                    <div key={f.filename} className="mb-3 last:mb-0">
                      <p className="font-mono text-[11px] text-text-faint">
                        {f.status} · {f.filename} (+{f.additions}/−{f.deletions})
                      </p>
                      {f.patch && (
                        <pre className="mt-1 max-h-72 overflow-auto rounded-sm border border-hairline bg-background p-2 font-mono text-[11.5px] leading-relaxed">
                          {f.patch.split("\n").map((line, i) => (
                            <div
                              key={i}
                              className={
                                line.startsWith("+") && !line.startsWith("+++")
                                  ? "text-brand-strong"
                                  : line.startsWith("-") && !line.startsWith("---")
                                    ? "text-brand-orange"
                                    : "text-text-faint"
                              }
                            >
                              {line || " "}
                            </div>
                          ))}
                        </pre>
                      )}
                    </div>
                  ))
                )}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-brand-strong hover:underline"
                >
                  Open on GitHub ↗
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
