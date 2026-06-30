class CyberMixer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          background: var(--cyber-bg-main);
          padding: 8px;
          gap: 12px;
          font-family: var(--cyber-font);
          height: 100%;
          align-items: flex-end;
          overflow-x: auto;
        }
      </style>
      <div id="mixer" style="display:flex;gap:12px;"></div>
    `;
  }
  connectedCallback() {
    const container = this.shadowRoot.getElementById('mixer');
    const channels = ['Master', 'Kick', 'Snare', 'Hat'];
    channels.forEach(name => {
      const strip = document.createElement('cyber-mixer-strip');
      strip.setAttribute('name', name);
      strip.setAttribute('channel-id', name.toLowerCase());
      container.appendChild(strip);
    });
  }
}
customElements.define('cyber-mixer', CyberMixer);
export { CyberMixer };
