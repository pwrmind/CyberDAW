class CyberMixerStrip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--cyber-bg-dark);
          padding: 6px;
          border-radius: 4px;
          border: 1px solid var(--cyber-border-color);
          width: 60px;
          min-height: 200px;
          gap: 4px;
        }
        .name { font-size: 10px; color: var(--cyber-text-muted); }
      </style>
      <div class="name" id="name">Channel</div>
      <cyber-vu-meter channel="master" style="height:60px;width:8px;"></cyber-vu-meter>
      <cyber-slider id="slider" value="0.8" style="height:80px;"></cyber-slider>
      <cyber-fx-slot channel-id="master" style="width:100%;height:30px;"></cyber-fx-slot>
    `;
    this._name = this.shadowRoot.getElementById('name');
  }
  connectedCallback() {
    const name = this.getAttribute('name') || 'Channel';
    this._name.textContent = name;
    const channelId = this.getAttribute('channel-id') || 'master';
    this.shadowRoot.querySelector('cyber-vu-meter').setAttribute('channel', channelId);
    this.shadowRoot.querySelector('cyber-fx-slot').setAttribute('channel-id', channelId);
  }
}
customElements.define('cyber-mixer-strip', CyberMixerStrip);
export { CyberMixerStrip };
