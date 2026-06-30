import { CyberStepButton } from './cyber-step-button.js';

class CyberChannelStrip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          background: var(--cyber-bg-dark);
          padding: 4px 6px;
          border-bottom: 1px solid var(--cyber-border-color);
          gap: 6px;
          font-family: var(--cyber-font);
          font-size: 11px;
        }
        .name {
          width: 70px;
          color: var(--cyber-text-main);
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .name:hover { color: var(--cyber-accent-cyan); }
        .steps { display: flex; }
      </style>
      <cyber-knob id="pan" label="P" value="0.5" style="width:30px;"></cyber-knob>
      <div class="name" id="trackName">Kick</div>
      <div class="steps" id="steps"></div>
    `;
    this._abort = null;
  }
  connectedCallback() {
    const name = this.getAttribute('name') || 'Track';
    this.shadowRoot.getElementById('trackName').textContent = name;
    const stepsContainer = this.shadowRoot.getElementById('steps');
    try {
      if (customElements.get('cyber-step-button')) {
        for (let i = 0; i < 16; i++) {
          const btn = new CyberStepButton();
          btn.setAttribute('data-step', i);
          stepsContainer.appendChild(btn);
        }
      } else {
        for (let i = 0; i < 16; i++) {
          const div = document.createElement('div');
          div.style.cssText = 'width:18px;height:24px;background:#333;border:1px solid #222;border-radius:2px;display:inline-block;margin:1px;';
          stepsContainer.appendChild(div);
        }
      }
    } catch(e) {
      for (let i = 0; i < 16; i++) {
        const div = document.createElement('div');
        div.style.cssText = 'width:18px;height:24px;background:#333;border:1px solid #222;border-radius:2px;display:inline-block;margin:1px;';
        stepsContainer.appendChild(div);
      }
    }
    this.shadowRoot.getElementById('trackName').addEventListener('click', () => {
      window.globalBus?.emit('open-piano-roll', { instrumentId: this.getAttribute('id') || 'synth', instrumentName: name });
    });
    this.addEventListener('step-toggled', (e) => {
      const { step, active } = e.detail;
      window.globalBus?.emit('pattern-updated', { instrument: this.getAttribute('id') || 'synth', step, active });
    });
    if (window.globalBus) {
      this._abort = new AbortController();
      const signal = this._abort.signal;
      window.globalBus.on('time-tick', (data) => {
        const steps = this.shadowRoot.querySelectorAll('cyber-step-button');
        steps.forEach((btn, idx) => {
          if (typeof btn.setPlayingLight === 'function') {
            btn.setPlayingLight(idx === data.step);
          }
        });
      }, { signal });
    }
  }
  disconnectedCallback() {
    if (this._abort) this._abort.abort();
  }
}
customElements.define('cyber-channel-strip', CyberChannelStrip);
export { CyberChannelStrip };
