class CyberDawWorkspace extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          width: 100vw;
          height: 100vh;
          background: var(--cyber-bg-main);
          font-family: var(--cyber-font);
        }
        .main-area {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .browser-area {
          flex: 0 0 180px;
          height: 100%;
          border-right: 1px solid var(--cyber-border-color);
        }
        .workspace {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        cyber-window { display: none; }
        cyber-window.visible { display: block; }
      </style>
      <cyber-top-bar></cyber-top-bar>
      <div class="main-area">
        <div class="browser-area"><cyber-browser></cyber-browser></div>
        <div class="workspace" id="workspace"></div>
      </div>
      <cyber-audio-engine></cyber-audio-engine>
    `;
    this.windows = {};
  }
  connectedCallback() {
    const workspace = this.shadowRoot.getElementById('workspace');
    const winConfig = [
      { id: 'piano-roll', title: 'Piano Roll', content: 'cyber-piano-roll', w: 600, h: 400 },
      { id: 'channel-rack', title: 'Channel Rack', content: 'cyber-channel-rack', w: 450, h: 300 },
      { id: 'playlist', title: 'Playlist', content: 'cyber-playlist', w: 700, h: 300 },
      { id: 'mixer', title: 'Mixer', content: 'cyber-mixer', w: 500, h: 250 }
    ];
    winConfig.forEach(cfg => {
      const win = document.createElement('cyber-window');
      win.id = `win-${cfg.id}`;
      win.classList.add('visible');
      win.style.width = cfg.w + 'px';
      win.style.height = cfg.h + 'px';
      win.style.left = (50 + Math.random()*100) + 'px';
      win.style.top = (50 + Math.random()*80) + 'px';
      win.setAttribute('active', 'true');
      const header = document.createElement('cyber-window-header');
      header.setAttribute('title', cfg.title);
      win.appendChild(header);
      const content = document.createElement(cfg.content);
      win.appendChild(content);
      workspace.appendChild(win);
      this.windows[cfg.id] = win;
    });
    if (window.globalBus) {
      window.globalBus.on('window-toggle', (data) => {
        const win = this.windows[data.windowId];
        if (win) {
          if (data.visible) {
            win.classList.add('visible');
            win.style.display = 'block';
          } else {
            win.classList.remove('visible');
            win.style.display = 'none';
          }
        }
      });
      window.globalBus.on('open-piano-roll', (data) => {
        const win = this.windows['piano-roll'];
        if (win) {
          win.classList.add('visible');
          win.style.display = 'block';
          const header = win.querySelector('cyber-window-header');
          if (header) header.setAttribute('title', `Piano Roll - ${data.instrumentName || 'Synth'}`);
          const topBar = document.querySelector('cyber-top-bar');
          if (topBar) {
            const btn = topBar.shadowRoot?.querySelector('#toggle-piano-roll');
            if (btn) btn.setAttribute('active', 'true');
          }
        }
      });
    }
    setTimeout(() => {
      Object.values(this.windows).forEach(w => {
        w.classList.add('visible');
        w.style.display = 'block';
      });
    }, 200);
    window.daw = this;
  }
}
customElements.define('cyber-daw-workspace', CyberDawWorkspace);
export { CyberDawWorkspace };
