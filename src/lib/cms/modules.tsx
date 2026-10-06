"use client";

import type { ModuleId, PageModuleAssignment } from "./types";
import { MenuModule } from "@/components/modules/MenuModule";
import { SearchModule } from "@/components/modules/SearchModule";
import { HtmlModule } from "@/components/modules/HtmlModule";

export interface ModuleNavPage {
  id: string;
  slug: string;
  title: string;
}

export interface ModuleRenderContext {
  pages?: ModuleNavPage[];
  currentSlug?: string;
  editable?: boolean;
  onParamsChange?: (params: Record<string, unknown>) => void;
}

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  description: string;
  defaultParams: Record<string, unknown>;
  render: (assignment: PageModuleAssignment, ctx: ModuleRenderContext) => React.ReactNode;
}

export const MODULE_REGISTRY: Record<ModuleId, ModuleDefinition> = {
  menu: {
    id: "menu",
    label: "Menu",
    description: "Editable navigation links",
    defaultParams: {
      links: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
      ],
    },
    render: (assignment, ctx) => (
      <MenuModule
        params={assignment.params}
        pages={ctx.pages}
        currentSlug={ctx.currentSlug}
        editable={ctx.editable}
        onParamsChange={ctx.onParamsChange}
      />
    ),
  },
  search: {
    id: "search",
    label: "Search",
    description: "Filter pages by title",
    defaultParams: { placeholder: "Search pages…" },
    render: (assignment, ctx) => (
      <SearchModule
        params={assignment.params}
        pages={ctx.pages}
        editable={ctx.editable}
        onParamsChange={ctx.onParamsChange}
      />
    ),
  },
  html: {
    id: "html",
    label: "Custom HTML",
    description: "Freeform HTML snippet",
    defaultParams: { html: "<p>Custom module content</p>" },
    render: (assignment, ctx) => (
      <HtmlModule
        params={assignment.params}
        editable={ctx.editable}
        onParamsChange={ctx.onParamsChange}
      />
    ),
  },
};

export function getModulesForPosition(
  modules: PageModuleAssignment[] | undefined,
  positionId: string
): PageModuleAssignment[] {
  return (modules ?? []).filter((m) => m.positionId === positionId);
}

export function positionHasModules(
  modules: PageModuleAssignment[] | undefined,
  positionId: string
): boolean {
  return getModulesForPosition(modules, positionId).length > 0;
}
