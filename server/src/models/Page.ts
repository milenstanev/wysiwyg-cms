import { Schema, model, Model, Document } from "mongoose";
import { ContentBlockSchema, type IContentBlock } from "./ContentBlock.js";

const layoutEnum = ["single", "two-col", "three-col", "rockettheme"] as const;
const componentEnum = ["content", "article", "list", "contact"] as const;
const statusEnum = ["draft", "published"] as const;

export interface IPage extends Document {
  id: string;
  slug: string;
  title: string;
  layout?: (typeof layoutEnum)[number];
  blocks: IContentBlock[];
  leftBlocks?: IContentBlock[];
  rightBlocks?: IContentBlock[];
  positionBlocks?: Record<string, IContentBlock[]>;
  mainComponent?: (typeof componentEnum)[number];
  leftComponent?: (typeof componentEnum)[number];
  rightComponent?: (typeof componentEnum)[number];
  modules?: unknown;
  status?: (typeof statusEnum)[number];
  publishedAt?: Date;
  seo?: unknown;
  columnWidths?: unknown;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    layout: { type: String, enum: layoutEnum, default: "single" },
    blocks: { type: [ContentBlockSchema], required: true },
    leftBlocks: { type: [ContentBlockSchema] },
    rightBlocks: { type: [ContentBlockSchema] },
    positionBlocks: { type: Schema.Types.Mixed },
    mainComponent: { type: String, enum: componentEnum },
    leftComponent: { type: String, enum: componentEnum },
    rightComponent: { type: String, enum: componentEnum },
    modules: { type: Schema.Types.Mixed },
    status: { type: String, enum: statusEnum, default: "published" },
    publishedAt: { type: Date },
    seo: { type: Schema.Types.Mixed },
    columnWidths: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

PageSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const PageModel: Model<IPage> = model<IPage>("Page", PageSchema);
