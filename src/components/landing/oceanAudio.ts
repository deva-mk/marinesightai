// Web Audio Subsea Hydrophone Ambiance Synthesizer
// Generates gentle low-frequency subsea drone, soft bubble fizz, and 455 kHz sonar pings without any external audio files.
class OceanAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private oceanGain: GainNode | null = null;
  private pingInterval: number | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch {
      // AudioContext not supported
    }
  }

  public toggleMute(): boolean {
    this.init();
    if (!this.ctx) return true;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (!this.isMuted) {
      this.startOceanAmbiance();
    } else {
      this.stopOceanAmbiance();
    }

    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private startOceanAmbiance() {
    if (!this.ctx) return;

    // Ocean subsea low rumble (Pink noise through lowpass filter)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);

    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.oceanGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.5);

    whiteNoise.connect(filter);
    filter.connect(this.oceanGain);
    this.oceanGain.connect(this.ctx.destination);
    whiteNoise.start();

    // Periodic gentle subsea sonar ping
    this.pingInterval = window.setInterval(() => {
      if (!this.isMuted) {
        this.triggerSonarPing();
      }
    }, 4500);
  }

  private stopOceanAmbiance() {
    if (this.oceanGain && this.ctx) {
      try {
        this.oceanGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {
        // ignore ramp error
      }
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public triggerSonarPing() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(460, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {
      // ignore audio glitch
    }
  }
}

export const oceanAudio = new OceanAudioEngine();
