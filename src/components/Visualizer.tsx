import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store';
import { Icons } from './Icons';

interface VisualizerProps {
  width?: number;
  height?: number;
  getAnalyser: () => AnalyserNode | null;
}

export function Visualizer({ width = 600, height = 200, getAnalyser }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audio, settings } = useStore();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!settings.visualizerEnabled || !audio.isPlaying) {
      setAnalyser(null);
      return;
    }

    const checkAnalyser = () => {
      const node = getAnalyser();
      if (node) {
        setAnalyser(node);
      } else {
        setTimeout(checkAnalyser, 100);
      }
    };

    checkAnalyser();
  }, [audio.isPlaying, settings.visualizerEnabled, getAnalyser]);

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

      ctx.fillStyle = settings.theme === 'dark' ? 'rgba(15, 15, 26, 0.2)' : 'rgba(241, 245, 249, 0.2)';
      ctx.fillRect(0, 0, width, height);

      x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] ?? 0;
        barHeight = (value / 255) * height;

        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        if (settings.theme === 'dark') {
          gradient.addColorStop(0, '#6366F1');
          gradient.addColorStop(0.5, '#8B5CF6');
          gradient.addColorStop(1, '#06B6D4');
        } else {
          gradient.addColorStop(0, '#4F46E5');
          gradient.addColorStop(0.5, '#7C3AED');
          gradient.addColorStop(1, '#0891B2');
        }

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
  }, [analyser, settings.visualizerEnabled, settings.theme, width, height]);

  if (!settings.visualizerEnabled || !audio.isPlaying) {
    return null;
  }

  return (
    <div className="glass-heavy rounded-3xl p-8 shadow-xl overflow-hidden relative card-hover">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Icons.Visualizer className="text-primary" />
          Audio Spectrum
        </h2>
        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-accent/20 text-accent animate-pulse uppercase tracking-wider">
          Live
        </span>
      </div>

      <div className="w-full flex justify-center rounded-2xl overflow-hidden" 
           style={{ background: settings.theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full"
        />
      </div>
    </div>
  );
}
