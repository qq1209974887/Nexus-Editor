import type { Extension } from "@codemirror/state";
import type { Blockquote, Heading, Image, InlineCode, Link, Root, Strong, Emphasis } from "mdast";
import type { Plugin } from "unified";

export interface ParserLike {
  parse(markdown: string): Root;
}

export type LivePreviewNode =
  | Blockquote
  | Emphasis
  | Heading
  | Image
  | InlineCode
  | Link
  | Strong;

export type LivePreviewNodeType = LivePreviewNode["type"];

export interface LivePreviewRenderContext {
  node: LivePreviewNode;
  nodeType: LivePreviewNodeType;
  source: string;
  text: string;
}

export type LivePreviewRenderer = (context: LivePreviewRenderContext) => HTMLElement;

export interface LivePreviewConfig {
  enabled?: boolean;
  renderers?: Partial<Record<LivePreviewNodeType, LivePreviewRenderer>>;
}

export interface EditorConfig {
  container: HTMLElement;
  initialValue?: string;
  parser?: ParserLike;
  parseDelayMs?: number;
  livePreview?: boolean | LivePreviewConfig;
  plugins?: NexusPlugin[];
  onChange?: (doc: string, ast: Root) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onAssetUpload?: (file: File) => Promise<string>;
}

export interface EditorAPI {
  getDocument(): string;
  getAst(): Root;
  getSlashCommands(): SlashCommandDef[];
  uploadAsset(file: File): Promise<string | null>;
  setSelection(anchor: number, head?: number): void;
  setDocument(next: string): void;
  focus(): void;
  blur(): void;
  runShortcut(key: string): boolean;
  destroy(): void;
}

export interface SlashCommandDef {
  id: string;
  title: string;
  keywords?: string[];
}

export interface NexusPlugin {
  name: string;
  shortcuts?: Array<{ key: string; run: (editor: EditorAPI) => boolean }>;
  slashCommands?: SlashCommandDef[];
  remarkPlugins?: Array<Plugin<[], Root, Root>>;
  cmExtensions?: Extension[];
}
