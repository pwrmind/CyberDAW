const numTemplate = document.createElement('template');
numTemplate.innerHTML = `
  <style>
    :host {
      display: inline-block;
      background: var(--cyber-bg-dark);
      border: 1px solid var(--cyber-border-color);
      border-radius: 3px;
      color: var(--cyber-accent-cyan, #00ffcc);
      font-family: var(--cyber-font, monospace);
      font-size: 14px;
      font-weight: bold;
      padding: 4px 8px;
      cursor: ns-resize;
      user-select: none;
      min-width: 60px;
      text-align: center;
    }
    input {
      background: transparent;
      border: none;
      color: inherit;
      font: inherit;
      width: 100%;
      text-align: center;
      outline: none;
      padding: 0;
    }
  </style>
  <div id="display">130.000</div>
`;
class CyberNumericDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(numTemplate.content.cloneNode(true));
    this._display = this.shadowRoot.getElementById('display');
    this._value = 130.0;
    this._editing = false;
    this._sensitivity = 5;
  }
  static get observedAttributes() { return ['value']; }
  connectedCallback() {
    this._value = parseFloat(this.getAttribute('value')) || 130.0;
    this._render();
    this.addEventListener('mousedown', this._startDrag.bind(this));
    this.addEventListener('dblclick', this._enableInput.bind(this));
    this.addEventListener('mouseenter', () => {
      window.globalBus?.emit('show-hint', 'Глобальный темп (BPM). Тяните вверх/вниз или дважды кликните для ввода.');
    });
    this.addEventListener('mouseleave', () => { window.globalBus?.emit('clear-hint'); });
  }
  attributeChangedCallback(name, old, val) {
    if (name === 'value') {
      this._value = parseFloat(val) || 130.0;
      this._render();
    }
  }
  get value() { return this._value; }
  set value(v) {
    this._value = Math.max(10, Math.min(522, v));
    this.setAttribute('value', this._value);
    this._render();
    window.globalBus?.emit('bpm-changed', { bpm: this._value });
  }
  _startDrag(e) {
    if (this._editing) return;
    e.preventDefault();
    const startY = e.clientY;
    const startVal = this._value;
    const onMove = (ev) => {
      const delta = startY - ev.clientY;
      let newVal = startVal + delta / this._sensitivity;
      newVal = Math.max(10, Math.min(522, parseFloat(newVal.toFixed(3))));
      if (newVal !== this._value) {
        this._value = newVal;
        this._render();
        window.globalBus?.emit('bpm-changed', { bpm: this._value });
      }
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
  _enableInput() {
    if (this._editing) return;
    this._editing = true;
    this._display.innerHTML = `<input type="text" value="${this._value.toFixed(3)}">`;
    const inp = this._display.querySelector('input');
    inp.focus();
    inp.select();
    const save = () => {
      let val = parseFloat(inp.value);
      if (!isNaN(val)) this._value = Math.max(10, Math.min(522, val));
      this._editing = false;
      this._render();
      window.globalBus?.emit('bpm-changed', { bpm: this._value });
    };
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') { this._editing = false; this._render(); }
    });
    inp.addEventListener('blur', save);
  }
  _render() {
    if (!this._editing) this._display.textContent = this._value.toFixed(3);
  }
}
customElements.define('cyber-numeric-display', CyberNumericDisplay);
export { CyberNumericDisplay };
