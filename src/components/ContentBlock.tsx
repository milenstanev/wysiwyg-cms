"use client";

import { ContentBlock as BlockType } from "@/lib/cms/types";
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

export function ContentBlock({ block, editable, onEdit, onBlockUpdate }: ContentBlockProps) {
  const handleInput = (e: React.FormEvent<HTMLHeadingElement | HTMLParagraphElement | HTMLDivElement>) => {
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

  if (block.type === "heading") {
    return (
      <h1
        contentEditable={editable}
        suppressContentEditableWarning
        onInput={handleInput}
        className="text-3xl font-bold text-zinc-900 outline-none"
      >
        {block.content}
      </h1>
    );
  }

  if (block.type === "text") {
    return (
      <p
        contentEditable={editable}
        suppressContentEditableWarning
        onInput={handleInput}
        className="text-lg text-zinc-600 leading-relaxed outline-none"
      >
        {block.content}
      </p>
    );
  }

  if (block.type === "image") {
    return (
      <div className="space-y-2">
        {block.content ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-100">
            <Image
              src={block.content}
              alt=""
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
            {block.content}
          </div>
        ) : null}
      </div>
    );
  }

  if (block.type === "banner") {
    return (
      <BannerBlock
        title={block.title}
        content={block.content}
        editable={editable}
        onEdit={handleFieldEdit}
      />
    );
  }

  if (block.type === "showcase") {
    return (
      <ShowcaseBlock
        title={block.title}
        content={block.content}
        editable={editable}
        onEdit={handleFieldEdit}
      />
    );
  }

  if (block.type === "list") {
    return (
      <ListBlock
        items={block.items}
        content={block.content}
        editable={editable}
        onEdit={handleItemsEdit}
      />
    );
  }

  if (block.type === "table") {
    return (
      <TableBlock
        rows={block.rows}
        content={block.content}
        editable={editable}
        onEdit={handleRowsEdit}
      />
    );
  }

  return null;
}
