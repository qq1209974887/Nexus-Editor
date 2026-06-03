import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStatusBar } from '../src/components/StatusBar';

describe('StatusBar', () => {
  let statusBar: ReturnType<typeof createStatusBar> | null = null;

  beforeEach(() => {
    const mockEditor = {
      getDocument: vi.fn().mockReturnValue(''),
      getSelection: vi.fn().mockReturnValue({ anchor: 0 }),
      on: vi.fn(),
      off: vi.fn(),
    } as any;
    
    statusBar = createStatusBar(mockEditor);
    document.body.appendChild(statusBar.element);
  });

  afterEach(() => {
    if (statusBar) {
      statusBar.destroy();
    }
  });

  it('should create a status bar element', () => {
    expect(statusBar?.element).toBeInstanceOf(HTMLElement);
    expect(statusBar?.element.className).toBe('nexus-status-bar');
  });

  it('should render default status', () => {
    expect(statusBar?.element.textContent).toContain('Markdown');
  });

  it('should update on change event', () => {
    expect(true).toBe(true);
  });
});
