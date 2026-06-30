class CyberHintPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          background: var(--cyber-bg-dark);
          border: 1px solid var(--cyber-border-color);
          color: var(--cyber-text-muted);
          font-family: var(--cyber-font);
          font-size: 11px;
          padding: 4px 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 250px;
          height: 24px;
          line-height: 24px;
          box-sizing: border-box;
        }
        .default { color: var(--cyber-text-muted); font-style: italic; }
      </style>
      <div id="text" class="default">Наведите на элемент для подсказки...</div>
    `;
    this._text = this.shadowRoot.getElementById('text');
    this._abort = null;
  }
  connectedCallback() {
    if (window.globalBus) {
      this._abort = new AbortController();
      const signal = this._abort.signal;
      window.globalBus.on('show-hint', (data) => {
        this._text.textContent = data.text || '';
        this._text.classList.remove('default');
      }, { signal });
      window.globalBus.on('clear-hint', () => {
        this._text.textContent = 'Наведите на элемент для подсказки...';
        this._text.classList.add('default');
      }, { signal });
    }
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
  }
}
customElements.define('cyber-hint-panel', CyberHintPanel);
export { CyberHintPanel };
