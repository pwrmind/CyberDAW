const knobTemplate = document.createElement('template');
knobTemplate.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      user-select: none;
      font-family: var(--cyber-font, monospace);
      color: var(--cyber-text-muted);
      width: 50px;
    }
    .knob-wrap {
      position: relative;
      width: 36px;
      height: 36px;
      cursor: ns-resize;
    }
    .knob-body {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(circle, #444, #222);
      border: 2px solid #1a1a1a;
      box-sizing: border-box;
      position: relative;
      transition: transform 0.05s;
    }
    .knob-pointer {
      position: absolute;
      top: 4px;
      left: 50%;
      width: 3px;
      height: 8px;
      background: var(--cyber-accent-cyan, #00ffcc);
      border-radius: 2px;
      transform: translateX(-50%);
    }
    .knob-label {
      font-size: 10px;
      margin-top: 2px;
      text-align: center;
      color: var(--cyber-text-muted);
    }
  </style>
  <div class="knob-wrap">
    <div class="knob-body" id="body">
      <div class="knob-pointer"></div>
    </div>
  </div>
  <div class="knob-label" id="label">0%</div>
`;
class CyberKnob extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(knobTemplate.content.cloneNode(true));
    this._value = 0.5;
    this.minAngle = -135;
    this.maxAngle = 135;
    this.sensitivity = 150;
    this._body = this.shadowRoot.getElementById('body');
    this._label = this.shadowRoot.getElementById('label');
    this._wrap = this.shadowRoot.querySelector('.knob-wrap');
  }
  static get observedAttributes() { return ['value', 'label']; }
  connectedCallback() {
    this._wrap.addEventListener('mousedown', this._startDrag.bind(this));
    this._updateVisuals();
    this.addEventListener('mouseenter', () => {
      window.globalBus?.emit('show-hint', `Крутилка: ${this.getAttribute('label')||'параметр'} (${Math.round(this._value*100)}%)`);
    });
    this.addEventListener('mouseleave', () => { window.globalBus?.emit('clear-hint'); });
  }
  attributeChangedCallback(name, old, val) {
    if (name === 'value') {
      this._value = Math.max(0, Math.min(1, parseFloat(val)||0));
      this._updateVisuals();
    }
    if (name === 'label' && this._label) this._updateVisuals();
  }
  get value() { return this._value; }
  set value(v) {
    this._value = Math.max(0, Math.min(1, v));
    this.setAttribute('value', this._value);
    this._updateVisuals();
  }
  _startDrag(e) {
    e.preventDefault();
    const startY = e.clientY;
    const startVal = this._value;
    this._body.style.transition = 'none';
    const onMove = (ev) => {
      const deltaY = startY - ev.clientY;
      let newVal = startVal + deltaY / this.sensitivity;
      newVal = Math.max(0, Math.min(1, newVal));
      if (newVal !== this._value) {
        this._value = newVal;
        this._updateVisuals();
        this.dispatchEvent(new CustomEvent('knob-changed', { detail: { value: this._value }, bubbles: true, composed: true }));
      }
    };
    const onUp = () => {
      this._body.style.transition = 'transform 0.05s ease-out';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
  _updateVisuals() {
    const angle = this.minAngle + this._value * (this.maxAngle - this.minAngle);
    this._body.style.transform = `rotate(${angle}deg)`;
    const label = this.getAttribute('label') || 'Knob';
    const percent = Math.round(this._value * 100);
    this._label.textContent = `${label}: ${percent}%`;
  }
}
customElements.define('cyber-knob', CyberKnob);
export { CyberKnob };
