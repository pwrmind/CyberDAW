class CyberBrowser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: var(--cyber-bg-dark);
          border-right: 1px solid var(--cyber-border-color);
          padding: 8px;
          width: 180px;
          font-family: var(--cyber-font);
          height: 100%;
          overflow-y: auto;
        }
        .folder { color: var(--cyber-text-muted); font-size: 11px; text-transform: uppercase; margin: 6px 0; }
        .item {
          padding: 4px 6px;
          margin: 2px 0;
          background: var(--cyber-bg-light);
          border: 1px solid var(--cyber-border-color);
          border-radius: 3px;
          cursor: grab;
          color: var(--cyber-text-main);
          font-size: 11px;
          transition: background 0.1s;
        }
        .item:hover { background: #333; border-color: var(--cyber-accent-cyan); }
      </style>
      <div class="folder">📁 Plugins</div>
      <div id="list"></div>
    `;
  }
  connectedCallback() {
    const list = this.shadowRoot.getElementById('list');
    const plugins = [
      { name: '🛸 Delay', tag: 'cyber-plugin-delay' },
      { name: '🔥 Distortion', tag: 'cyber-plugin-dist' },
      { name: '🎚️ EQ', tag: 'cyber-plugin-eq' }
    ];
    plugins.forEach(p => {
      const item = document.createElement('div');
      item.className = 'item';
      item.textContent = p.name;
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', p.tag);
        window.globalBus?.emit('show-hint', `Перетащите ${p.name} на слот эффекта`);
      });
      item.addEventListener('dragend', () => {
        window.globalBus?.emit('clear-hint');
      });
      list.appendChild(item);
    });
  }
}
customElements.define('cyber-browser', CyberBrowser);
export { CyberBrowser };
