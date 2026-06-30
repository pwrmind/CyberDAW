class CyberFxSlot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 40px;
          background: var(--cyber-bg-dark);
          border: 1px dashed var(--cyber-border-color);
          border-radius: 4px;
          margin-bottom: 4px;
          box-sizing: border-box;
          transition: background 0.15s, border-color 0.15s;
        }
        :host(.drag-over) {
          background: rgba(0,255,204,0.05);
          border-color: var(--cyber-accent-cyan);
          box-shadow: 0 0 8px var(--cyber-accent-glow);
        }
        .slot-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cyber-text-muted);
          font-size: 10px;
        }
      </style>
      <div class="slot-content" id="content">(empty)</div>
    `;
    this._content = this.shadowRoot.getElementById('content');
    this.channelId = this.getAttribute('channel-id') || 'master';
  }
  connectedCallback() {
    this.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.classList.add('drag-over');
    });
    this.addEventListener('dragleave', () => this.classList.remove('drag-over'));
    this.addEventListener('drop', (e) => {
      e.preventDefault();
      this.classList.remove('drag-over');
      const pluginTag = e.dataTransfer.getData('text/plain');
      if (pluginTag && pluginTag.startsWith('cyber-plugin-')) {
        this.loadPlugin(pluginTag);
      }
    });
  }
  loadPlugin(tag) {
    this._content.innerHTML = '';
    const plugin = document.createElement(tag);
    this._content.appendChild(plugin);
    window.globalBus?.emit('plugin-inserted', {
      channelId: this.channelId,
      pluginTag: tag,
      pluginInstance: plugin
    });
  }
}
customElements.define('cyber-fx-slot', CyberFxSlot);
export { CyberFxSlot };
