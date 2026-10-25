import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import { VisualizerMode } from '../types/music';

interface AudioVisualizerProps {
  mode: VisualizerMode;
  isPlaying: boolean;
  className?: string;
  accentColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  mode,
  isPlaying,
  className = '',
  accentColor = '#6366f1',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const freqData = new Uint8Array(128);
    const timeData = new Uint8Array(128);

    const render = () => {
      animId = requestAnimationFrame(render);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      audioEngine.getVisualizerData(freqData, timeData);

      if (mode === 'bars') {
        renderBars(ctx, width, height, freqData, isPlaying, accentColor);
      } else if (mode === 'wave') {
        renderWave(ctx, width, height, timeData, isPlaying, accentColor);
      } else if (mode === 'circle') {
        renderCircle(ctx, width, height, freqData, isPlaying, accentColor);
      } else if (mode === 'mandala') {
        renderMandala(ctx, width, height, freqData, isPlaying, accentColor);
      }

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, isPlaying, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};

function renderBars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freqData: Uint8Array,
  isPlaying: boolean,
  accent: string
) {
  const barCount = 48;
  const gap = 3;
  const totalBarWidth = (w - (barCount - 1) * gap) / barCount;
  const barWidth = Math.max(2, totalBarWidth);

  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i / barCount) * (freqData.length * 0.75));
    let val = isPlaying ? freqData[dataIndex] / 255 : Math.sin(Date.now() * 0.002 + i * 0.2) * 0.08 + 0.08;
    val = Math.max(0.04, val);

    const barHeight = val * (h - 8);
    const x = i * (barWidth + gap);
    const y = h - barHeight;

    const grad = ctx.createLinearGradient(0, y, 0, h);
    grad.addColorStop(0, accent);
    grad.addColorStop(0.5, '#a855f7');
    grad.addColorStop(1, 'rgba(147, 51, 234, 0.15)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
    ctx.fill();

    // Cap line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, Math.max(0, y - 2), barWidth, 1.5);
  }
}

function renderWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeData: Uint8Array,
  isPlaying: boolean,
  accent: string
) {
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 10;
  ctx.beginPath();

  const sliceWidth = w / (timeData.length - 1);
  let x = 0;

  for (let i = 0; i < timeData.length; i++) {
    let v = isPlaying ? timeData[i] / 128.0 : 1 + Math.sin(Date.now() * 0.003 + i * 0.1) * 0.04;
    const y = (v * h) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.stroke();
  ctx.shadowBlur = 0;

  // Center subtle baseline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
}

function renderCircle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freqData: Uint8Array,
  isPlaying: boolean,
  accent: string
) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(cx, cy) * 0.45;
  const numRays = 40;

  // Inner ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2;
    const dataIdx = Math.floor((i / numRays) * (freqData.length * 0.65));
    const val = isPlaying ? freqData[dataIdx] / 255 : 0.05 + Math.sin(Date.now() * 0.002 + i) * 0.03;
    const rayLen = val * (radius * 0.85);

    const x1 = cx + Math.cos(angle) * radius;
    const y1 = cy + Math.sin(angle) * radius;
    const x2 = cx + Math.cos(angle) * (radius + rayLen);
    const y2 = cy + Math.sin(angle) * (radius + rayLen);

    ctx.strokeStyle = i % 2 === 0 ? accent : '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function renderMandala(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freqData: Uint8Array,
  isPlaying: boolean,
  accent: string
) {
  const cx = w / 2;
  const cy = h / 2;
  const spokes = 8;
  const pts = 16;

  for (let s = 0; s < spokes; s++) {
    const spokeAngle = (s / spokes) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spokeAngle);

    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;

    for (let p = 0; p < pts; p++) {
      const idx = (p * 4) % freqData.length;
      const val = isPlaying ? freqData[idx] / 255 : 0.1;
      const dist = p * 6 + val * 40;
      const angle = (p / pts) * (Math.PI / 2);

      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;

      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }
}
