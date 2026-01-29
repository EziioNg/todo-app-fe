'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

type Mouse = {
  x: number | null;
  y: number | null;
  radius: number;
};

class Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  density: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    // this.size = Math.random() * 2 + 1;
    this.size = Math.random() * 1.5 + 0.8;
    this.density = Math.random() * 30 + 1;
  }

  draw(ctx: CanvasRenderingContext2D, color: string, opacity = 0.4) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, ${opacity})`;
    ctx.fill();
  }

  update(
    ctx: CanvasRenderingContext2D,
    mouse: Mouse,
    canvas: HTMLCanvasElement,
    color: string,
    opacity: number,
  ) {
    if (mouse.x !== null && mouse.y !== null) {
      const rect = canvas.getBoundingClientRect();
      const dx = mouse.x - rect.left - this.x;
      const dy = mouse.y - rect.top - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const moveX = (dx / distance) * force * this.density;
        const moveY = (dy / distance) * force * this.density;

        this.x -= moveX;
        this.y -= moveY;
      } else {
        // Return to base position
        this.x += (this.baseX - this.x) / 10;
        this.y += (this.baseY - this.y) / 10;
      }
    }

    this.draw(ctx, color, opacity);
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];

    const mouse: Mouse = { x: null, y: null, radius: 150 };

    const color =
      resolvedTheme === 'dark'
        ? '228, 228, 231' // zinc-200
        : // : '63, 63, 70'; // zinc-700
          '82, 82, 91'; // zinc-600

    const dotOpacity = resolvedTheme === 'dark' ? 0.35 : 0.45;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initParticles(rect.width, rect.height);
    };

    const initParticles = (width: number, height: number) => {
      particles.length = 0;
      const count = (width * height) / 7000;

      for (let i = 0; i < count; i++) {
        particles.push(
          new Particle(Math.random() * width, Math.random() * height),
        );
      }
    };

    const connectParticles = (width: number, height: number) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = dx * dx + dy * dy;

          const maxDistance = (width / 7) * (height / 7);

          if (distance < maxDistance) {
            const opacity = 1 - distance / 20000;
            ctx.strokeStyle = `rgba(${color}, ${0.25 * opacity})`;
            ctx.lineWidth = 0.6;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = canvas.getBoundingClientRect();

      particles.forEach((p) => p.update(ctx, mouse, canvas, color, dotOpacity));

      connectParticles(rect.width, rect.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationId);

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', resizeCanvas);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}
