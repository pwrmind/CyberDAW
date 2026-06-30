class CyberPianoRoll extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; background: var(--cyber-bg-main); font-family: var(--cyber-font); width: 100%; height: 100%; position: relative; overflow: hidden; }
        .layout { display: flex; flex-direction: column; height: 100%; }
        .grid-area { flex:1; overflow: auto; background: var(--cyber-bg-dark); position: relative; }
        .grid-inner { position: relative; width: 2000px; height: 2000px; background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; }
        .keyboard-wrapper { display: flex; height: 100%; }
        cyber-keyboard { height: 100%; }
        .toolbar {
          display: flex;
          gap: 6px;
          background: var(--cyber-bg-dark);
          padding: 4px 8px;
          border-bottom: 1px solid var(--cyber-border-color);
        }
      </style>
      <div class="layout">
        <div class="toolbar">
          <cyber-button id="add-note">➕ Добавить</cyber-button>
          <cyber-button id="clear-notes">🗑️ Очистить</cyber-button>
          <span style="color:var(--cyber-text-muted);font-size:11px;margin-left:8px;">Клик по ноте – выделить, двойной клик – удалить</span>
        </div>
        <cyber-timeline-ruler></cyber-timeline-ruler>
        <div class="keyboard-wrapper">
          <cyber-keyboard></cyber-keyboard>
          <div class="grid-area" id="grid">
            <div class="grid-inner" id="gridInner"></div>
          </div>
        </div>
      </div>
    `;
    this._abort = null;
    this._notes = [];
    this._noteIdCounter = 0;
    this._selectedNote = null;
  }
  connectedCallback() {
    // Пример начальных нот
    const sampleNotes = [
      { pitch: 60, start: 0, duration: 1 },
      { pitch: 64, start: 1, duration: 0.5 },
      { pitch: 67, start: 2, duration: 0.75 },
      { pitch: 72, start: 3.5, duration: 1.5 }
    ];
    sampleNotes.forEach(n => this.addNote(n.pitch, n.start, n.duration));

    // События от нот
    this.shadowRoot.getElementById('gridInner').addEventListener('note-moved', (e) => {
      const { id, start, pitch } = e.detail;
      const note = this._notes.find(n => n.id === id);
      if (note) {
        note.start = start;
        note.pitch = pitch;
      }
    });
    this.shadowRoot.getElementById('gridInner').addEventListener('note-resize', (e) => {
      const { id, duration } = e.detail;
      const note = this._notes.find(n => n.id === id);
      if (note) note.duration = duration;
    });
    this.shadowRoot.getElementById('gridInner').addEventListener('note-delete', (e) => {
      this._notes = this._notes.filter(n => n.id !== e.detail.id);
    });

    // Добавление ноты по клику на сетку
    const grid = this.shadowRoot.getElementById('grid');
    grid.addEventListener('click', (e) => {
      if (e.target.closest('cyber-note-block')) return;
      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left + grid.scrollLeft;
      const y = e.clientY - rect.top + grid.scrollTop;
      const pxPerBeat = 40;
      const noteHeight = 20;
      const start = Math.round(x / pxPerBeat * 4) / 4;
      const pitch = Math.max(0, Math.min(127, 127 - Math.round(y / noteHeight)));
      this.addNote(pitch, start, 0.25);
    });

    // Кнопка добавления
    this.shadowRoot.getElementById('add-note').addEventListener('click', () => {
      this.addNote(60, 0, 0.25);
    });

    // Кнопка очистки
    this.shadowRoot.getElementById('clear-notes').addEventListener('click', () => {
      this._notes = [];
      this.renderNotes();
    });

    // Playhead
    if (window.globalBus) {
      this._abort = new AbortController();
      const signal = this._abort.signal;
      window.globalBus.on('time-tick', (data) => {
        let ph = this.shadowRoot.getElementById('playhead');
        if (!ph) {
          ph = document.createElement('div');
          ph.id = 'playhead';
          ph.style.cssText = 'position:absolute;left:0;top:0;width:2px;height:100%;background:var(--cyber-accent-cyan);box-shadow:0 0 8px var(--cyber-accent-cyan);pointer-events:none;z-index:10;';
          this.shadowRoot.getElementById('grid').appendChild(ph);
        }
        const pxPerBeat = 40;
        const x = data.totalBeats * pxPerBeat;
        ph.style.transform = `translateX(${x}px)`;
      }, { signal });
    }
    this.renderNotes();
  }
  addNote(pitch, start, duration) {
    const id = 'note-' + (++this._noteIdCounter);
    this._notes.push({ id, pitch, start, duration });
    this.renderNotes();
  }
  renderNotes() {
    const container = this.shadowRoot.getElementById('gridInner');
    // Удаляем существующие ноты (кроме playhead)
    const toRemove = container.querySelectorAll('cyber-note-block');
    toRemove.forEach(el => el.remove());
    this._notes.forEach(n => {
      const block = document.createElement('cyber-note-block');
      block.setNote(n.pitch, n.start, n.duration);
      block.dataset.id = n.id;
      container.appendChild(block);
    });
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
  }
}
customElements.define('cyber-piano-roll', CyberPianoRoll);
export { CyberPianoRoll };
