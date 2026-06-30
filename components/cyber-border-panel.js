class CyberBorderPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 100%; height: 100%; box-sizing: border-box; }
        .container {
          width: 100%; height: 100%;
          background: var(--cyber-bg-card, #121214);
          border-radius: 6px;
          border: 1px solid var(--cyber-border-dim, #443c50);
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        :host([active="true"]) .container {
          border-color: var(--cyber-accent-cyan, #00ffcc);
          box-shadow: 0 0 15px var(--cyber-accent-glow), inset 0 0 4px var(--cyber-accent-glow);
        }
      </style>
      <div class="container"><slot></slot></div>
    `;
  }
}
customElements.define('cyber-border-panel', CyberBorderPanel);
export { CyberBorderPanel };
