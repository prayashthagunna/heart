import React, { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
  alpha: number;
  targetAlpha: number;
  delay: number;
}

export default function TextHeart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];

    const text = "i love you";
    const fontSize = 14;

    const heart = (t: number) => {
      return {
        x: 16 * Math.pow(Math.sin(t), 3),
        y:
          -(13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)),
      };
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      init();
    };

    const init = () => {
      points = [];

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const scale = Math.min(window.innerWidth, window.innerHeight) / 45;

      // OUTER HEART (dense again like original)
      for (let t = 0; t < Math.PI * 2; t += 0.06) {
        const { x, y } = heart(t);

        points.push({
          x: cx + x * scale,
          y: cy + y * scale,
          alpha: 0,
          targetAlpha: 0.9,
          delay: Math.random() * 1500,
        });
      }

      // INNER LAYERS (full density restored)
      for (let s = 0.2; s < 1; s += 0.2) {
        for (let t = 0; t < Math.PI * 2; t += 0.12) {
          const { x, y } = heart(t);

          points.push({
            x: cx + x * scale * s,
            y: cy + y * scale * s,
            alpha: 0,
            targetAlpha: 0.5,
            delay: Math.random() * 2000,
          });
        }
      }
    };

    let start: number | null = null;

    const draw = (time: number) => {
      if (!start) start = time;
      const elapsed = time - start;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      let allVisible = true;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        if (elapsed > p.delay) {
          p.alpha += (p.targetAlpha - p.alpha) * 0.03;
        }

        if (p.alpha < 0.85) allVisible = false;

        ctx.fillStyle = `rgba(255, 77, 109, ${p.alpha})`;
        ctx.fillText(text, p.x, p.y);
      }

      // 👉 AFTER ANIMATION SHOW CENTER TEXT
      if (allVisible && elapsed > 2500) {
        setReveal(true);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* CENTER REVEAL TEXT */}
      {reveal && (
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-pink-500 font-mono tracking-widest">
            <div className="text-xl glow-text">DECRYPTED</div>
            <div className="text-xs mt-2 opacity-60">RE-ENCRYPTING...</div>
          </div>
        </div>
      )}
    </div>
  );
}