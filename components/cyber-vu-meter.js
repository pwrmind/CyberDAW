const vuTemplate = document.createElement('template');
vuTemplate.innerHTML = `
  <style>
    :host {
      display: inline-block;
      width: 12px;
      height: 100%;
      background: #111;
      border: 1px solid #222;
      border-radius: 2px;
      position: relative;
      overflow: hidden;
    }
    .led-grid {
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, #00ff66 0%, #ff9900 70%, #ff3355 90%);
      position: absolute;
      bottom: 0;
      transform: translateY(100%);
      will-change: transform;
      transition: transform 0.05s ease-out;
    }
    .led-mask {
      position: absolute;
      top:0;left:0;width:100%;height:100%;
      background-image: linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px);
      background-size: 100% 4px;
    }
  </style>
  <div class="led-grid" id="bar"></div>
  <div class="led-mask"></div>
`;
class CyberVuMeter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(vuTemplate.content.cloneNode(true));
    this._level = 0;
    this._bar = this.shadowRoot.getElementById('bar');
    this._abort = null;
  }
  connectedCallback() {
    const channel = this.getAttribute('channel') || 'master';
    if (window.globalBus) {
      this._abort = new AbortController();
      const signal = this._abort.signal;
      if (channel === 'master') {
        window.globalBus.on('master-vu-update', (data) => this.setLevel(data.volume), { signal });
      }
      window.globalBus.on('daw-play-toggle', (data) => {
        if (!data.isPlaying) this.setLevel(0);
      }, { signal });
    }
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
  }
  setLevel(percent) {
    this._level = Math.max(0, Math.min(100, percent));
    const y = 100 - this._level;
    this._bar.style.transform = `translateY(${y}%)`;
    if (this._level > 85) {
      this.style.boxShadow = '0 0 8px rgba(255,51,51,0.4)';
    } else {
      this.style.boxShadow = 'none';
    }
  }
}
customElements.define('cyber-vu-meter', CyberVuMeter);
export { CyberVuMeter };
