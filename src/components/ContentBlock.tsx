"use client";

import { ContentBlock as BlockType } from "@/lib/cms/types";
import { getBlockSettingOrDefault } from "@/lib/cms/block-settings";
import Image from "next/image";
import { BannerBlock } from "./blocks/BannerBlock";
import { ShowcaseBlock } from "./blocks/ShowcaseBlock";
import { ListBlock } from "./blocks/ListBlock";
import { TableBlock } from "./blocks/TableBlock";
import { RichEditable } from "./editor/RichEditable";

interface ContentBlockProps {
  block: BlockType;
  editable?: boolean;
  onEdit?: (blockId: string, content: string) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<BlockType>) => void;
}

function safeContent(block: BlockType): string {
  return block.content ?? "";
}

export function ContentBlock({ block, editable, onEdit, onBlockUpdate }: ContentBlockProps) {
  const handleFieldEdit = (field: "title" | "content", value: string) => {
    onBlockUpdate?.(block.id, field === "title" ? { title: value } : { content: value });
  };

  const handleItemsEdit = (items: string[]) => {
    onBlockUpdate?.(block.id, { items, content: items.join("\n") });
  };

  const handleRowsEdit = (rows: string[][]) => {
    onBlockUpdate?.(block.id, { rows });
  };

  const content = safeContent(block);

  if (block.type === "heading") {
    // Legacy level "1" renders as h2: the page title is the page's only h1
    const level = getBlockSettingOrDefault(block, "level", "2") as string;
    const Tag = level === "4" ? "h4" : level === "3" ? "h3" : "h2";
    const sizeClass = level === "4" ? "text-lg" : level === "3" ? "text-xl" : "text-2xl";
    return (
      <RichEditable
        as={Tag}
        html={content}
        editable={editable}
        onHtmlChange={(html) => onEdit?.(block.id, html)}
        className={`${sizeClass} font-bold text-[var(--foreground)] outline-none`}
      />
    );
  }

  if (block.type === "text") {
    // div (not p) so lists / quotes from the format toolbar are valid HTML
    return (
      <RichEditable
        as="div"
        html={content}
        editable={editable}
        onHtmlChange={(html) => onEdit?.(block.id, html)}
        className="rich-text-block text-lg text-[var(--muted)] leading-relaxed outline-none"
      />
    );
  }

  if (block.type === "image") {
    const alt = getBlockSettingOrDefault(block, "alt", "") as string;
    // Image URL is edited from the block popover so the card keeps its view-mode size.
    return (
      <div className="space-y-[var(--space-2)]">
        {content ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[color-mix(in_srgb,var(--muted)_12%,var(--surface))]">
            <Image
              src={content}
              alt={alt}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (block.type === "banner") {
    return (
      <BannerBlock
        title={block.title ?? ""}
        content={content}
        editable={editable}
        onEdit={handleFieldEdit}
      />
    );
  }

  if (block.type === "showcase") {
    return (
      <ShowcaseBlock
        title={block.title ?? ""}
        content={content}
        editable={editable}
        onEdit={handleFieldEdit}
      />
    );
  }

  if (block.type === "list") {
    return (
      <ListBlock
        items={block.items}
        content={content}
        settings={block.settings}
        editable={editable}
        onEdit={handleItemsEdit}
      />
    );
  }

  if (block.type === "table") {
    return (
      <TableBlock
        rows={block.rows}
        content={content}
        settings={block.settings}
        editable={editable}
        onEdit={handleRowsEdit}
      />
    );
  }

  return null;
}
