class CyberPlaylist extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; background: var(--cyber-bg-main); font-family: var(--cyber-font); width: 100%; height: 100%; overflow: auto; }
        .playlist-container { position: relative; }
        .track { height: 40px; border-bottom: 1px solid var(--cyber-border-color); position: relative; background: var(--cyber-bg-dark); }
        .track .label { position: absolute; left: 4px; top: 50%; transform: translateY(-50%); font-size: 10px; color: var(--cyber-text-muted); }
      </style>
      <cyber-timeline-ruler></cyber-timeline-ruler>
      <div class="playlist-container" id="playlist"></div>
    `;
    this._abort = null;
  }
  connectedCallback() {
    const container = this.shadowRoot.getElementById('playlist');
    for (let i = 1; i <= 4; i++) {
      const track = document.createElement('div');
      track.className = 'track';
      track.style.position = 'relative';
      track.innerHTML = `<div class="label">Track ${i}</div>`;
      container.appendChild(track);
    }
    const clip = document.createElement('cyber-playlist-clip');
    clip.setAttribute('start-beat', '2');
    clip.setAttribute('track-index', '0');
    clip.style.left = '80px';
    clip.style.top = '2px';
    clip.style.width = '160px';
    clip.setClipData('Kick Pattern', '#3b5998', [
      { pitch: 60, start: 0, duration: 0.25 },
      { pitch: 60, start: 0.5, duration: 0.25 },
      { pitch: 60, start: 1, duration: 0.25 }
    ], 'kick');
    container.querySelector('.track').appendChild(clip);

    if (window.globalBus) {
      this._abort = new AbortController();
      const signal = this._abort.signal;
      window.globalBus.on('time-tick', (data) => {
        let ph = this.shadowRoot.getElementById('playhead');
        if (!ph) {
          ph = document.createElement('div');
          ph.id = 'playhead';
          ph.style.cssText = 'position:absolute;left:0;top:0;width:2px;height:100%;background:var(--cyber-accent-cyan);box-shadow:0 0 8px var(--cyber-accent-cyan);pointer-events:none;z-index:10;';
          container.style.position = 'relative';
          container.appendChild(ph);
        }
        const pxPerBeat = 40;
        const x = data.totalBeats * pxPerBeat;
        ph.style.transform = `translateX(${x}px)`;
      }, { signal });
    }
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
  }
}
customElements.define('cyber-playlist', CyberPlaylist);
export { CyberPlaylist };
