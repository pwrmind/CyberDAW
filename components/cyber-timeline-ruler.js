class CyberTimelineRuler extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 24px;
          background: var(--cyber-bg-dark);
          border-bottom: 1px solid var(--cyber-border-color);
          font-family: var(--cyber-font);
          font-size: 10px;
          color: var(--cyber-text-muted);
          position: relative;
          overflow: hidden;
          user-select: none;
        }
        .marks {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          display: flex;
        }
        .mark {
          display: inline-block;
          border-left: 1px solid var(--cyber-border-color);
          padding-left: 4px;
          height: 100%;
          line-height: 24px;
          min-width: 20px;
        }
        .mark.major { border-left-color: var(--cyber-text-muted); font-weight: bold; }
      </style>
      <div class="marks" id="marks"></div>
    `;
  }
  connectedCallback() {
    const container = this.shadowRoot.getElementById('marks');
    for (let i = 0; i < 16; i++) {
      const mark = document.createElement('span');
      mark.className = 'mark' + (i % 4 === 0 ? ' major' : '');
      mark.textContent = i + 1;
      mark.style.width = '40px';
      container.appendChild(mark);
    }
  }
}
customElements.define('cyber-timeline-ruler', CyberTimelineRuler);
export { CyberTimelineRuler };
