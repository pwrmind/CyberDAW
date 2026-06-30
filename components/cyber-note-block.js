class CyberNoteBlock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: absolute;
          background: var(--cyber-accent-cyan, #00ffcc);
          border: 1px solid #00b38f;
          border-radius: 2px;
          height: 18px;
          box-sizing: border-box;
          cursor: pointer;
          transition: box-shadow 0.1s;
        }
        :host(:hover) { box-shadow: 0 0 10px var(--cyber-accent-cyan); }
        .resize-handle {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          background: rgba(0,0,0,0.2);
          cursor: ew-resize;
        }
        .resize-handle:hover { background: rgba(255,255,255,0.3); }
      </style>
      <div class="resize-handle"></div>
    `;
    this._resize = this.shadowRoot.querySelector('.resize-handle');
    this._pitch = 60;
    this._start = 0;
    this._duration = 1;
    this._id = 'note-' + Date.now() + '-' + Math.random().toString(36).substr(2,4);
    this._dragData = null;
  }
  connectedCallback() {
    // Перетаскивание всей ноты
    this.addEventListener('mousedown', (e) => {
      if (e.target === this._resize) return;
      e.stopPropagation();
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startStart = this._start;
      const startPitch = this._pitch;
      const grid = this.closest('.grid-area');
      const rect = grid.getBoundingClientRect();
      const pxPerBeat = 40;
      const noteHeight = 20;
      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let newStart = startStart + dx / pxPerBeat;
        let newPitch = startPitch - dy / noteHeight;
        newPitch = Math.max(0, Math.min(127, Math.round(newPitch)));
        newStart = Math.round(newStart * 4) / 4; // квантование 1/4
        newStart = Math.max(0, newStart);
        this._start = newStart;
        this._pitch = newPitch;
        this._updatePosition();
        // событие для сохранения
        this.dispatchEvent(new CustomEvent('note-moved', {
          detail: { id: this._id, start: this._start, pitch: this._pitch },
          bubbles: true, composed: true
        }));
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Изменение длительности
    this._resize.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startDur = this._duration;
      const pxPerBeat = 40;
      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        let newDur = startDur + dx / pxPerBeat;
        newDur = Math.max(0.25, Math.round(newDur * 4) / 4);
        this._duration = newDur;
        this.style.width = (newDur * pxPerBeat) + 'px';
        this.dispatchEvent(new CustomEvent('note-resize', {
          detail: { id: this._id, duration: this._duration },
          bubbles: true, composed: true
        }));
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Двойной клик – удаление
    this.addEventListener('dblclick', () => {
      this.dispatchEvent(new CustomEvent('note-delete', {
        detail: { id: this._id },
        bubbles: true, composed: true
      }));
      this.remove();
    });

    this._updatePosition();
  }
  setNote(pitch, start, duration) {
    this._pitch = pitch;
    this._start = start;
    this._duration = duration;
    this._updatePosition();
  }
  _updatePosition() {
    const pxPerBeat = 40;
    const noteHeight = 20;
    this.style.left = (this._start * pxPerBeat) + 'px';
    this.style.width = (this._duration * pxPerBeat) + 'px';
    this.style.top = ((127 - this._pitch) * noteHeight) + 'px';
  }
  get noteData() {
    return { id: this._id, pitch: this._pitch, start: this._start, duration: this._duration };
  }
}
customElements.define('cyber-note-block', CyberNoteBlock);
export { CyberNoteBlock };
