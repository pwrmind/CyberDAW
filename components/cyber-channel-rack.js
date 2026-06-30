class CyberChannelRack extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: var(--cyber-bg-main);
          border: 1px solid var(--cyber-border-color);
          border-radius: 6px;
          padding: 8px;
          min-width: 400px;
          font-family: var(--cyber-font);
        }
        .title { color: var(--cyber-accent-cyan); font-size: 12px; margin-bottom: 6px; }
      </style>
      <div class="title">🎛️ CHANNEL RACK</div>
      <div id="strips"></div>
    `;
  }
  connectedCallback() {
    const container = this.shadowRoot.getElementById('strips');
    const instruments = [
      { id: 'kick', name: 'Kick' },
      { id: 'snare', name: 'Snare' },
      { id: 'hat', name: 'Hi-Hat' }
    ];
    instruments.forEach(inst => {
      const strip = document.createElement('cyber-channel-strip');
      strip.setAttribute('id', inst.id);
      strip.setAttribute('name', inst.name);
      container.appendChild(strip);
    });
  }
}
customElements.define('cyber-channel-rack', CyberChannelRack);
export { CyberChannelRack };
