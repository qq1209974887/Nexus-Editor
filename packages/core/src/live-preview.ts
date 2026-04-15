import { RangeSetBuilder, type Extension, type SelectionRange } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin, WidgetType } from "@codemirror/view";
import type { Content, Parent, Root } from "mdast";

import type {
  LivePreviewConfig,
  LivePreviewNode,
  LivePreviewNodeType,
  LivePreviewRenderContext,
  LivePreviewRenderer,
  ParserLike
} from "./types";

interface NormalizedLivePreviewConfig {
  enabled: boolean;
  renderers: Partial<Record<LivePreviewNodeType, LivePreviewRenderer>>;
}

function createEmptyAst(): Root {
  return {
    type: "root",
    children: []
  };
}

function parseDocument(parser: ParserLike, markdown: string): Root {
  try {
    return parser.parse(markdown);
  } catch {
    return createEmptyAst();
  }
}

function normalizeConfig(
  config: boolean | LivePreviewConfig | undefined
): NormalizedLivePreviewConfig {
  if (!config) {
    return {
      enabled: false,
      renderers: {}
    };
  }

  if (config === true) {
    return {
      enabled: true,
      renderers: {}
    };
  }

  return {
    enabled: config.enabled ?? true,
    renderers: config.renderers ?? {}
  };
}

function getText(node: Content): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }

  if (node.type === "image") {
    return node.alt ?? "";
  }

  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map((child) => getText(child)).join("");
  }

  return "";
}

function createDefaultRenderer(context: LivePreviewRenderContext): HTMLElement {
  switch (context.node.type) {
    case "strong": {
      const element = document.createElement("strong");
      element.textContent = context.text;
      return element;
    }
    case "emphasis": {
      const element = document.createElement("em");
      element.textContent = context.text;
      return element;
    }
    case "inlineCode": {
      const element = document.createElement("code");
      element.textContent = context.text;
      return element;
    }
    case "link": {
      const element = document.createElement("a");
      element.textContent = context.text;
      element.href = context.node.url;
      element.rel = "noopener noreferrer";
      return element;
    }
    case "heading": {
      const element = document.createElement(`h${context.node.depth}`);
      element.textContent = context.text;
      element.style.display = "block";
      return element;
    }
    case "blockquote": {
      const element = document.createElement("blockquote");
      element.textContent = context.text;
      element.style.display = "block";
      return element;
    }
    case "image": {
      const wrapper = document.createElement("span");
      const label = document.createElement("span");
      const element = document.createElement("img");
      wrapper.setAttribute("data-live-preview-image", context.node.url);
      element.src = context.node.url;
      element.alt = context.node.alt ?? "";
      label.textContent = context.node.alt ?? context.node.url;
      wrapper.appendChild(label);
      wrapper.appendChild(element);
      return wrapper;
    }
  }
}

function renderNode(
  node: LivePreviewNode,
  source: string,
  renderers: Partial<Record<LivePreviewNodeType, LivePreviewRenderer>>
): HTMLElement {
  const context: LivePreviewRenderContext = {
    node,
    nodeType: node.type,
    source,
    text: getText(node)
  };

  return renderers[node.type]?.(context) ?? createDefaultRenderer(context);
}

function isLivePreviewNode(node: Content): node is LivePreviewNode {
  return (
    node.type === "blockquote" ||
    node.type === "emphasis" ||
    node.type === "heading" ||
    node.type === "inlineCode" ||
    node.type === "link" ||
    node.type === "strong"
  );
}

function selectionIntersects(
  from: number,
  to: number,
  selection: readonly SelectionRange[]
): boolean {
  return selection.some((range) => {
    const rangeFrom = Math.min(range.anchor, range.head);
    const rangeTo = Math.max(range.anchor, range.head);

    if (range.empty) {
      return range.anchor >= from && range.anchor < to;
    }

    return rangeFrom < to && from < rangeTo;
  });
}

function createWidget(element: HTMLElement): WidgetType {
  return new (class extends WidgetType {
    toDOM() {
      return element;
    }

    ignoreEvent() {
      return false;
    }
  })();
}

function addImageDecorations(
  doc: string,
  selection: readonly SelectionRange[],
  builder: RangeSetBuilder<Decoration>,
  renderers: Partial<Record<LivePreviewNodeType, LivePreviewRenderer>>
) {
  const pattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;

  for (const match of doc.matchAll(pattern)) {
    const from = match.index ?? 0;
    const source = match[0];
    const to = from + source.length;

    if (selectionIntersects(from, to, selection)) {
      continue;
    }

    const widget = createWidget(
      renderNode(
        {
          type: "image",
          alt: match[1] || null,
          url: match[2],
          title: match[3] || null
        },
        source,
        renderers
      )
    );

    builder.add(
      from,
      to,
      Decoration.replace({
        widget
      })
    );
  }
}

function visit(
  node: Parent | Root,
  doc: string,
  selection: readonly SelectionRange[],
  builder: RangeSetBuilder<Decoration>,
  renderers: Partial<Record<LivePreviewNodeType, LivePreviewRenderer>>
): void {
  for (const child of node.children) {
    const from = child.position?.start.offset;
    const to = child.position?.end.offset;

    if (typeof from === "number" && typeof to === "number" && isLivePreviewNode(child)) {
      if (!selectionIntersects(from, to, selection)) {
        const widget = createWidget(renderNode(child, doc.slice(from, to), renderers));
        builder.add(
          from,
          to,
          Decoration.replace({
            widget
          })
        );
        continue;
      }
    }

    if ("children" in child && Array.isArray(child.children)) {
      visit(child, doc, selection, builder, renderers);
    }
  }
}

function buildDecorations(
  view: EditorView,
  parser: ParserLike,
  config: NormalizedLivePreviewConfig
) {
  if (!config.enabled) {
    return Decoration.none;
  }

  const doc = view.state.doc.toString();
  const ast = parseDocument(parser, doc);
  const builder = new RangeSetBuilder<Decoration>();

  visit(ast, doc, view.state.selection.ranges, builder, config.renderers);
  addImageDecorations(doc, view.state.selection.ranges, builder, config.renderers);

  return builder.finish();
}

export function createLivePreviewExtension(
  parser: ParserLike,
  config: boolean | LivePreviewConfig | undefined
): Extension[] {
  const normalized = normalizeConfig(config);

  if (!normalized.enabled) {
    return [];
  }

  const plugin = ViewPlugin.fromClass(
    class {
      decorations;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, parser, normalized);
      }

      update(update: { docChanged: boolean; selectionSet: boolean; view: EditorView }) {
        if (update.docChanged || update.selectionSet) {
          this.decorations = buildDecorations(update.view, parser, normalized);
        }
      }
    },
    {
      decorations: (value) => value.decorations
    }
  );

  return [plugin];
}
