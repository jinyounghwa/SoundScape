import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store';

interface VisualizerProps {
  width?: number;
  height?: number;
}

export function Visualizer({ width = 600, height = 200 }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audio, settings } = useStore();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!settings.visualizerEnabled) return;

    const initAnalyser = async () => {
      try {
        const { MixerController } = await import('../audio/MixerController');
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const mixer = new MixerController(audioContext);
        const analyserNode = mixer.enableAnalyser();
        setAnalyser(analyserNode);
      } catch (error) {
        console.error('Failed to initialize analyser:', error);
      }
    };

    if (audio.isPlaying) {
      initAnalyser();
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audio.isPlaying, settings.visualizerEnabled]);

  useEffect(() => {
    if (!analyser || !settings.visualizerEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = (width / bufferLength) * 2.5;
    let barHeight: number;
    let x = 0;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(15, 15, 26, 0.2)';
      ctx.fillRect(0, 0, width, height);

      x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] ?? 0;
        barHeight = (value / 255) * height;

        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, '#6366F1');
        gradient.addColorStop(0.5, '#8B5CF6');
        gradient.addColorStop(1, '#06B6D4');

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth - 1, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, settings.visualizerEnabled, width, height]);

  if (!settings.visualizerEnabled || !audio.isPlaying) {
    return null;
  }

  return (
    <div className="w-full flex justify-center my-6">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg"
      />
    </div>
  );
}
