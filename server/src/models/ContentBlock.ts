import { Schema } from "mongoose";

const blockTypeEnum = ["heading", "text", "image", "banner", "list", "table", "showcase"] as const;

export interface IContentBlock {
  id: string;
  type: (typeof blockTypeEnum)[number];
  content: string;
  title?: string;
  items?: string[];
  rows?: string[][];
}

export const ContentBlockSchema = new Schema<IContentBlock>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: blockTypeEnum, required: true },
    content: { type: String, required: true },
    title: { type: String },
    items: [String],
    rows: [[String]],
  },
  { _id: false }
);
