"use client";

// Browse and edit one entity type. The form is generated from the Zod schema, so this file
// contains no per-entity field knowledge at all — adding a content type needs an entry in
// lib/studio/entities.ts and nothing here.
import { useMemo, useState } from "react";
import { api, type Snapshot } from "@/lib/studio/api";
import { filePathFor, slugify, UNRENDERED_ENTITIES, type EntityDef } from "@/lib/studio/entities";
import {
  fieldsOf,
  unionMember,
  unionValues,
  validateRecord,
  type FieldSpec,
} from "@/lib/studio/schema-fields";
import { serializeRecord } from "@/lib/studio/records";
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
        <button
          onClick={() => setCreating(true)}
          className="rounded-sm bg-invert-bg px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-invert-fg uppercase"
        >
          New {entity.label}
        </button>
      </div>

      <input
        type="search"
        placeholder={`Search ${entity.plural.toLowerCase()}…`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
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
        files: [
          deleteRecord
            ? { path, delete: true }
            : { path, content: serializeRecord(entity, record) },
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

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.kind === "text" || f.kind === "object" || f.kind === "array" ? "md:col-span-2" : ""}>
            <FieldInput
              spec={{ ...f, readOnly: f.readOnly || (f.key === "id" && !isNew) }}
              value={record[f.key]}
              onChange={(next) => setRecord((r) => ({ ...r, [f.key]: next }))}
              error={errors[f.key]}
              suggestions={suggestions}
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
