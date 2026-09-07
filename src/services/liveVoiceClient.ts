/**
 * MarineSight Live Voice Client
 * Communicates with the Live API (gemini-3.1-flash-live-preview) via server WebSocket
 */

export interface LiveVoiceOptions {
  onStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening') => void;
  onError?: (errMessage: string) => void;
  onInterrupted?: () => void;
  onTurnComplete?: () => void;
}

export class LiveVoiceClient {
  private ws: WebSocket | null = null;
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isListening = false;
  private isConnected = false;
  private options: LiveVoiceOptions;
  private scheduledAudioTime = 0;

  constructor(options: LiveVoiceOptions = {}) {
    this.options = options;
  }

  public async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.options.onStatusChange?.('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live-voice`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.options.onStatusChange?.('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'audio' && data.audio) {
              this.options.onStatusChange?.('speaking');
              this.playPcmAudioChunk(data.audio);
            } else if (data.type === 'interrupted') {
              this.stopAudioPlayback();
              this.options.onInterrupted?.();
            } else if (data.type === 'turnComplete') {
              this.options.onTurnComplete?.();
              if (this.isListening) {
                this.options.onStatusChange?.('listening');
              } else {
                this.options.onStatusChange?.('connected');
              }
            } else if (data.type === 'error') {
              this.options.onError?.(data.message || 'Live Voice error');
            }
          } catch (e) {
            console.error('Error handling live message:', e);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('Live voice WebSocket error:', err);
          this.options.onError?.('Failed to connect to Live Voice channel. Is server online?');
          this.options.onStatusChange?.('disconnected');
          reject(err);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.isListening = false;
          this.options.onStatusChange?.('disconnected');
        };
      } catch (err: any) {
        this.options.onError?.(err?.message || 'WebSocket initialization failed');
        reject(err);
      }
    });
  }

  public async startMicrophone(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      // Create script processor to stream 16-bit linear PCM chunks
      this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e) => {
        if (!this.isListening || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to 16-bit PCM Int16Array
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Encode as base64
        const uint8 = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64Audio = btoa(binary);

        this.ws.send(JSON.stringify({ audio: base64Audio }));
      };

      source.connect(this.processorNode);
      this.processorNode.connect(this.audioCtx.destination);

      this.isListening = true;
      this.options.onStatusChange?.('listening');
    } catch (err: any) {
      this.options.onError?.(err?.message || 'Could not access microphone');
      throw err;
    }
  }

  public stopMicrophone(): void {
    this.isListening = false;

    if (this.processorNode) {
      try { this.processorNode.disconnect(); } catch {}
      this.processorNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.options.onStatusChange?.(this.isConnected ? 'connected' : 'disconnected');
  }

  public sendTextMessage(text: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ text }));
    }
  }

  private playPcmAudioChunk(base64Pcm: string): void {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const binary = atob(base64Pcm);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const buffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);

      const currentTime = this.audioCtx.currentTime;
      if (this.scheduledAudioTime < currentTime) {
        this.scheduledAudioTime = currentTime;
      }

      source.start(this.scheduledAudioTime);
      this.scheduledAudioTime += buffer.duration;
    } catch (err) {
      console.warn('Error playing PCM audio chunk:', err);
    }
  }

  private stopAudioPlayback(): void {
    if (this.audioCtx) {
      this.scheduledAudioTime = this.audioCtx.currentTime;
    }
  }

  public disconnect(): void {
    this.stopMicrophone();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch {}
      this.audioCtx = null;
    }
    this.isConnected = false;
    this.options.onStatusChange?.('disconnected');
  }
}
