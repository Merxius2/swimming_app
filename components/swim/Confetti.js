import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['#3B5BFF', '#7B5BFF', '#F59E0B', '#EF4444', '#22C55E', '#EC4899', '#06B6D4', '#FDE047'];

const spawnBurst = (particles, originX, originY, count) => {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 10;
    particles.push({
      x: originX + (Math.random() - 0.5) * 80,
      y: originY + (Math.random() - 0.5) * 40,
      w: 5 + Math.random() * 7,
      h: 3 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      opacity: 1,
      life: 1,
    });
  }
};

export default function Confetti({ active = true, duration = 5500, particleCount = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    let raf = 0;
    let running = true;
    const particles = [];
    const startedAt = performance.now();
    let lastSpawn = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    spawnBurst(particles, window.innerWidth / 2, window.innerHeight * 0.38, particleCount);

    const tick = (now) => {
      if (!running) return;

      if (now - startedAt < 1800 && now - lastSpawn > 180) {
        spawnBurst(
          particles,
          window.innerWidth / 2 + (Math.random() - 0.5) * 160,
          window.innerHeight * 0.32,
          24
        );
        lastSpawn = now;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = 0;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.vx *= 0.99;
        p.rotation += p.spin;
        p.life -= 0.008;
        p.opacity = Math.max(0, p.life);

        if (p.opacity <= 0) return;
        alive += 1;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (alive > 0 && now - startedAt < duration) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [active, duration, particleCount]);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 10001 }}
      aria-hidden="true"
    />,
    document.body
  );
}
