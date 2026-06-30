class CyberWindowHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: linear-gradient(90deg, #1f1f24, #151518);
          border-bottom: 1px solid var(--cyber-border-color);
          padding: 4px 8px;
          user-select: none;
          cursor: move;
          font-family: var(--cyber-font);
          font-size: 12px;
          color: var(--cyber-text-main);
        }
        .layout {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title { font-weight: bold; letter-spacing: 0.5px; }
        .controls { display: flex; gap: 4px; }
      </style>
      <div class="layout">
        <span class="title" id="title">Window</span>
        <div class="controls">
          <cyber-button id="minimize">_</cyber-button>
          <cyber-button id="maximize">⬜</cyber-button>
          <cyber-button id="close">✕</cyber-button>
        </div>
      </div>
    `;
    this._title = this.shadowRoot.getElementById('title');
  }
  static get observedAttributes() { return ['title']; }
  connectedCallback() {
    this._title.textContent = this.getAttribute('title') || 'Window';
    this.shadowRoot.getElementById('close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('window-close-clicked', { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('window-minimize-clicked', { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('window-maximize-clicked', { bubbles: true, composed: true }));
    });
  }
  attributeChangedCallback() {
    if (this._title) this._title.textContent = this.getAttribute('title') || 'Window';
  }
}
customElements.define('cyber-window-header', CyberWindowHeader);
export { CyberWindowHeader };
