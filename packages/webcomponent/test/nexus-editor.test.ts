import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NexusEditor } from "../src/nexus-editor";
import { 
  lightTheme, 
  darkTheme, 
  type NexusTheme,
  type EditorAPI,
  type EditorConfig,
  type TocEntry,
  type SlashCommandDef,
  enLocale,
  zhLocale,
  resolveLocale,
  type NexusLocale,
  // Wiki链接相关
  scanWikiLinks,
  type WikiLinkMatch,
  type WikilinksOptions,
  // 事件系统类型
  type EditorEventContext,
  type EditorEventHandler,
  type EditorEventHandlers,
  type EditorEventMap,
  // Markdown工具
  markdownAutoPair,
  markdownFold,
  markdownFoldService,
  markdownKeymap,
  handleMarkdownEnter,
  // Slash命令相关
  computeSlashState,
  filterSlashCommands,
  getSlashMatch,
  type SlashMatch,
  type SlashStateOptions,
  type SlashStateResult,
  type SlashMenuState,
  // 实时预览相关
  type LivePreviewConfig,
  type LivePreviewLabels,
  type LivePreviewNode,
  type LivePreviewNodeType,
  type LivePreviewRenderContext,
  type LivePreviewRenderer,
  // 插件系统相关
  type NexusPlugin,
  type WidgetDefinition,
  type WidgetRenderContext,
  // 解析相关
  type ParseResult,
  type ParserLike,
  type CodeHighlightToken,
  type EditorCommand
} from "../src/index";

describe("@floatboat/nexus-webcomponent", () => {
  beforeEach(() => {
    if (!customElements.get("nexus-editor")) {
      customElements.define("nexus-editor", NexusEditor);
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("NexusEditor Component", () => {
    it("renders an editor with shadow DOM", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      editor.setAttribute("value", "# Hello");
      document.body.appendChild(editor);

      expect(editor.shadowRoot).not.toBeNull();
      expect(editor.shadowRoot?.querySelector(".cm-editor")).not.toBeNull();

      editor.destroy();
    });

    it("exposes core editor API methods", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      editor.setAttribute("value", "start");
      document.body.appendChild(editor);

      editor.setDocument("updated");
      expect(editor.getDocument()).toBe("updated");

      editor.destroy();
    });

    it("supports value attribute binding", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      editor.setAttribute("value", "Initial content");
      expect(editor.value).toBe("Initial content");

      editor.value = "Updated content";
      expect(editor.getAttribute("value")).toBe("Updated content");
      expect(editor.getDocument()).toBe("Updated content");

      editor.destroy();
    });

    it("dispatches change event when content changes", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      const changes: string[] = [];
      editor.addEventListener("change", (e) => {
        changes.push((e as CustomEvent).detail.value);
      });

      editor.setDocument("Changed content");

      expect(changes).toContain("Changed content");

      editor.destroy();
    });

    it("supports theme attribute binding", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      editor.setAttribute("theme", "dark");
      expect(editor.getAttribute("theme")).toBe("dark");

      editor.setAttribute("theme", "light");
      expect(editor.getAttribute("theme")).toBe("light");

      editor.destroy();
    });

    it("supports read-only attribute", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      editor.setAttribute("read-only", "");
      expect(editor.readOnly).toBe(true);

      editor.removeAttribute("read-only");
      expect(editor.readOnly).toBe(false);

      editor.destroy();
    });

    it("supports undo and redo operations", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      editor.setDocument("First");
      editor.setDocument("Second");

      const undoResult = editor.undo();
      expect(typeof undoResult).toBe("boolean");

      const redoResult = editor.redo();
      expect(typeof redoResult).toBe("boolean");

      editor.destroy();
    });

    it("supports getSelection and setSelection", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      editor.setDocument("Hello World");
      document.body.appendChild(editor);

      const selection = editor.getSelection();
      expect(selection).toHaveProperty("anchor");
      expect(selection).toHaveProperty("head");

      editor.setSelection(0, 5);
      const newSelection = editor.getSelection();
      expect(newSelection.anchor).toBe(0);

      editor.destroy();
    });

    it("supports replaceSelection", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      editor.setDocument("Hello World");
      document.body.appendChild(editor);

      editor.setSelection(0, 5);
      editor.replaceSelection("Hi");

      expect(editor.getDocument()).toContain("Hi");

      editor.destroy();
    });

    it("supports exportHTML", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      editor.setDocument("# Heading");
      document.body.appendChild(editor);

      const html = editor.exportHTML();
      expect(typeof html).toBe("string");

      editor.destroy();
    });

    it("supports setDocument with silent option", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      const changes: string[] = [];
      editor.addEventListener("change", (e) => {
        changes.push((e as CustomEvent).detail.value);
      });

      editor.setDocument("Silent update", true);
      
      expect(changes.length).toBe(0);
      expect(editor.getDocument()).toBe("Silent update");

      editor.destroy();
    });

    it("exposes getEditorAPI method", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      const editorAPI = editor.getEditorAPI();
      expect(editorAPI).not.toBeNull();
      expect(typeof editorAPI?.getDocument).toBe("function");
      expect(typeof editorAPI?.setDocument).toBe("function");

      editor.destroy();
    });

    it("supports theme property setter with NexusTheme type", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      const customTheme: NexusTheme = {
        bg: "#ffffff",
        bgSubtle: "#f7f7f7",
        bgMuted: "#e7e7e7",
        text: "#000000",
        textMuted: "#666666",
        textFaint: "#999999",
        border: "#cccccc",
        borderSubtle: "#e0e0e0",
        accent: "#007bff",
        tooltipBg: "#333333",
        tooltipText: "#ffffff",
        hlKeyword: "#c586c0",
        hlString: "#ce9178",
        hlTitle: "#569cd6",
        hlComment: "#6a9955",
        hlNumber: "#b5cea8",
        hlType: "#4ec9b0",
        hlDeletion: "#f14c4c",
        hlVariable: "#9cdcfe",
        fontSize: 16,
      };

      editor.theme = customTheme;
      
      expect(editor.theme.bg).toBe("#ffffff");
      expect(editor.theme.text).toBe("#000000");

      editor.destroy();
    });

    it("handles method calls after destroy", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);
      
      editor.setDocument("Test content");
      expect(editor.getDocument()).toBe("Test content");
      
      editor.destroy();
      
      expect(editor.getDocument()).toBe("");
      expect(editor.undo()).toBe(false);
      expect(editor.redo()).toBe(false);
      expect(editor.getSelection()).toEqual({ anchor: 0, head: 0 });
      expect(editor.getEditorAPI()).toBeNull();
    });

    it("handles multiple attribute changes", () => {
      const editor = document.createElement("nexus-editor") as NexusEditor;
      document.body.appendChild(editor);

      editor.setAttribute("value", "# Test");
      editor.setAttribute("theme", "dark");
      editor.setAttribute("tab-size", "2");
      editor.setAttribute("read-only", "");
      editor.setAttribute("indent-guides", "");
      editor.setAttribute("live-preview", "");

      expect(editor.value).toBe("# Test");
      expect(editor.getAttribute("theme")).toBe("dark");
      expect(editor.getAttribute("tab-size")).toBe("2");
      expect(editor.readOnly).toBe(true);

      editor.destroy();
    });
  });

  describe("Theme Exports", () => {
    it("exports lightTheme and darkTheme", () => {
      expect(lightTheme).toBeDefined();
      expect(darkTheme).toBeDefined();
      expect(typeof lightTheme).toBe("object");
      expect(typeof darkTheme).toBe("object");
    });

    it("theme objects have required properties", () => {
      expect(lightTheme).toHaveProperty("bg");
      expect(lightTheme).toHaveProperty("text");
      expect(lightTheme).toHaveProperty("accent");
      expect(darkTheme).toHaveProperty("bg");
      expect(darkTheme).toHaveProperty("text");
      expect(darkTheme).toHaveProperty("accent");
    });

    it("theme objects have all required properties", () => {
      const themeProps = [
        "bg", "bgSubtle", "bgMuted", "text", "textMuted", "textFaint",
        "border", "borderSubtle", "accent", "tooltipBg", "tooltipText",
        "hlKeyword", "hlString", "hlTitle", "hlComment", "hlNumber",
        "hlType", "hlDeletion", "hlVariable"
      ];
      
      themeProps.forEach(prop => {
        expect(lightTheme).toHaveProperty(prop);
        expect(darkTheme).toHaveProperty(prop);
      });
    });
  });

  describe("Locale Exports", () => {
    it("exports enLocale and zhLocale", () => {
      expect(enLocale).toBeDefined();
      expect(zhLocale).toBeDefined();
    });

    it("exports resolveLocale function", () => {
      expect(typeof resolveLocale).toBe("function");
    });

    it("resolveLocale returns valid locale", () => {
      const locale = resolveLocale();
      expect(locale).toBeDefined();
      expect(locale).toBe(enLocale);
    });

    it("resolveLocale merges partial locale", () => {
      const customLocale = resolveLocale({ openLink: "Open Hyperlink" });
      expect(customLocale).toBeDefined();
      expect(customLocale.openLink).toBe("Open Hyperlink");
      expect(customLocale.addColumn).toBe(enLocale.addColumn);
    });

    it("enLocale and zhLocale have all required properties", () => {
      const localeProps = [
        "addColumn", "addRow", "deleteColumn", "deleteRow",
        "insertColumnBefore", "insertColumnAfter", "insertRowAbove", "insertRowBelow",
        "alignLeft", "alignCenter", "alignRight",
        "foldCode", "unfoldCode", "foldHeading", "unfoldHeading",
        "openLink", "codeBlockLabel"
      ];
      
      localeProps.forEach(prop => {
        expect(enLocale).toHaveProperty(prop);
        expect(zhLocale).toHaveProperty(prop);
      });
    });
  });

  describe("Wiki Links Exports", () => {
    it("exports scanWikiLinks function", () => {
      expect(typeof scanWikiLinks).toBe("function");
    });

    it("scanWikiLinks returns correct structure", () => {
      const content = "[[Page Link]] and [[Another Page|Alias]]";
      const matches = scanWikiLinks(content);
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
      matches.forEach(match => {
        expect(match).toHaveProperty("target");
        expect(match).toHaveProperty("alias");
        expect(match).toHaveProperty("from");
        expect(match).toHaveProperty("to");
      });
    });

    it("exports WikiLinkMatch type", () => {
      const match: WikiLinkMatch = {
        target: "Page",
        alias: "Alias",
        from: 0,
        to: 15,
        display: "Alias",
        displayFrom: 4,
        displayTo: 10
      };
      expect(match.target).toBe("Page");
    });

    it("exports WikilinksOptions type", () => {
      const options: WikilinksOptions = {};
      expect(options).toBeDefined();
    });
  });

  describe("Markdown Tools Exports", () => {
    it("exports markdownAutoPair", () => {
      expect(markdownAutoPair).toBeDefined();
    });

    it("exports markdownFold and markdownFoldService", () => {
      expect(markdownFold).toBeDefined();
      expect(markdownFoldService).toBeDefined();
    });

    it("exports markdownKeymap", () => {
      expect(markdownKeymap).toBeDefined();
    });

    it("exports handleMarkdownEnter", () => {
      expect(typeof handleMarkdownEnter).toBe("function");
    });
  });

  describe("Slash Command Exports", () => {
    it("exports computeSlashState function", () => {
      expect(typeof computeSlashState).toBe("function");
    });

    it("exports filterSlashCommands function", () => {
      expect(typeof filterSlashCommands).toBe("function");
    });

    it("exports getSlashMatch function", () => {
      expect(typeof getSlashMatch).toBe("function");
    });

    it("exports SlashMatch type", () => {
      const match: SlashMatch | null = null;
      expect(match).toBeNull();
    });

    it("exports SlashCommandDef type", () => {
      const command: SlashCommandDef = {
        id: "test-command",
        title: "Test Command",
        keywords: ["test"]
      };
      expect(command.title).toBe("Test Command");
    });
  });

  describe("Type Exports", () => {
    it("exports EditorAPI type", () => {
      const api: EditorAPI | null = null;
      expect(api).toBeNull();
    });

    it("exports EditorConfig type", () => {
      const container = document.createElement("div");
      const config: EditorConfig = { container };
      expect(config).toBeDefined();
      expect(config.container).toBe(container);
    });

    it("exports TocEntry type", () => {
      const entry: TocEntry = { level: 1, text: "Heading", from: 0, to: 7 };
      expect(entry.level).toBe(1);
      expect(entry.text).toBe("Heading");
      expect(entry.from).toBe(0);
    });

    it("exports NexusTheme type", () => {
      const theme: NexusTheme = { ...lightTheme };
      expect(theme.bg).toBeDefined();
    });

    it("exports NexusLocale type", () => {
      const locale: NexusLocale = enLocale;
      expect(locale).toBeDefined();
    });

    it("exports EditorEventContext type", () => {
      const context: EditorEventContext | null = null;
      expect(context).toBeNull();
    });

    it("exports EditorEventHandler type", () => {
      const handler: EditorEventHandler<MouseEvent> = () => {};
      expect(typeof handler).toBe("function");
    });

    it("exports EditorEventHandlers type", () => {
      const handlers: EditorEventHandlers = {};
      expect(handlers).toBeDefined();
    });

    it("exports EditorEventMap type", () => {
      const map: EditorEventMap = {} as EditorEventMap;
      expect(map).toBeDefined();
    });

    it("exports LivePreviewConfig type", () => {
      const config: LivePreviewConfig = {};
      expect(config).toBeDefined();
    });

    it("exports LivePreviewLabels type", () => {
      const labels: LivePreviewLabels = {} as LivePreviewLabels;
      expect(labels).toBeDefined();
    });

    it("exports LivePreviewNode type", () => {
      const node: LivePreviewNode = {} as LivePreviewNode;
      expect(node).toBeDefined();
    });

    it("exports LivePreviewNodeType type", () => {
      const type: LivePreviewNodeType = "link";
      expect(type).toBe("link");
    });

    it("exports NexusPlugin type", () => {
      const plugin: NexusPlugin = {} as NexusPlugin;
      expect(plugin).toBeDefined();
    });

    it("exports WidgetDefinition type", () => {
      const widget: WidgetDefinition = {} as WidgetDefinition;
      expect(widget).toBeDefined();
    });

    it("exports ParseResult type", () => {
      const result: ParseResult = {} as ParseResult;
      expect(result).toBeDefined();
    });

    it("exports ParserLike type", () => {
      const parser: ParserLike = {} as ParserLike;
      expect(parser).toBeDefined();
    });

    it("exports CodeHighlightToken type", () => {
      const token: CodeHighlightToken = {} as CodeHighlightToken;
      expect(token).toBeDefined();
    });

    it("exports EditorCommand type", () => {
      const command: EditorCommand = {} as EditorCommand;
      expect(command).toBeDefined();
    });
  });
});
