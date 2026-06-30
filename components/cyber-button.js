const buttonTemplate = document.createElement('template');
buttonTemplate.innerHTML = `
  <style>
    :host { display: inline-block; }
    button {
      background: var(--cyber-bg-light, #2a2a30);
      border: 1px solid var(--cyber-border-color, #444);
      color: var(--cyber-text-main, #ccc);
      font-family: var(--cyber-font, monospace);
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
      outline: none;
      user-select: none;
    }
    button:hover { border-color: var(--cyber-accent-cyan, #00ffcc); }
    button.active {
      background: var(--cyber-accent-cyan, #00ffcc);
      color: #000;
      border-color: var(--cyber-accent-cyan);
      box-shadow: 0 0 10px var(--cyber-accent-glow);
    }
    button.toggle { min-width: 40px; }
  </style>
  <button part="button"><slot></slot></button>
`;
class CyberButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(buttonTemplate.content.cloneNode(true));
    this.btn = this.shadowRoot.querySelector('button');
    this._active = false;
    this._toggle = this.hasAttribute('toggle');
  }
  static get observedAttributes() { return ['active', 'disabled']; }
  connectedCallback() {
    this.btn.addEventListener('click', () => {
      if (this.hasAttribute('disabled')) return;
      if (this._toggle) {
        this._active = !this._active;
        this.btn.classList.toggle('active', this._active);
        this.dispatchEvent(new CustomEvent('toggle-change', { detail: { active: this._active }, bubbles: true, composed: true }));
      } else {
        this.dispatchEvent(new CustomEvent('click', { bubbles: true, composed: true }));
      }
    });
    this.update();
  }
  attributeChangedCallback(name, old, val) {
    if (name === 'active') {
      this._active = val !== null;
      this.btn.classList.toggle('active', this._active);
    }
    if (name === 'disabled') this.btn.disabled = val !== null;
  }
  update() {
    if (this.hasAttribute('active')) { this._active = true; this.btn.classList.add('active'); }
    if (this.hasAttribute('toggle')) this.btn.classList.add('toggle');
  }
}
customElements.define('cyber-button', CyberButton);
export { CyberButton };
