class CyberAudioEngine extends HTMLElement {
  constructor() {
    super();
    this.audioCtx = null;
    this.masterGain = null;
    this.analyser = null;
    this.isPlaying = false;
    this.bpm = 130;
    this.currentStep = 0;
    this.totalBeats = 0;
    this.nextStepTime = 0;
    this.schedulerId = null;
    this.channels = new Map();
    this.patterns = {
      kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0]
    };
    this.loopEnabled = false;
    this.loopStart = 0;
    this.loopEnd = 4;
    this.sampleBuffers = new Map();
    this._abortController = null;
    this._vuInterval = null;
    this._stopping = false;
    this._activeOscillators = new Map();
  }
  connectedCallback() {
    window.addEventListener('click', () => this._initAudio(), { once: true });
    if (window.globalBus) {
      this._abortController = new AbortController();
      const signal = this._abortController.signal;
      window.globalBus.on('daw-play-toggle', (data) => this._onPlayToggle(data), { signal });
      window.globalBus.on('daw-stop', () => this._stopTransport(), { signal });
      window.globalBus.on('bpm-changed', (data) => { this.bpm = data.bpm; }, { signal });
      window.globalBus.on('pattern-updated', (data) => {
        if (this.patterns[data.instrument] !== undefined) {
          this.patterns[data.instrument][data.step] = data.active ? 1 : 0;
        }
      }, { signal });
      window.globalBus.on('plugin-inserted', (data) => {
        this._insertPlugin(data.channelId, data.pluginTag, data.pluginInstance);
      }, { signal });
      window.globalBus.on('channel-pan-changed', (data) => {
        this._setPan(data.channelId, data.value);
      }, { signal });
      window.globalBus.on('timeline-loop-changed', (data) => {
        this.loopEnabled = data.isEnabled;
        this.loopStart = data.loopStart || 0;
        this.loopEnd = data.loopEnd || 4;
      }, { signal });
      // Подписка на ноты
      window.globalBus.on('note-on', (data) => {
        this._playNote(data.pitch, data.velocity || 100);
      }, { signal });
      window.globalBus.on('note-off', (data) => {
        this._stopNote(data.pitch);
      }, { signal });
      this._startVuLoop();
    }
  }
  disconnectedCallback() {
    if (this._abortController) this._abortController.abort();
    if (this.schedulerId) clearInterval(this.schedulerId);
    if (this._vuInterval) cancelAnimationFrame(this._vuInterval);
    if (this.audioCtx) this.audioCtx.close();
  }
  _initAudio() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.audioCtx.currentTime);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
    console.log('⚡ Cyber Audio Engine готов');
    this._loadSamples();
  }
  async _loadSamples() {
    const sampleNames = ['kick', 'snare', 'hat'];
    for (let name of sampleNames) {
      const buffer = this.audioCtx.createBuffer(1, 44100 * 0.1, 44100);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (44100 * 0.02));
      }
      this.sampleBuffers.set(name, buffer);
    }
    console.log('Сэмплы загружены (синтезированы)');
  }
  _onPlayToggle(data) {
    if (data.isPlaying) this._startTransport();
    else this._stopTransport();
  }
  _startTransport() {
    if (!this.audioCtx) this._initAudio();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    this.isPlaying = true;
    this.currentStep = 0;
    this.totalBeats = 0;
    this.nextStepTime = this.audioCtx.currentTime;
    this.schedulerId = setInterval(() => this._scheduler(), 25);
    window.globalBus?.emit('time-tick', { step: 0, totalBeats: 0, audioTime: this.audioCtx.currentTime });
  }
  _stopTransport() {
    if (this._stopping) return;
    this._stopping = true;
    this.isPlaying = false;
    if (this.schedulerId) clearInterval(this.schedulerId);
    this.schedulerId = null;
    // Останавливаем все звуки
    this._activeOscillators.forEach((val, pitch) => {
      try {
        val.gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.05);
        val.osc.stop(this.audioCtx.currentTime + 0.05);
      } catch(e) {}
    });
    this._activeOscillators.clear();
    window.globalBus?.emit('time-tick', { step: 0, totalBeats: 0, audioTime: 0 });
    this._stopping = false;
  }
  _scheduler() {
    const ahead = 0.05;
    while (this.nextStepTime < this.audioCtx.currentTime + ahead) {
      this._scheduleStep(this.currentStep, this.nextStepTime);
      const secPerBeat = 60 / this.bpm;
      const secPerStep = 0.25 * secPerBeat;
      this.nextStepTime += secPerStep;
      this.currentStep = (this.currentStep + 1) % 16;
      this.totalBeats += 0.25;
      if (this.loopEnabled && this.totalBeats >= this.loopEnd) {
        const overshoot = this.totalBeats - this.loopEnd;
        this.totalBeats = this.loopStart + overshoot;
        this.currentStep = Math.floor(this.totalBeats / 0.25) % 16;
      }
      window.globalBus?.emit('time-tick', { step: this.currentStep, totalBeats: this.totalBeats, audioTime: this.nextStepTime });
    }
  }
  _scheduleStep(step, time) {
    for (const [inst, pattern] of Object.entries(this.patterns)) {
      if (pattern[step] === 1) {
        this._playSample(inst, time);
      }
    }
  }
  _playSample(inst, time) {
    const buffer = this.sampleBuffers.get(inst);
    if (buffer) {
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      const channel = this._getOrCreateChannel(inst);
      source.connect(gain);
      if (channel.pannerNode) {
        gain.connect(channel.pannerNode);
        channel.pannerNode.connect(this.masterGain);
      } else {
        gain.connect(this.masterGain);
      }
      source.start(time);
      source.stop(time + 0.1);
    } else {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      let freq = 100, dur = 0.1;
      if (inst === 'kick') { freq = 60; dur = 0.15; }
      else if (inst === 'snare') { freq = 200; dur = 0.08; }
      else if (inst === 'hat') { freq = 400; dur = 0.04; }
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      const channel = this._getOrCreateChannel(inst);
      osc.connect(gain);
      if (channel.pannerNode) {
        gain.connect(channel.pannerNode);
        channel.pannerNode.connect(this.masterGain);
      } else {
        gain.connect(this.masterGain);
      }
      osc.start(time);
      osc.stop(time + dur);
    }
  }
  _playNote(pitch, velocity) {
    if (!this.audioCtx) return;
    if (this._activeOscillators.has(pitch)) return;
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);
    const osc = this.audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    const gain = this.audioCtx.createGain();
    const vol = (velocity / 127) * 0.15;
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this.audioCtx.currentTime + 0.005);
    const synthChannel = this._getOrCreateChannel('synth');
    osc.connect(gain);
    gain.connect(synthChannel.pannerNode || synthChannel.gainNode);
    osc.start();
    this._activeOscillators.set(pitch, { osc, gain });
  }
  _stopNote(pitch) {
    const data = this._activeOscillators.get(pitch);
    if (!data) return;
    const { osc, gain } = data;
    gain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.05);
    osc.stop(this.audioCtx.currentTime + 0.05);
    this._activeOscillators.delete(pitch);
  }
  _getOrCreateChannel(id) {
    if (this.channels.has(id)) return this.channels.get(id);
    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.75, this.audioCtx.currentTime);
    const panner = this.audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(0, this.audioCtx.currentTime);
    gain.connect(panner);
    panner.connect(this.masterGain);
    const data = { gainNode: gain, pannerNode: panner };
    this.channels.set(id, data);
    return data;
  }
  _setPan(channelId, value) {
    const ch = this._getOrCreateChannel(channelId);
    const pan = (value * 2) - 1;
    ch.pannerNode.pan.linearRampToValueAtTime(pan, this.audioCtx.currentTime + 0.015);
  }
  _insertPlugin(channelId, tag, instance) {
    if (!this.audioCtx) return;
    const ch = this._getOrCreateChannel(channelId);
    ch.gainNode.disconnect();
    ch.pannerNode.disconnect();
    if (typeof instance.setAudioContext === 'function') {
      instance.setAudioContext(this.audioCtx);
    }
    const node = instance.audioNode;
    if (node && node.input && node.output) {
      ch.gainNode.connect(node.input);
      node.output.connect(ch.pannerNode);
      ch.pannerNode.connect(this.masterGain);
    } else {
      ch.gainNode.connect(ch.pannerNode);
      ch.pannerNode.connect(this.masterGain);
    }
    console.log(`🔌 Плагин ${tag} вставлен в канал ${channelId}`);
  }
  _startVuLoop() {
    const update = () => {
      if (this.analyser && this.isPlaying) {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(dataArray);
        let max = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const amp = Math.abs(dataArray[i] - 128);
          if (amp > max) max = amp;
        }
        const vol = (max / 128) * 100;
        window.globalBus?.emit('master-vu-update', { volume: vol });
      }
      this._vuInterval = requestAnimationFrame(update);
    };
    update();
  }
}
customElements.define('cyber-audio-engine', CyberAudioEngine);
export { CyberAudioEngine };
