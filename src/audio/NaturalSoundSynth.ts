import type { SoundType } from '../types';

export class NaturalSoundSynth {
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  createRain(): AudioNode {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = white * Math.exp(-white * white * 10);
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.5;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    source.start();
    return gain;
  }

  createWind(): AudioNode {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = white;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 200;
    filter.Q.value = 0.5;

    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 100;

    const volume = this.audioContext.createGain();
    volume.gain.value = 0.3;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    source.connect(filter);
    filter.connect(volume);
    volume.connect(this.audioContext.destination);

    lfo.start();
    source.start();

    return volume;
  }

  createWave(): AudioNode {
    const bufferSize = 4 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    const cycleLength = this.audioContext.sampleRate * 4;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      const cycle = i % cycleLength;
      const envelope = Math.pow(Math.sin((cycle / cycleLength) * Math.PI), 2);
      output[i] = white * envelope * 0.5;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.6;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    source.start();
    return gain;
  }

  createFire(): AudioNode {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = white * white;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.4;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    source.start();
    return gain;
  }

  createBird(): AudioNode {
    const bufferSize = this.audioContext.sampleRate * 0.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const freq = 2000 + Math.sin(t * 10) * 500;
      output[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 3);
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.15;

    source.connect(gain);
    gain.connect(this.audioContext.destination);

    source.start();
    return gain;
  }

  createCricket(): AudioNode {
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const freq = 4000;
      const pulse = Math.sin(2 * Math.PI * 20 * t) > 0.5 ? 1 : 0;
      output[i] = Math.sin(2 * Math.PI * freq * t) * pulse * Math.exp(-t * 10);
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.1;

    source.connect(gain);
    gain.connect(this.audioContext.destination);

    source.start();
    return gain;
  }

  createSound(type: SoundType): AudioNode | null {
    switch (type) {
      case 'rain': return this.createRain();
      case 'wind': return this.createWind();
      case 'wave': return this.createWave();
      case 'fire': return this.createFire();
      case 'bird': return this.createBird();
      case 'cricket': return this.createCricket();
      default: return null;
    }
  }
}
