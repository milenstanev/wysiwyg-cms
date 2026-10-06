"use client";

import { useState } from "react";
import type { ModuleId, PageModuleAssignment } from "@/lib/cms/types";
import { MODULE_IDS } from "@/lib/cms/types";
import { MODULE_REGISTRY } from "@/lib/cms/modules";
import { getTemplatePositionIds } from "@/lib/cms/page-blocks";
import { TEST_ID } from "@/lib/test-ids";

export interface ModulesPanelProps {
  layout: string;
  modules: PageModuleAssignment[];
  onChange: (modules: PageModuleAssignment[]) => void;
}

export function ModulesPanel({ layout, modules, onChange }: ModulesPanelProps) {
  const positions = getTemplatePositionIds(layout);
  const [positionId, setPositionId] = useState(positions[0] ?? "main");
  const [moduleId, setModuleId] = useState<ModuleId>(MODULE_IDS[0]);

  const addModule = () => {
    const def = MODULE_REGISTRY[moduleId];
    onChange([
      ...modules,
      { positionId, moduleId, params: { ...def.defaultParams } },
    ]);
  };

  const removeAt = (index: number) => {
    onChange(modules.filter((_, i) => i !== index));
  };

  return (
    <div
      className="border border-[var(--border)] rounded-lg p-[var(--space-3)] bg-[var(--surface)] space-y-[var(--space-3)]"
      data-testid={TEST_ID.modulesPanel}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Modules</h2>
      {modules.length === 0 ? (
        <p className="text-xs text-[var(--muted)]">No modules assigned.</p>
      ) : (
        <ul className="space-y-[var(--space-2)] text-sm">
          {modules.map((m, i) => (
            <li
              key={`${m.positionId}-${m.moduleId}-${i}`}
              className="flex items-center justify-between gap-[var(--space-2)]"
            >
              <span>
                <span className="font-medium">{MODULE_REGISTRY[m.moduleId]?.label ?? m.moduleId}</span>
                <span className="text-[var(--muted)]"> → {m.positionId}</span>
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label={`Remove ${m.moduleId} from ${m.positionId}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-[var(--space-2)] items-end">
        <label className="text-xs space-y-[var(--space-1)]">
          <span className="text-[var(--muted)]">Position</span>
          <select
            value={positions.includes(positionId) ? positionId : (positions[0] ?? "main")}
            onChange={(e) => setPositionId(e.target.value)}
            className="block text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--background)]"
            aria-label="Module position"
          >
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs space-y-[var(--space-1)]">
          <span className="text-[var(--muted)]">Module</span>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value as ModuleId)}
            className="block text-sm border border-[var(--border)] rounded px-[var(--space-2)] py-[var(--space-1)] bg-[var(--background)]"
            aria-label="Module type"
          >
            {MODULE_IDS.map((id) => (
              <option key={id} value={id}>
                {MODULE_REGISTRY[id].label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="text-sm px-[var(--space-3)] py-[var(--space-1)] border border-[var(--border)] rounded hover:bg-[var(--background)]"
          onClick={addModule}
        >
          Add module
        </button>
      </div>
    </div>
  );
}
