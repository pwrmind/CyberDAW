const sliderTemplate = document.createElement('template');
sliderTemplate.innerHTML = `
  <style>
    :host {
      display: inline-block;
      width: 20px;
      height: 100px;
      background: #222;
      border-radius: 4px;
      position: relative;
      cursor: ns-resize;
      user-select: none;
    }
    .track {
      width: 100%;
      height: 100%;
      background: #333;
      border-radius: 4px;
      position: relative;
    }
    .thumb {
      position: absolute;
      left: 2px;
      right: 2px;
      height: 12px;
      background: var(--cyber-accent-cyan, #00ffcc);
      border-radius: 2px;
      box-shadow: 0 0 8px var(--cyber-accent-glow);
      transition: top 0.05s;
    }
  </style>
  <div class="track">
    <div class="thumb" id="thumb" style="top:50%;"></div>
  </div>
`;
class CyberSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(sliderTemplate.content.cloneNode(true));
    this._value = 0.5;
    this._thumb = this.shadowRoot.getElementById('thumb');
  }
  static get observedAttributes() { return ['value']; }
  connectedCallback() {
    this._value = parseFloat(this.getAttribute('value')) || 0.5;
    this._updateThumb();
    this.addEventListener('mousedown', this._startDrag.bind(this));
    this.addEventListener('mouseenter', () => {
      window.globalBus?.emit('show-hint', `Слайдер: ${Math.round(this._value*100)}%`);
    });
    this.addEventListener('mouseleave', () => { window.globalBus?.emit('clear-hint'); });
  }
  attributeChangedCallback(name, old, val) {
    if (name === 'value') {
      this._value = Math.max(0, Math.min(1, parseFloat(val)||0));
      this._updateThumb();
    }
  }
  get value() { return this._value; }
  set value(v) {
    this._value = Math.max(0, Math.min(1, v));
    this.setAttribute('value', this._value);
    this._updateThumb();
    this.dispatchEvent(new CustomEvent('slider-changed', { detail: { value: this._value }, bubbles: true, composed: true }));
  }
  _startDrag(e) {
    e.preventDefault();
    const rect = this.getBoundingClientRect();
    const startY = e.clientY;
    const startVal = this._value;
    const onMove = (ev) => {
      const delta = (startY - ev.clientY) / rect.height;
      let newVal = startVal + delta;
      newVal = Math.max(0, Math.min(1, newVal));
      if (newVal !== this._value) {
        this._value = newVal;
        this._updateThumb();
        this.dispatchEvent(new CustomEvent('slider-changed', { detail: { value: this._value }, bubbles: true, composed: true }));
      }
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
  _updateThumb() {
    const top = (1 - this._value) * 100;
    this._thumb.style.top = `${top}%`;
  }
}
customElements.define('cyber-slider', CyberSlider);
export { CyberSlider };
