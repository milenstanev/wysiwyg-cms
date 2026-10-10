"use client";

import type { ContentBlock } from "@/lib/cms/types";
import { BLOCK_SETTINGS, getBlockSettings, type BlockSettingDef } from "@/lib/cms/block-settings";

interface BlockSettingsPanelProps {
  block: ContentBlock;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  onClose?: () => void;
}

function SettingField({
  def,
  value,
  onChange,
}: {
  def: BlockSettingDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `block-setting-${def.key}`;
  if (def.type === "boolean") {
    const checked = value === true || value === "true";
    return (
      <label htmlFor={id} className="flex items-center gap-[var(--space-2)] cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-[var(--control-border)] text-[var(--accent)] focus:ring-[var(--accent)]"
        />
        <span className="text-sm text-[var(--foreground)]">{def.label}</span>
      </label>
    );
  }
  if (def.type === "select" && def.options) {
    const str = value == null ? "" : String(value);
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-[var(--foreground)] mb-[var(--space-1)]">
          {def.label}
        </label>
        <select
          id={id}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-[var(--control-border)] bg-[var(--surface)] px-[var(--space-2)] py-[var(--space-2)] text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        >
          {Object.entries(def.options).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (def.type === "text") {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-[var(--foreground)] mb-[var(--space-1)]">
          {def.label}
        </label>
        <input
          id={id}
          type="text"
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          className="w-full rounded border border-[var(--control-border)] bg-[var(--surface)] px-[var(--space-2)] py-[var(--space-2)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
    );
  }
  return null;
}

export function BlockSettingsPanel({ block, onSettingsChange, onClose }: BlockSettingsPanelProps) {
  const defs = BLOCK_SETTINGS[block.type] ?? [];
  const settings = getBlockSettings(block);

  if (defs.length === 0) {
    return (
      <div className="p-[var(--space-3)] text-sm text-[var(--muted)]">
        No settings for this block type.
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-[var(--space-2)] text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  const handleChange = (key: string, value: unknown) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-[var(--space-3)] min-w-[200px]">
      <div className="space-y-[var(--space-3)]">
        {defs.map((def) => (
          <SettingField
            key={def.key}
            def={def}
            value={settings[def.key]}
            onChange={(v) => handleChange(def.key, v)}
          />
        ))}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-[var(--space-3)] w-full rounded bg-[color-mix(in_srgb,var(--muted)_14%,var(--surface))] px-[var(--space-2)] py-[var(--space-2)] text-sm text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--muted)_22%,var(--surface))]"
        >
          Close
        </button>
      )}
    </div>
  );
}
