"use client";

import { ContentBlock as BlockType } from "@/lib/cms/types";
import { getBlockSettingOrDefault } from "@/lib/cms/block-settings";
import Image from "next/image";
import { BannerBlock } from "./blocks/BannerBlock";
import { ShowcaseBlock } from "./blocks/ShowcaseBlock";
import { ListBlock } from "./blocks/ListBlock";
import { TableBlock } from "./blocks/TableBlock";

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
  const handleInput = (
    e: React.FormEvent<HTMLHeadingElement | HTMLParagraphElement | HTMLDivElement>
  ) => {
    onEdit?.(block.id, (e.currentTarget as HTMLElement).textContent || "");
  };

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
    const level = getBlockSettingOrDefault(block, "level", "1") as string;
    const Tag = level === "3" ? "h3" : level === "2" ? "h2" : "h1";
    const sizeClass = level === "3" ? "text-xl" : level === "2" ? "text-2xl" : "text-3xl";
    return (
      <Tag
        contentEditable={editable}
        suppressContentEditableWarning
        onInput={handleInput}
        className={`${sizeClass} font-bold text-[var(--foreground)] outline-none`}
      >
        {content}
      </Tag>
    );
  }

  if (block.type === "text") {
    return (
      <p
        contentEditable={editable}
        suppressContentEditableWarning
        onInput={handleInput}
        className="text-lg text-[var(--muted)] leading-relaxed outline-none"
      >
        {content}
      </p>
    );
  }

  if (block.type === "image") {
    const alt = getBlockSettingOrDefault(block, "alt", "") as string;
    return (
      <div className="space-y-2">
        {content ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-100">
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
        {editable ? (
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="text-sm text-zinc-500 outline-none min-h-[1.5rem]"
          >
            {content}
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
