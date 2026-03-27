// --- Audio Player ---
export class AudioPlayer {
  private audioContext: AudioContext;
  private queue: string[] = [];
  private isPlaying = false;
  private sampleRate: number;

  constructor(sampleRate: number) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.sampleRate = sampleRate;
  }

  private async decode(base64: string): Promise<AudioBuffer> {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcm16 = new Int16Array(bytes.buffer);
    
    const audioBuffer = this.audioContext.createBuffer(1, pcm16.length, this.sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < pcm16.length; i++) {
      channelData[i] = pcm16[i] / 32768.0;
    }
    
    return audioBuffer;
  }

  public enqueue(base64Chunk: string) {
    this.queue.push(base64Chunk);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }
    this.isPlaying = true;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const base64 = this.queue.shift()!;
    try {
      const audioBuffer = await this.decode(base64);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.onended = () => this.playNext();
      source.start();
    } catch (error) {
      console.error('Error decoding or playing audio:', error);
      this.playNext();
    }
  }

  public stop() {
    this.queue = [];
    this.isPlaying = false;
    if (this.audioContext.state === 'running') {
      this.audioContext.close();
    }
  }
}

// --- Mic Streamer ---
export class MicStreamer {
  private onAudio: (base64: string) => void;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;

  constructor(onAudio: (base64: string) => void) {
    this.onAudio = onAudio;
  }

  public async start() {
    if (this.mediaStream) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      const bufferSize = 4096;
      
      this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = this.float32To16bitPCM(inputData);
        const base64 = this.pcm16ToBase64(pcm16);
        this.onAudio(base64);
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  public stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private float32To16bitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  private pcm16ToBase64(pcm16: Int16Array): string {
    const bytes = new Uint8Array(pcm16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}