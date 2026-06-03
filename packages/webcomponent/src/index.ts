export { NexusEditor } from "./nexus-editor";

// 主题相关
export { lightTheme, darkTheme, type NexusTheme } from "@floatboat/nexus-core";

// 编辑器核心类型
export type { 
  EditorAPI, 
  EditorConfig, 
  TocEntry,
  SlashCommandDef 
} from "@floatboat/nexus-core";

// 国际化相关
export { enLocale, zhLocale, resolveLocale, type NexusLocale } from "@floatboat/nexus-core";

// Wiki链接相关（高级场景）
export { 
  scanWikiLinks, 
  createWikilinksExtension, 
  createWikilinksPlugin,
  type WikiLinkMatch, 
  type WikilinksOptions,
  type WikiLinkNavigateOptions
} from "@floatboat/nexus-core";

// 事件系统类型（高级场景）
export type { 
  EditorEventContext, 
  EditorEventHandler,
  EditorEventHandlers,
  EditorEventMap 
} from "@floatboat/nexus-core";

// Markdown工具（高级场景）
export { 
  markdownAutoPair, 
  markdownFold, 
  markdownFoldService, 
  markdownKeymap, 
  handleMarkdownEnter 
} from "@floatboat/nexus-core";

// Slash命令相关（高级场景）
export {
  computeSlashState,
  filterSlashCommands,
  getSlashMatch,
  type SlashMatch,
  type SlashStateOptions,
  type SlashStateResult,
  type SlashMenuState
} from "@floatboat/nexus-core";

// 实时预览相关（高级场景）
export type {
  LivePreviewConfig,
  LivePreviewLabels,
  LivePreviewNode,
  LivePreviewNodeType,
  LivePreviewRenderContext,
  LivePreviewRenderer
} from "@floatboat/nexus-core";

// 插件系统相关（高级场景）
export type {
  NexusPlugin,
  WidgetDefinition,
  WidgetRenderContext
} from "@floatboat/nexus-core";

// 解析相关（高级场景）
export type {
  ParseResult,
  ParserLike,
  CodeHighlightToken,
  EditorCommand
} from "@floatboat/nexus-core";
