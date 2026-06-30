class CyberTopBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          background: var(--cyber-bg-dark);
          border-bottom: 1px solid var(--cyber-border-color);
          padding: 4px 12px;
          gap: 12px;
          height: 40px;
          font-family: var(--cyber-font);
        }
        .group { display: flex; align-items: center; gap: 6px; }
        .spacer { flex:1; }
      </style>
      <div class="group">
        <cyber-hint-panel></cyber-hint-panel>
      </div>
      <div class="group">
        <cyber-button id="play" toggle>▶</cyber-button>
        <cyber-button id="stop">⏹</cyber-button>
        <cyber-button id="record" style="color:var(--cyber-accent-red);">●</cyber-button>
        <cyber-button id="loop" toggle>🔁</cyber-button>
      </div>
      <div class="group">
        <cyber-numeric-display id="bpm" value="130"></cyber-numeric-display>
        <cyber-wave-viewer></cyber-wave-viewer>
        <cyber-vu-meter channel="master" style="height:20px;width:60px;"></cyber-vu-meter>
      </div>
      <div class="spacer"></div>
      <div class="group">
        <cyber-button id="toggle-piano-roll" toggle>🎹</cyber-button>
        <cyber-button id="toggle-mixer" toggle>🎛️</cyber-button>
        <cyber-button id="toggle-playlist" toggle>📋</cyber-button>
        <cyber-button id="toggle-channel-rack" toggle>🥁</cyber-button>
      </div>
    `;
    this._isPlaying = false;
    this._loopEnabled = false;
    this._abort = null;
  }
  connectedCallback() {
    this.playBtn = this.shadowRoot.getElementById('play');
    this.stopBtn = this.shadowRoot.getElementById('stop');
    this.loopBtn = this.shadowRoot.getElementById('loop');

    this.playBtn.addEventListener('toggle-change', (e) => {
      this._isPlaying = e.detail.active;
      window.globalBus?.emit('daw-play-toggle', { isPlaying: this._isPlaying });
    });
    this.stopBtn.addEventListener('click', () => {
      if (this._isPlaying) {
        this.playBtn.setAttribute('active', 'false');
        this._isPlaying = false;
        window.globalBus?.emit('daw-stop', { resetToStart: true });
        window.globalBus?.emit('daw-play-toggle', { isPlaying: false });
      }
    });
    this.loopBtn.addEventListener('toggle-change', (e) => {
      this._loopEnabled = e.detail.active;
      window.globalBus?.emit('timeline-loop-changed', {
        isEnabled: this._loopEnabled,
        loopStart: 0,
        loopEnd: 4
      });
    });

    const toggleWindow = (id) => {
      const btn = this.shadowRoot.querySelector(`#toggle-${id}`);
      if (!btn) return;
      const visible = btn.hasAttribute('active');
      window.globalBus?.emit('window-toggle', { windowId: id, visible });
    };
    this.shadowRoot.getElementById('toggle-piano-roll').addEventListener('toggle-change', () => toggleWindow('piano-roll'));
    this.shadowRoot.getElementById('toggle-mixer').addEventListener('toggle-change', () => toggleWindow('mixer'));
    this.shadowRoot.getElementById('toggle-playlist').addEventListener('toggle-change', () => toggleWindow('playlist'));
    this.shadowRoot.getElementById('toggle-channel-rack').addEventListener('toggle-change', () => toggleWindow('channel-rack'));

    if (window.globalBus) {
      this._abort = new AbortController();
      const signal = this._abort.signal;
      window.globalBus.on('daw-play-toggle', (data) => {
        if (!data.isPlaying && this._isPlaying) {
          this.playBtn.setAttribute('active', 'false');
          this._isPlaying = false;
        }
      }, { signal });
      window.globalBus.on('window-toggle', (data) => {
        const idMap = {
          'piano-roll': 'toggle-piano-roll',
          'mixer': 'toggle-mixer',
          'playlist': 'toggle-playlist',
          'channel-rack': 'toggle-channel-rack'
        };
        const btnId = idMap[data.windowId];
        if (!btnId) return;
        const btn = this.shadowRoot?.querySelector(`#${btnId}`);
        if (btn) {
          if (data.visible) btn.setAttribute('active', 'true');
          else btn.setAttribute('active', 'false');
        }
      }, { signal });
    }

    setTimeout(() => {
      ['piano-roll','mixer','playlist','channel-rack'].forEach(id => {
        const btn = this.shadowRoot.querySelector(`#toggle-${id}`);
        if (btn) btn.setAttribute('active', 'true');
        window.globalBus?.emit('window-toggle', { windowId: id, visible: true });
      });
    }, 100);
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
  }
}
customElements.define('cyber-top-bar', CyberTopBar);
export { CyberTopBar };
