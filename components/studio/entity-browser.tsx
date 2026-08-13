"use client";

// Browse and edit one entity type. The form is generated from the Zod schema, so this file
// contains no per-entity field knowledge at all — adding a content type needs an entry in
// lib/studio/entities.ts and nothing here.
import { useMemo, useState } from "react";
import { api, type Snapshot } from "@/lib/studio/api";
import {
  assetPathFor,
  filePathFor,
  repoAssetPath,
  slugify,
  UNRENDERED_ENTITIES,
  type EntityDef,
} from "@/lib/studio/entities";
import {
  fieldsOf,
  unionMember,
  unionValues,
  validateRecord,
  type FieldSpec,
} from "@/lib/studio/schema-fields";
import { prepareImage, serializeRecord } from "@/lib/studio/records";
import { fetchByDoi } from "@/lib/studio/crossref";
import { FieldInput } from "./field-input";
import type { ZodType } from "zod";

type Rec = Record<string, unknown>;

/** Which snapshot list backs each reference field, so users pick ids instead of typing them. */
function buildSuggestions(snap: Snapshot) {
  const people = snap.content.people.map((p) => ({ id: p.id, label: p.name }));
  const themes = snap.content.researchThemes.map((t) => ({ id: t.id, label: t.title }));
  const institutions = snap.content.institutions.map((i) => ({ id: i.id, label: i.shortName ?? i.name }));
  const publications = snap.content.publications
    .slice(0, 400)
    .map((p) => ({ id: p.id, label: `${p.title.slice(0, 60)} (${p.year ?? "n.d."})` }));
  return {
    personId: people,
    authorId: people,
    contributors: people,
    themeIds: themes,
    institutionId: institutions,
    primaryInstitutionId: institutions,
    publicationId: publications,
    relatedPublicationId: publications,
  };
}

export function EntityBrowser({
  entity,
  snapshot,
  canEdit,
  onSubmitted,
}: {
  entity: EntityDef;
  snapshot: Snapshot;
  canEdit: (record: Rec | undefined) => boolean;
  onSubmitted: (pr: { number: number; url: string }) => void;
}) {
  const records = snapshot.content[entity.snapshotKey] as unknown as Rec[];
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Rec | undefined>();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [records, query]);

  if (editing || creating) {
    return (
      <RecordForm
        entity={entity}
        snapshot={snapshot}
        initial={editing}
        isNew={creating}
        onCancel={() => {
          setEditing(undefined);
          setCreating(false);
        }}
        onSubmitted={(pr) => {
          setEditing(undefined);
          setCreating(false);
          onSubmitted(pr);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{entity.plural}</h2>
          <p className="font-mono text-[11px] text-text-faint">
            {records.length} record{records.length === 1 ? "" : "s"}
            {UNRENDERED_ENTITIES.has(entity.key) && " · not shown on the public site"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCsv(entity, filtered)}
            className="font-mono text-[11px] text-text-faint hover:text-foreground"
          >
            Export CSV
          </button>
          <button
            onClick={() => setCreating(true)}
            className="rounded-sm bg-invert-bg px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-invert-fg uppercase"
          >
            New {entity.label}
          </button>
        </div>
      </div>

      <input
        type="search"
        placeholder={`Search ${entity.plural.toLowerCase()}…`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />

      {selected.size > 0 && (
        <BulkThemeBar
          entity={entity}
          snapshot={snapshot}
          selectedIds={selected}
          onDone={(pr) => {
            setSelected(new Set());
            onSubmitted(pr);
          }}
          onCancel={() => setSelected(new Set())}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {supportsThemes(entity) && <th className="w-7" />}
              {entity.columns.map((c) => (
                <th key={c} className="py-2 pr-3 font-mono text-[10.5px] font-bold tracking-wider text-text-faint uppercase">
                  {c}
                </th>
              ))}
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={String(r.id)} className="border-b border-hairline hover:bg-bg-alt">
                {supportsThemes(entity) && (
                  <td className="py-2 align-top">
                    <input
                      type="checkbox"
                      checked={selected.has(String(r.id))}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(String(r.id));
                        else next.delete(String(r.id));
                        setSelected(next);
                      }}
                      aria-label={`Select ${String(r.id)}`}
                    />
                  </td>
                )}
                {entity.columns.map((c) => (
                  <td key={c} className="py-2 pr-3 align-top text-foreground">
                    <span className="line-clamp-2">{formatCell(r[c])}</span>
                  </td>
                ))}
                <td className="py-2 text-right">
                  <button
                    onClick={() => setEditing(r)}
                    disabled={!canEdit(r)}
                    className="font-mono text-[11px] text-brand-strong hover:underline disabled:text-text-placeholder disabled:no-underline"
                  >
                    {canEdit(r) ? "Edit" : "Locked"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-faint">No matching records.</p>
        )}
      </div>
    </div>
  );
}

/** Entities that carry research thrusts, and so support bulk tagging. */
function supportsThemes(entity: EntityDef): boolean {
  return entity.key === "publications" || entity.key === "projects";
}

/**
 * Tag many records with research thrusts in one submission.
 *
 * 284 of 301 publications currently carry no thrust, which is why most of them never appear
 * in the research browser. Fixing that one record at a time is roughly 284 review cycles;
 * this makes it a handful.
 */
function BulkThemeBar({
  entity,
  snapshot,
  selectedIds,
  onDone,
  onCancel,
}: {
  entity: EntityDef;
  snapshot: Snapshot;
  selectedIds: Set<string>;
  onDone: (pr: { number: number; url: string }) => void;
  onCancel: () => void;
}) {
  const [themes, setThemes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"add" | "replace">("add");

  async function apply() {
    if (themes.length === 0) return;
    setBusy(true);
    try {
      const all = snapshot.content[entity.snapshotKey] as unknown as Rec[];
      const files = all
        .filter((r) => selectedIds.has(String(r.id)))
        .map((r) => {
          const existing = Array.isArray(r.themeIds) ? (r.themeIds as string[]) : [];
          const next = mode === "replace" ? themes : [...new Set([...existing, ...themes])];
          return {
            path: filePathFor(entity, String(r.id)),
            content: serializeRecord(entity, { ...r, themeIds: next }),
          };
        });
      const res = await api.submit({
        title: `Tag ${files.length} ${entity.plural.toLowerCase()} with research themes`,
        summary: `Bulk ${mode} of themes: ${themes.join(", ")}.`,
        files,
      });
      onDone(res.pr);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bulk update failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-sm border border-brand-soft-border bg-brand-soft-bg p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[11px] font-bold text-brand-strong">
          {selectedIds.size} selected
        </span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "add" | "replace")}
          className="rounded-sm border border-border bg-background px-2 py-1 text-[12.5px]"
        >
          <option value="add">Add themes</option>
          <option value="replace">Replace themes</option>
        </select>
        <button onClick={onCancel} className="ml-auto font-mono text-[11px] text-text-faint hover:text-foreground">
          Clear selection
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {snapshot.content.researchThemes.map((t) => {
          const on = themes.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setThemes(on ? themes.filter((x) => x !== t.id) : [...themes, t.id])}
              className={`rounded-sm border px-2 py-1 font-mono text-[11px] ${
                on ? "border-brand bg-background text-brand-strong" : "border-border text-text-faint"
              }`}
            >
              {t.title}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => void apply()}
        disabled={busy || themes.length === 0}
        className="mt-2 rounded-sm bg-invert-bg px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-invert-fg uppercase disabled:opacity-40"
      >
        {busy ? "Submitting…" : `Apply to ${selectedIds.size}`}
      </button>
    </div>
  );
}

/** Download the current (filtered) view as CSV — a plain-text backup anyone can open. */
function exportCsv(entity: EntityDef, rows: Rec[]): void {
  const columns = ["id", ...entity.columns.filter((c) => c !== "id")];
  const escape = (v: unknown) => `"${formatCell(v).replace(/"/g, '""')}"`;
  const csv = [
    columns.join(","),
    ...rows.map((r) => columns.map((c) => escape(r[c])).join(",")),
  ].join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `xlab-${entity.key}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Paste a DOI, get the publication filled in. Uses Crossref, which needs no account and no
 * API key — the least maintenance-bearing way to remove the most tedious data entry here.
 */
function DoiLookup({ onFill }: { onFill: (patch: Rec) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>();

  async function lookup() {
    if (!value.trim()) return;
    setBusy(true);
    setNote(undefined);
    try {
      const r = await fetchByDoi(value);
      const patch: Rec = {};
      if (r.title) patch.title = r.title;
      if (r.authors.length) patch.authors = r.authors;
      if (r.venue) patch.venue = r.venue;
      if (r.year) patch.year = r.year;
      if (r.doi) patch.doi = r.doi;
      if (r.url) patch.url = r.url;
      if (r.location) patch.location = r.location;
      if (r.volumeIssue) patch.volumeIssue = r.volumeIssue;
      if (r.suggestedCategory) patch.category = r.suggestedCategory;
      onFill(patch);
      setValue("");
      setNote(`Filled in from Crossref. Check the category and authors — lab members still need linking.`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-sm border border-dashed border-border p-3">
      <label className="block font-mono text-[11px] font-bold tracking-wider text-text-faint uppercase">
        Fill from DOI
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void lookup();
            }
          }}
          placeholder="10.1145/3079856.3080244  or  https://doi.org/…"
          className="w-full rounded-sm border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={() => void lookup()}
          disabled={busy}
          className="shrink-0 rounded-sm border border-border px-3 font-mono text-[11px] tracking-wider uppercase disabled:opacity-50"
        >
          {busy ? "Looking up…" : "Fetch"}
        </button>
      </div>
      {note && <p className="mt-1.5 text-[11.5px] text-text-faint">{note}</p>}
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === undefined || v === null) return "—";
  if (Array.isArray(v)) return v.length ? v.map(formatCell).join(", ") : "—";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 60);
  return String(v);
}

function RecordForm({
  entity,
  snapshot,
  initial,
  isNew,
  onCancel,
  onSubmitted,
}: {
  entity: EntityDef;
  snapshot: Snapshot;
  initial?: Rec;
  isNew: boolean;
  onCancel: () => void;
  onSubmitted: (pr: { number: number; url: string }) => void;
}) {
  const suggestions = useMemo(() => buildSuggestions(snapshot), [snapshot]);
  const [record, setRecord] = useState<Rec>(initial ? { ...initial } : { status: "published" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string>();
  /** Images chosen but not yet committed, keyed by their repo path. */
  const [assets, setAssets] = useState<Record<string, string>>({});

  /** Record id, derived from the title for records that do not have one yet. */
  const currentId = String(
    record.id ?? slugify(String(record.title ?? record.name ?? record.award ?? record.role ?? ""))
  );

  async function pickAsset(fieldKey: string, file: File): Promise<string> {
    if (!currentId) {
      throw new Error("Give this record a title first — the image path is derived from it.");
    }
    const { base64, ext, bytes } = await prepareImage(file);
    if (bytes > 4_000_000) throw new Error("That image is too large even after resizing.");
    const assetPath = assetPathFor(entity, currentId, fieldKey, ext);
    setAssets((a) => ({ ...a, [repoAssetPath(assetPath)]: base64 }));
    return assetPath;
  }

  // Publication is a discriminated union: which fields exist depends on the category, so
  // resolve the active member schema before deriving the form.
  const activeSchema: ZodType = useMemo(() => {
    if (!entity.discriminator) return entity.schema;
    const value = String(record[entity.discriminator] ?? unionValues(entity.schema, entity.discriminator)[0]);
    return unionMember(entity.schema, entity.discriminator, value) as ZodType;
  }, [entity, record]);

  const fields: FieldSpec[] = useMemo(() => fieldsOf(activeSchema), [activeSchema]);

  async function save(deleteRecord = false) {
    setFailure(undefined);

    const id = String(record.id ?? "");
    if (!deleteRecord) {
      const candidate = { ...record };
      // New records derive their id from the title/name, matching the schema's slug rule.
      if (isNew && !candidate.id) {
        const source = String(candidate.title ?? candidate.name ?? candidate.award ?? candidate.role ?? "");
        candidate.id = slugify(source);
      }
      const result = validateRecord(activeSchema, candidate);
      if (!result.ok) {
        setErrors(result.errors);
        setFailure("Fix the highlighted fields before submitting.");
        return;
      }
      setErrors({});
      setRecord(candidate);
      Object.assign(record, candidate);
    }
    if (!record.id) {
      setFailure("This record needs an id.");
      return;
    }

    setBusy(true);
    try {
      const path = filePathFor(entity, String(record.id));
      const res = await api.submit({
        title: deleteRecord
          ? `Delete ${entity.label.toLowerCase()}: ${id}`
          : `${isNew ? "Add" : "Update"} ${entity.label.toLowerCase()}: ${record.title ?? record.name ?? id}`,
        summary: `Submitted from Studio.`,
        files: deleteRecord
          ? [{ path, delete: true }]
          : [
              { path, content: serializeRecord(entity, record) },
              // Uploaded images ride along in the same commit as the record that
              // references them, so a reviewer never sees a record pointing at a file that
              // does not exist yet — and CI's asset check cannot fail spuriously.
              ...Object.entries(assets).map(([assetPath, contentBase64]) => ({
                path: assetPath,
                contentBase64,
              })),
            ],
      });
      onSubmitted(res.pr);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {isNew ? `New ${entity.label.toLowerCase()}` : `Edit ${entity.label.toLowerCase()}`}
          </h2>
          <p className="font-mono text-[11px] text-text-faint">
            {record.id ? filePathFor(entity, String(record.id)) : "id generated from the title on save"}
          </p>
        </div>
        <button onClick={onCancel} className="font-mono text-[11px] text-text-faint hover:text-foreground">
          ← Back
        </button>
      </div>

      {entity.key === "publications" && <DoiLookup onFill={(patch) => setRecord((r) => ({ ...patch, ...r, ...patch }))} />}

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.kind === "text" || f.kind === "object" || f.kind === "array" ? "md:col-span-2" : ""}>
            <FieldInput
              spec={{ ...f, readOnly: f.readOnly || (f.key === "id" && !isNew) }}
              value={record[f.key]}
              onChange={(next) => setRecord((r) => ({ ...r, [f.key]: next }))}
              error={errors[f.key]}
              suggestions={suggestions}
              onAssetPick={pickAsset}
            />
          </div>
        ))}
      </div>

      {failure && (
        <p className="rounded-sm border border-brand-orange/40 bg-brand-orange/5 px-3 py-2 text-sm text-brand-orange">
          {failure}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          onClick={() => save(false)}
          disabled={busy}
          className="rounded-sm bg-invert-bg px-4 py-2 font-mono text-[11px] font-bold tracking-wider text-invert-fg uppercase disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit for review"}
        </button>
        {!isNew && (
          <button
            onClick={() => {
              if (confirm(`Submit a request to delete "${record.id}"? It still needs approval before anything changes.`)) {
                void save(true);
              }
            }}
            disabled={busy}
            className="font-mono text-[11px] text-brand-orange hover:underline disabled:opacity-50"
          >
            Request deletion
          </button>
        )}
        <p className="ml-auto max-w-sm text-right text-[11.5px] leading-snug text-text-faint">
          Nothing changes on the live site until this is reviewed, validated by CI, and approved.
        </p>
      </div>
    </div>
  );
}
