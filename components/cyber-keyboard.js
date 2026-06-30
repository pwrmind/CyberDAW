class CyberKeyboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: flex; flex-direction: column-reverse; width: 60px; border-right: 1px solid var(--cyber-border-color); user-select: none; height: 100%; }
      </style>
      <div id="keys" style="flex:1;"></div>
    `;
  }
  connectedCallback() {
    const container = this.shadowRoot.getElementById('keys');
    const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    for (let oct = 4; oct >= 2; oct--) {
      for (let n of notes) {
        const key = document.createElement('cyber-key-strip');
        const noteName = n + oct;
        key.setAttribute('note', noteName);
        if (n.includes('#')) key.setAttribute('black', '');
        if (n === 'C' || n === 'G') key.setAttribute('show-label', '');
        container.appendChild(key);
      }
    }
  }
}
customElements.define('cyber-keyboard', CyberKeyboard);
export { CyberKeyboard };
