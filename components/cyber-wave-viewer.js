const waveTemplate = document.createElement('template');
waveTemplate.innerHTML = `
  <style>
    :host {
      display: inline-block;
      width: 100px;
      height: 24px;
      background: #111;
      border: 1px solid #222;
      border-radius: 2px;
      overflow: hidden;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  </style>
  <canvas id="canvas"></canvas>
`;
class CyberWaveViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(waveTemplate.content.cloneNode(true));
    this._canvas = this.shadowRoot.getElementById('canvas');
    this._ctx = this._canvas.getContext('2d');
    this._abort = null;
  }
  connectedCallback() {
    this._resize();
    if (window.globalBus) {
      this._abort = new AbortController();
      const signal = this._abort.signal;
      window.globalBus.on('master-vu-update', () => this._drawWave(), { signal });
    }
    this._drawWave();
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
  }
  _resize() {
    const rect = this.getBoundingClientRect();
    this._canvas.width = rect.width * devicePixelRatio;
    this._canvas.height = rect.height * devicePixelRatio;
    this._canvas.style.width = rect.width + 'px';
    this._canvas.style.height = rect.height + 'px';
  }
  _drawWave() {
    const w = this._canvas.width, h = this._canvas.height;
    this._ctx.clearRect(0, 0, w, h);
    this._ctx.beginPath();
    this._ctx.strokeStyle = '#00ffcc';
    this._ctx.lineWidth = 1;
    for (let i = 0; i < w; i+=2) {
      const y = h/2 + (Math.random() - 0.5) * h * 0.8;
      if (i===0) this._ctx.moveTo(i, y);
      else this._ctx.lineTo(i, y);
    }
    this._ctx.stroke();
  }
}
customElements.define('cyber-wave-viewer', CyberWaveViewer);
export { CyberWaveViewer };
