class CyberKeyStrip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const isBlack = this.hasAttribute('black');
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; height: 20px; box-sizing: border-box; position: relative; cursor: pointer; user-select: none; }
        .key {
          width: 100%; height: 100%;
          background: ${isBlack ? '#222' : '#f0f0f0'};
          border-bottom: 1px solid ${isBlack ? '#444' : '#ccc'};
          box-sizing: border-box;
          ${isBlack ? 'margin-left: -12px; width: calc(100% + 12px); z-index: 2; position: relative;' : ''}
          transition: background 0.05s;
        }
        .key.pressed { background: var(--cyber-accent-cyan, #00ffcc); }
        .label {
          position: absolute;
          left: 4px;
          bottom: 2px;
          font-size: 8px;
          color: #666;
          pointer-events: none;
        }
      </style>
      <div class="key ${isBlack ? 'black' : 'white'}" id="key">
        <div class="label" id="label"></div>
      </div>
    `;
    this._pressed = false;
    this._note = this.getAttribute('note') || 'C4';
    this._key = this.shadowRoot.getElementById('key');
    this._midi = this._getMidi();
  }
  connectedCallback() {
    const label = this.shadowRoot.getElementById('label');
    if (this.getAttribute('show-label') !== null) label.textContent = this._note.replace('#', '♯');
    this._key.addEventListener('mousedown', () => {
      this._pressed = true;
      this._key.classList.add('pressed');
      window.globalBus?.emit('note-on', { pitch: this._midi, velocity: 100 });
    });
    this._key.addEventListener('mouseup', () => {
      this._pressed = false;
      this._key.classList.remove('pressed');
      window.globalBus?.emit('note-off', { pitch: this._midi });
    });
    this._key.addEventListener('mouseleave', () => {
      if (this._pressed) {
        this._pressed = false;
        this._key.classList.remove('pressed');
        window.globalBus?.emit('note-off', { pitch: this._midi });
      }
    });
    this.addEventListener('mouseenter', () => {
      window.globalBus?.emit('show-hint', `Нота ${this._note} (MIDI ${this._midi})`);
    });
    this.addEventListener('mouseleave', () => { window.globalBus?.emit('clear-hint'); });
  }
  _getMidi() {
    const map = { 'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11 };
    const note = this._note;
    const pitch = note.slice(0,-1);
    const oct = parseInt(note.slice(-1));
    return map[pitch] + (oct+1)*12;
  }
}
customElements.define('cyber-key-strip', CyberKeyStrip);
export { CyberKeyStrip };
