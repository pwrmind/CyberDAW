class CyberStepButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; margin: 1px; }
        button {
          width: 18px; height: 24px;
          background: #333;
          border: 1px solid #222;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.1s, box-shadow 0.1s;
        }
        button.active { background: var(--cyber-accent-cyan, #00ffcc); box-shadow: 0 0 8px var(--cyber-accent-cyan); }
        button.playing { border-color: #fff; filter: brightness(1.4); }
      </style>
      <button id="btn"></button>
    `;
    this._active = false;
    this._step = parseInt(this.getAttribute('data-step')) || 0;
    const isAlt = Math.floor(this._step / 4) % 2 === 1;
    this.style.setProperty('--step-color', isAlt ? '#444' : '#333');
    this._btn = this.shadowRoot.getElementById('btn');
  }
  connectedCallback() {
    this._btn.addEventListener('click', () => {
      this._active = !this._active;
      this._btn.classList.toggle('active', this._active);
      this.dispatchEvent(new CustomEvent('step-toggled', { detail: { step: this._step, active: this._active }, bubbles: true, composed: true }));
    });
  }
  setPlayingLight(state) {
    this._btn.classList.toggle('playing', state);
  }
  setActive(state) {
    this._active = state;
    this._btn.classList.toggle('active', state);
  }
}
customElements.define('cyber-step-button', CyberStepButton);
export { CyberStepButton };
