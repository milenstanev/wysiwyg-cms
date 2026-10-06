import type { PageRendererProps } from "@/lib/cms/page-editor.types";
import { getComponentForRegion, ComponentSlot } from "@/lib/cms/components";
import { ModulePosition } from "./layout/ModulePosition";
import { ContentCard } from "./layout/ContentCard";
import { SidebarCard } from "./layout/SidebarCard";
import { BlocksColumn } from "./BlocksColumn";
import { CONTENT_WIDTH_CLASS } from "@/lib/layout/constants";
import {
  getLayoutTemplate,
  getPositionPlaceholderLabel,
  getRowGridClassName,
} from "@/lib/cms/layout-templates";
import { getBlocksForPosition, positionHasContent } from "@/lib/cms/page-blocks";
import { EmptySectionsMenu } from "./EmptySectionsMenu";
import {
  MODULE_REGISTRY,
  getModulesForPosition,
} from "@/lib/cms/modules";
import type { PageModuleAssignment, ModuleId } from "@/lib/cms/types";

/**
 * Renders a page from a layout template (single, two-col, three-col, rockettheme).
 * Every position can hold blocks; "main" / "left" / "right" use content cards, others use module position styling.
 */
export function PageRenderer({
  page,
  editable = false,
  allPages,
  currentSlug,
  onBlockEdit,
  onTitleEdit,
  onLayoutChange,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
  onBlockUpdate,
  onModulesChange,
  contentClassName = "",
  layoutOptions,
}: PageRendererProps) {
  const layout = page.layout ?? "single";
  const template = getLayoutTemplate(layout) ?? getLayoutTemplate("single")!;
  const leftBlocks = page.leftBlocks ?? [];
  const rightBlocks = page.rightBlocks ?? [];
  const mainBlocks = page.blocks ?? [];
  const mainComp = getComponentForRegion(page, "main");
  const leftComp = getComponentForRegion(page, "left");
  const rightComp = getComponentForRegion(page, "right");

  const slotProps = {
    editable,
    page,
    pages: allPages,
    onBlockEdit,
    onBlockUpdate,
    onAddBlock,
    onRemoveBlock,
    onMoveBlock,
  };
  const unstyled = layoutOptions?.unstyledCards ?? false;

  function updateModuleParams(assignment: PageModuleAssignment, params: Record<string, unknown>) {
    if (!onModulesChange) return;
    const modules = (page.modules ?? []).map((m) =>
      m.positionId === assignment.positionId && m.moduleId === assignment.moduleId
        ? { ...m, params }
        : m
    );
    onModulesChange(modules);
  }

  function handleAddModule(positionId: string, moduleId: ModuleId) {
    if (!onModulesChange) return;
    const def = MODULE_REGISTRY[moduleId];
    onModulesChange([
      ...(page.modules ?? []),
      { positionId, moduleId, params: { ...def.defaultParams } },
    ]);
  }

  function renderModules(positionId: string) {
    const assignments = getModulesForPosition(page.modules, positionId);
    if (assignments.length === 0) return null;
    return (
      <div className="space-y-[var(--space-3)]" data-modules-for={positionId}>
        {assignments.map((assignment, i) => {
          const def = MODULE_REGISTRY[assignment.moduleId];
          if (!def) return null;
          return (
            <div key={`${assignment.moduleId}-${i}`}>
              {def.render(assignment, {
                pages: allPages,
                currentSlug,
                editable,
                onParamsChange: editable
                  ? (params) => updateModuleParams(assignment, params)
                  : undefined,
              })}
            </div>
          );
        })}
      </div>
    );
  }

  function renderPosition(positionId: string, rowIndex: number, orderClassName?: string) {
    const key = `${template.id}-row-${rowIndex}-${positionId}`;
    const wrap = (node: React.ReactNode) =>
      orderClassName ? (
        <div key={key} className={`min-w-0 ${orderClassName}`}>
          {node}
        </div>
      ) : (
        <div key={key} className="min-w-0">
          {node}
        </div>
      );

    if (positionId === "main") {
      return wrap(
        <ContentCard unstyled={unstyled}>
          {renderModules("main")}
          <ComponentSlot component={mainComp} region="main" blocks={mainBlocks} {...slotProps} />
        </ContentCard>
      );
    }
    if (positionId === "left") {
      return wrap(
        <SidebarCard side="left" unstyled={unstyled}>
          <ModulePosition name="sidebar-left">{renderModules("left")}</ModulePosition>
          <ComponentSlot component={leftComp} region="left" blocks={leftBlocks} {...slotProps} />
        </SidebarCard>
      );
    }
    if (positionId === "right") {
      return wrap(
        <SidebarCard side="right" unstyled={unstyled}>
          <ModulePosition name="sidebar-right">{renderModules("right")}</ModulePosition>
          <ComponentSlot component={rightComp} region="right" blocks={rightBlocks} {...slotProps} />
        </SidebarCard>
      );
    }
    // Any other position (utility-a, header, etc.)
    const blocks = getBlocksForPosition(page, positionId);
    const modulesNode = renderModules(positionId);
    const placeholderLabel =
      template.id === "rockettheme" ? getPositionPlaceholderLabel(positionId) : undefined;
    if (blocks.length > 0 || modulesNode) {
      return wrap(
        <ModulePosition name={positionId} className="min-h-[2rem]">
          {modulesNode}
          {blocks.length > 0 && (
            <BlocksColumn
              blocks={blocks}
              region={positionId}
              editable={editable}
              onBlockEdit={onBlockEdit}
              onBlockUpdate={onBlockUpdate}
              onAddBlock={onAddBlock}
              onRemoveBlock={onRemoveBlock}
              onMoveBlock={onMoveBlock}
              addBlockLabel={placeholderLabel ?? positionId}
            />
          )}
        </ModulePosition>
      );
    }
    return null;
  }

  // Same answer in view and edit: WYSIWYG means edit mode never adds layout boxes.
  function isPositionVisible(positionId: string): boolean {
    if (positionHasContent(page, positionId)) return true;
    return positionId === "main";
  }

  const isRocketTheme = template.id === "rockettheme";
  const emptySections = template.rows
    .flatMap((row) => row.positions)
    .filter((positionId) => !isPositionVisible(positionId))
    .map((positionId) => ({
      positionId,
      label: isRocketTheme ? getPositionPlaceholderLabel(positionId) : positionId,
    }));
  return (
    <article
      data-page-renderer
      data-layout={layout}
      data-template={template.id}
      data-editing={editable ? "true" : undefined}
      className={`page-content ${CONTENT_WIDTH_CLASS} min-w-0 ${contentClassName} ${isRocketTheme ? "layout-template-rockettheme" : ""}${editable ? " is-editing" : ""}`}
    >
      <ModulePosition name="top">{renderModules("top")}</ModulePosition>

      {editable && onAddBlock && emptySections.length > 0 && (
        <EmptySectionsMenu
          sections={emptySections}
          onAddBlock={onAddBlock}
          onAddModule={onModulesChange ? handleAddModule : undefined}
        />
      )}

      <h1
        contentEditable={editable && !!onTitleEdit}
        suppressContentEditableWarning
        onInput={
          editable && onTitleEdit
            ? (e) => onTitleEdit((e.currentTarget as HTMLHeadingElement).textContent ?? "")
            : undefined
        }
        className={
          editable
            ? "page-title font-bold focus:outline focus:outline-2 focus:outline-dashed focus:outline-[var(--border)] focus:outline-offset-2 focus:rounded"
            : "page-title font-bold"
        }
      >
        {page.title}
      </h1>

      {template.rows.map((row, rowIndex) => {
        const visiblePositions = row.positions.filter(isPositionVisible);
        // Empty section: omit the whole row so chrome/padding disappears and layout adapts
        if (visiblePositions.length === 0) return null;
        const gridClassName = getRowGridClassName(row, visiblePositions.length);
        return (
          <div
            key={`${template.id}-row-${rowIndex}`}
            className={gridClassName}
            data-template-row={rowIndex}
            data-visible-count={visiblePositions.length}
          >
            {visiblePositions.map((positionId) => {
              const originalIndex = row.positions.indexOf(positionId);
              return renderPosition(positionId, rowIndex, row.orderClassNames?.[originalIndex]);
            })}
          </div>
        );
      })}

      <ModulePosition name="bottom">{renderModules("bottom")}</ModulePosition>
    </article>
  );
}
