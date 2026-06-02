import { createEditor, lightTheme, type EditorAPI, type EditorConfig, type NexusTheme } from "@floatboat/nexus-core";

export class NexusEditor extends HTMLElement {
  private container: HTMLDivElement | null = null;
  private editor: EditorAPI | null = null;
  private _theme: NexusTheme = lightTheme;
  private _value: string = "";
  private _readOnly: boolean = false;
  private _tabSize: number = 4;
  private _indentGuides: boolean = false;

  static observedAttributes = [
    "value",
    "theme",
    "read-only",
    "tab-size",
    "indent-guides"
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.initEditor();
  }

  disconnectedCallback() {
    this.destroyEditor();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case "value":
        this._value = newValue;
        this.updateValue();
        break;
      case "theme":
        this.setThemeByName(newValue);
        break;
      case "read-only":
        this._readOnly = newValue !== null;
        break;
      case "tab-size":
        this._tabSize = parseInt(newValue) || 4;
        break;
      case "indent-guides":
        this._indentGuides = newValue !== null;
        break;
    }
  }

  get value(): string {
    return this.editor?.getDocument() || this._value;
  }

  set value(newValue: string) {
    this._value = newValue;
    this.setAttribute("value", newValue);
    this.updateValue();
  }

  get theme(): NexusTheme {
    return this._theme;
  }

  set theme(newTheme: NexusTheme) {
    this._theme = newTheme;
    this.editor?.setTheme(newTheme);
  }

  get readOnly(): boolean {
    return this._readOnly;
  }

  set readOnly(value: boolean) {
    this._readOnly = value;
    this.setAttribute("read-only", value ? "" : "");
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        .editor-container {
          width: 100%;
          height: 100%;
          min-height: 200px;
        }
      </style>
      <div class="editor-container"></div>
    `;

    this.container = this.shadowRoot.querySelector(".editor-container");
  }

  private initEditor() {
    if (!this.container) return;

    const config: EditorConfig = {
      container: this.container,
      initialValue: this._value,
      theme: this._theme,
      readOnly: this._readOnly,
      tabSize: this._tabSize,
      indentGuides: this._indentGuides,
      onChange: (markdown) => {
        this._value = markdown;
        this.dispatchEvent(new CustomEvent("change", {
          detail: { value: markdown },
          bubbles: true,
          composed: true
        }));
      },
      onFocus: () => {
        this.dispatchEvent(new CustomEvent("focus", {
          bubbles: true,
          composed: true
        }));
      },
      onBlur: () => {
        this.dispatchEvent(new CustomEvent("blur", {
          bubbles: true,
          composed: true
        }));
      }
    };

    this.editor = createEditor(config);
  }

  private destroyEditor() {
    this.editor?.destroy();
    this.editor = null;
  }

  private updateValue() {
    if (this.editor && this._value !== this.editor.getDocument()) {
      this.editor.setDocument(this._value);
    }
  }

  private setThemeByName(themeName: string) {
    const themes: Record<string, NexusTheme> = {
      light: lightTheme,
      dark: lightTheme
    };
    this.theme = themes[themeName] || lightTheme;
  }

  focus(): void {
    this.editor?.focus();
  }

  blur(): void {
    this.editor?.blur();
  }

  undo(): boolean {
    return this.editor?.undo() ?? false;
  }

  redo(): boolean {
    return this.editor?.redo() ?? false;
  }

  getDocument(): string {
    return this.editor?.getDocument() ?? "";
  }

  setDocument(value: string, silent?: boolean): void {
    this.editor?.setDocument(value, { silent });
  }

  getSelection(): { anchor: number; head: number } {
    return this.editor?.getSelection() ?? { anchor: 0, head: 0 };
  }

  setSelection(anchor: number, head?: number): void {
    this.editor?.setSelection(anchor, head);
  }

  replaceSelection(text: string): void {
    this.editor?.replaceSelection(text);
  }

  exportHTML(): string {
    return this.editor?.exportHTML() ?? "";
  }

  destroy(): void {
    this.destroyEditor();
  }
}

customElements.define("nexus-editor", NexusEditor);
