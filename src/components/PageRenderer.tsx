import type { PageRendererProps } from "@/lib/cms/page-editor.types";
import type { ContentBlock } from "@/lib/cms/types";
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
  isContentPosition,
} from "@/lib/cms/layout-templates";

function getBlocksForPosition(
  p: {
    blocks?: ContentBlock[];
    leftBlocks?: ContentBlock[];
    rightBlocks?: ContentBlock[];
    positionBlocks?: Record<string, ContentBlock[]>;
  },
  positionId: string
): ContentBlock[] {
  if (positionId === "main") return p.blocks ?? [];
  if (positionId === "left") return p.leftBlocks ?? [];
  if (positionId === "right") return p.rightBlocks ?? [];
  return p.positionBlocks?.[positionId] ?? [];
}

/**
 * Renders a page from a layout template (single, two-col, three-col, rockettheme).
 * Every position can hold blocks; "main" / "left" / "right" use content cards, others use module position styling.
 */
export function PageRenderer({
  page,
  editable = false,
  onBlockEdit,
  onTitleEdit,
  onLayoutChange,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
  onBlockUpdate,
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
    onBlockEdit,
    onBlockUpdate,
    onAddBlock,
    onRemoveBlock,
    onMoveBlock,
  };
  const unstyled = layoutOptions?.unstyledCards ?? false;

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
          <ComponentSlot component={mainComp} region="main" blocks={mainBlocks} {...slotProps} />
        </ContentCard>
      );
    }
    if (positionId === "left") {
      return wrap(
        <SidebarCard side="left" unstyled={unstyled}>
          <ModulePosition name="sidebar-left" />
          <ComponentSlot component={leftComp} region="left" blocks={leftBlocks} {...slotProps} />
        </SidebarCard>
      );
    }
    if (positionId === "right") {
      return wrap(
        <SidebarCard side="right" unstyled={unstyled}>
          <ModulePosition name="sidebar-right" />
          <ComponentSlot component={rightComp} region="right" blocks={rightBlocks} {...slotProps} />
        </SidebarCard>
      );
    }
    // Any other position (utility-a, header, etc.): only render when there are blocks or editable add-block
    const blocks = getBlocksForPosition(page, positionId);
    const placeholderLabel =
      template.id === "rockettheme" ? getPositionPlaceholderLabel(positionId) : undefined;
    const hasContent = blocks.length > 0 || (editable && onAddBlock);
    if (hasContent) {
      return wrap(
        <div data-module-position={positionId} className="min-h-[2rem]">
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
        </div>
      );
    }
    // Empty module position: return null so caller can collapse the column (do not show placeholder)
    return null;
  }

  function isPositionVisible(positionId: string): boolean {
    if (isContentPosition(positionId)) return true;
    const blocks = getBlocksForPosition(page, positionId);
    return blocks.length > 0 || !!(editable && onAddBlock);
  }

  const isRocketTheme = template.id === "rockettheme";
  return (
    <article
      data-page-renderer
      data-layout={layout}
      data-template={template.id}
      className={`page-content ${CONTENT_WIDTH_CLASS} space-y-8 min-w-0 ${contentClassName} ${isRocketTheme ? "layout-template-rockettheme" : ""}`}
    >
      <ModulePosition name="top" />

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
            ? "page-title font-bold text-[var(--foreground)] focus:outline focus:outline-2 focus:outline-dashed focus:outline-[var(--border)] focus:outline-offset-2 focus:rounded"
            : "page-title font-bold text-[var(--foreground)]"
        }
      >
        {page.title}
      </h1>

      {template.rows.map((row, rowIndex) => {
        const visiblePositions = row.positions.filter(isPositionVisible);
        const gridClassName = getRowGridClassName(row, visiblePositions.length);
        return (
          <div
            key={`${template.id}-row-${rowIndex}`}
            className={gridClassName}
            data-template-row={rowIndex}
          >
            {visiblePositions.map((positionId, posIndex) => {
              const originalIndex = row.positions.indexOf(positionId);
              return renderPosition(positionId, rowIndex, row.orderClassNames?.[originalIndex]);
            })}
          </div>
        );
      })}

      <ModulePosition name="bottom" />
    </article>
  );
}
