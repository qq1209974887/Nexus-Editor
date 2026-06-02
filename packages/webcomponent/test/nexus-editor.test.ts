import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NexusEditor } from "../src/nexus-editor";

describe("@floatboat/nexus-webcomponent", () => {
  beforeEach(() => {
    if (!customElements.get("nexus-editor")) {
      customElements.define("nexus-editor", NexusEditor);
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders an editor into the provided container", () => {
    const editor = document.createElement("nexus-editor") as NexusEditor;
    editor.setAttribute("value", "# Hello");
    document.body.appendChild(editor);

    expect(editor.shadowRoot?.querySelector(".cm-editor")).not.toBeNull();
    expect(editor.shadowRoot?.querySelector("[contenteditable='true']")).not.toBeNull();

    editor.destroy();

    expect(editor.shadowRoot?.querySelector(".cm-editor")).toBeNull();
  });

  it("exposes the core editor api", () => {
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

  it("can be used declaratively in HTML", () => {
    document.body.innerHTML = `
      <nexus-editor value="# Hello" theme="light"></nexus-editor>
    `;

    const editor = document.querySelector("nexus-editor") as NexusEditor;
    expect(editor).not.toBeNull();
    expect(editor.value).toBe("# Hello");

    editor?.destroy();
  });
});
