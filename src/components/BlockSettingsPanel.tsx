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
      <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
        />
        <span className="text-sm text-zinc-700">{def.label}</span>
      </label>
    );
  }
  if (def.type === "select" && def.options) {
    const str = value == null ? "" : String(value);
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-1">
          {def.label}
        </label>
        <select
          id={id}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
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
        <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-1">
          {def.label}
        </label>
        <input
          id={id}
          type="text"
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
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
      <div className="p-3 text-sm text-zinc-500">
        No settings for this block type.
        {onClose && (
          <button type="button" onClick={onClose} className="mt-2 text-zinc-600 hover:underline">
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
    <div className="p-3 min-w-[200px]">
      <div className="space-y-3">
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
          className="mt-3 w-full rounded bg-zinc-100 px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200"
        >
          Close
        </button>
      )}
    </div>
  );
}
