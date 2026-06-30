class CyberWindow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: absolute;
          min-width: 200px;
          min-height: 150px;
          z-index: 10;
          display: block;
          box-shadow: 0 4px 20px rgba(0,0,0,0.8);
        }
      </style>
      <cyber-border-panel id="border" active="false">
        <slot></slot>
      </cyber-border-panel>
    `;
    this._border = this.shadowRoot.getElementById('border');
    this._abort = null;
    this._isMaximized = false;
    this._savedRect = null;
  }
  connectedCallback() {
    this.addEventListener('mousedown', () => this.focus());
    this.addEventListener('window-close-clicked', () => {
      this.style.display = 'none';
      window.globalBus?.emit('window-toggle', { windowId: this.id, visible: false });
    });
    this.addEventListener('window-minimize-clicked', () => {
      this.style.display = 'none';
      window.globalBus?.emit('window-toggle', { windowId: this.id, visible: false });
    });
    this.addEventListener('window-maximize-clicked', () => {
      this._toggleMaximize();
    });
    const header = this.querySelector('cyber-window-header');
    if (header) {
      header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'CYBER-BUTTON') return;
        this._startDrag(e);
      });
    }
    if (window.globalBus) {
      this._abort = new AbortController();
      const signal = this._abort.signal;
      window.globalBus.on('window-focused', (data) => {
        if (data.windowId !== this.id) this._border.setAttribute('active', 'false');
      }, { signal });
    }
    if (this.hasAttribute('active')) this._border.setAttribute('active', 'true');
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
  }
  focus() {
    const allWindows = document.querySelectorAll('cyber-window');
    allWindows.forEach(win => win.style.zIndex = '10');
    this.style.zIndex = '100';
    this._border.setAttribute('active', 'true');
    window.globalBus?.emit('window-focused', { windowId: this.id });
  }
  _toggleMaximize() {
    if (this._isMaximized) {
      if (this._savedRect) {
        this.style.left = this._savedRect.left + 'px';
        this.style.top = this._savedRect.top + 'px';
        this.style.width = this._savedRect.width + 'px';
        this.style.height = this._savedRect.height + 'px';
      }
      this._isMaximized = false;
    } else {
      const rect = this.getBoundingClientRect();
      this._savedRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      const workspace = this.parentElement;
      if (workspace) {
        const wsRect = workspace.getBoundingClientRect();
        this.style.left = '0px';
        this.style.top = '0px';
        this.style.width = wsRect.width + 'px';
        this.style.height = wsRect.height + 'px';
      }
      this._isMaximized = true;
    }
  }
  _startDrag(e) {
    e.preventDefault();
    const rect = this.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    if (this._isMaximized) {
      this._isMaximized = false;
      if (this._savedRect) {
        this.style.left = this._savedRect.left + 'px';
        this.style.top = this._savedRect.top + 'px';
        this.style.width = this._savedRect.width + 'px';
        this.style.height = this._savedRect.height + 'px';
      }
    }
    const onMove = (ev) => {
      this.style.left = (ev.clientX - startX) + 'px';
      this.style.top = (ev.clientY - startY) + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
}
customElements.define('cyber-window', CyberWindow);
export { CyberWindow };
