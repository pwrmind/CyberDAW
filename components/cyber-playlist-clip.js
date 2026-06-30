class CyberPlaylistClip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: absolute;
          background: var(--cyber-clip-bg, #3b5998);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          height: 36px;
          box-sizing: border-box;
          overflow: hidden;
          cursor: move;
        }
        .clip-header {
          background: rgba(0,0,0,0.3);
          color: #fff;
          font-family: var(--cyber-font);
          font-size: 10px;
          padding: 2px 4px;
          white-space: nowrap;
        }
        canvas {
          width: 100%;
          height: calc(100% - 14px);
          display: block;
          opacity: 0.7;
        }
      </style>
      <div class="clip-header" id="title">Pattern</div>
      <canvas id="mini-map"></canvas>
    `;
    this._canvas = this.shadowRoot.getElementById('mini-map');
    this._ctx = this._canvas.getContext('2d');
    this._title = this.shadowRoot.getElementById('title');
    this._notes = [];
    this._instrumentId = 'synth';
  }
  connectedCallback() {
    this._resizeCanvas();
    this._drawMiniNotes();
    this.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('clip-drag-start', {
        detail: {
          clip: this,
          id: this.dataset.id || 'clip',
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          startBeat: parseFloat(this.getAttribute('start-beat')) || 0,
          trackIndex: parseInt(this.getAttribute('track-index')) || 0
        },
        bubbles: true,
        composed: true
      }));
    });
    this.addEventListener('dblclick', () => {
      window.globalBus?.emit('open-piano-roll', {
        instrumentId: this._instrumentId,
        instrumentName: this._title.textContent
      });
    });
  }
  _resizeCanvas() {
    const rect = this.getBoundingClientRect();
    this._canvas.width = rect.width * devicePixelRatio;
    this._canvas.height = (rect.height - 14) * devicePixelRatio;
    this._canvas.style.width = '100%';
    this._canvas.style.height = 'calc(100% - 14px)';
  }
  setClipData(title, color, notes, instrumentId) {
    this._title.textContent = title;
    this.style.setProperty('--cyber-clip-bg', color);
    this._notes = notes || [];
    this._instrumentId = instrumentId || 'synth';
    this._drawMiniNotes();
  }
  _drawMiniNotes() {
    const w = this._canvas.width, h = this._canvas.height;
    this._ctx.clearRect(0, 0, w, h);
    if (!this._notes.length) return;
    this._ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const minPitch = Math.min(...this._notes.map(n=>n.pitch)) - 2;
    const maxPitch = Math.max(...this._notes.map(n=>n.pitch)) + 2;
    const range = maxPitch - minPitch || 1;
    const totalDur = Math.max(...this._notes.map(n=>n.start+n.duration)) || 1;
    this._notes.forEach(note => {
      const x = (note.start / totalDur) * w;
      const width = (note.duration / totalDur) * w;
      const y = (1 - (note.pitch - minPitch) / range) * h;
      this._ctx.fillRect(x, y, width, 2);
    });
  }
}
customElements.define('cyber-playlist-clip', CyberPlaylistClip);
export { CyberPlaylistClip };
