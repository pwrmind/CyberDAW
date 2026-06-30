class CyberPluginDelay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #181326;
          border: 1px dashed var(--cyber-accent-cyan);
          padding: 6px;
          border-radius: 4px;
          font-family: var(--cyber-font);
        }
        .title { color: var(--cyber-accent-cyan); font-size: 9px; text-align: center; }
        .controls { display: flex; gap: 4px; justify-content: center; }
      </style>
      <div class="title">🛸 DELAY</div>
      <div class="controls">
        <cyber-knob id="time" label="T" value="0.3"></cyber-knob>
        <cyber-knob id="mix" label="M" value="0.0"></cyber-knob>
      </div>
    `;
    this.audioCtx = null;
    this.inputNode = null;
    this.outputNode = null;
    this.delayNode = null;
    this.feedbackGain = null;
    this.wetGain = null;
  }
  setAudioContext(ctx) {
    this.audioCtx = ctx;
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.delayNode = ctx.createDelay(2);
    this.feedbackGain = ctx.createGain();
    this.wetGain = ctx.createGain();

    this.delayNode.delayTime.setValueAtTime(0.3, ctx.currentTime);
    this.feedbackGain.gain.setValueAtTime(0.5, ctx.currentTime);
    this.wetGain.gain.setValueAtTime(0.0, ctx.currentTime);

    this.inputNode.connect(this.outputNode);
    this.inputNode.connect(this.delayNode);
    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);
    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode);

    this.shadowRoot.getElementById('time').addEventListener('knob-changed', (e) => {
      const val = e.detail.value * 1.5;
      this.delayNode.delayTime.linearRampToValueAtTime(val, ctx.currentTime + 0.01);
    });
    this.shadowRoot.getElementById('mix').addEventListener('knob-changed', (e) => {
      const val = e.detail.value * 0.7;
      this.wetGain.gain.linearRampToValueAtTime(val, ctx.currentTime + 0.01);
    });
  }
  get audioNode() {
    return { input: this.inputNode, output: this.outputNode };
  }
}
customElements.define('cyber-plugin-delay', CyberPluginDelay);
export { CyberPluginDelay };
