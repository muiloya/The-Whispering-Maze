import * as THREE from 'three';

/**
 * TextManager: lightweight on-screen text UI
 * - Reuses existing elements via updateText
 * - Built-in auto-clear with duration
 * - Simplified styling and positioning
 */
export class TextManager {
  constructor() {
    this.textElements = new Map();
    this.defaultStyle = {
      position: 'absolute',
      color: 'white',
      fontSize: '20px',
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '6px 10px',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: 1000,
      transform: 'translateX(-50%)',
      left: '50%',
      bottom: '10%'
    };
  }

  /**
   * Create or update a text element
   * @param {string} id unique key for the text
   * @param {string} content text content
   * @param {Object} [options] positioning and style overrides
   * @param {number} [duration] ms to auto-remove (no removal if omitted)
   */
  createText(id, content, options = {}, duration) {
    let el;
    if (this.textElements.has(id)) {
      el = this.textElements.get(id);
    } else {
      el = document.createElement('div');
      Object.assign(el.style, this.defaultStyle);
      document.body.appendChild(el);
      this.textElements.set(id, el);
    }

    el.textContent = content;
    // position overrides (left/top/bottom/right)
    if (options.position) {
      const { x, y } = options.position;
      el.style.left = x != null ? `${x}px` : el.style.left;
      el.style.top  = y != null ? `${y}px` : el.style.top;
    }
    // style overrides
    if (options.style) {
      Object.assign(el.style, options.style);
    }

    // clear previous timeout if any
    if (el._timeoutId) {
      clearTimeout(el._timeoutId);
      el._timeoutId = null;
    }
    if (duration) {
      el._timeoutId = setTimeout(() => this.removeText(id), duration);
    }

    return el;
  }

  /**
   * Remove a text element by id
   */
  removeText(id) {
    const el = this.textElements.get(id);
    if (el) {
      if (el._timeoutId) clearTimeout(el._timeoutId);
      document.body.removeChild(el);
      this.textElements.delete(id);
    }
  }

  /**
   * Clear all texts
   */
  removeAll() {
    for (const id of Array.from(this.textElements.keys())) {
      this.removeText(id);
    }
  }
}
