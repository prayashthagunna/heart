import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; tx: number; ty: number };
type BGText   = { x: number; y: number; speed: number; alpha: number };
type Bomb     = { x: number; y: number; tx: number; ty: number; done: boolean };
type Explosion= { x: number; y: number; vx: number; vy: number; life: number };
type Phase    = "fall" | "form" | "hold" | "bomb" | "chaos" | "reform";

export default function TextHeart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf: number | null = null;
    let particles: Particle[] = [];
    let bg: BGText[] = [];
    let bombs: Bomb[] = [];
    let explosions: Explosion[] = [];
    let phase: Phase = "fall";
    let phaseStart: number = performance.now();

    const heartPoints = (): { x: number; y: number }[] => {
      const pts: { x: number; y: number }[] = [];
      for (let t = 0; t < Math.PI * 2; t += 0.05) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        pts.push({ x, y });
      }
      return pts;
    };

    const setPhase = (p: Phase): void => {
      phase = p;
      phaseStart = performance.now();
    };

    const spawnExplosion = (x: number, y: number): void => {
      for (let i = 0; i < 90; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 8;
        explosions.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 });
      }
    };

    const spawnBombs = (cx: number, cy: number): void => {
      bombs = [
        { x: -60,                    y: -60, tx: cx, ty: cy, done: false },
        { x: window.innerWidth + 60, y: -60, tx: cx, ty: cy, done: false },
      ];
    };

    const init = (): void => {
      const pts = heartPoints();

      particles = pts.map((p) => ({
        x: Math.random() * window.innerWidth,
        y: -Math.random() * window.innerHeight,
        vx: 0, vy: 0,
        tx: p.x, ty: p.y,
      }));

      bg = Array.from({ length: 140 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 0.15 + Math.random() * 0.35,
        alpha: 0.02 + Math.random() * 0.04,
      }));

      bombs = [];
      explosions = [];
      phase = "fall";
      phaseStart = performance.now();
    };

    const draw = (time: number): void => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const sc = Math.min(window.innerWidth, window.innerHeight) / 42;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "12px monospace";

      // background floating up
      for (const b of bg) {
        b.y -= b.speed;
        if (b.y < -20) { b.y = window.innerHeight + 20; b.x = Math.random() * window.innerWidth; }
        ctx.fillStyle = `rgba(255,255,255,${b.alpha})`;
        ctx.fillText("i love you", b.x, b.y);
      }

      const elapsed = time - phaseStart;
      const pts = heartPoints();

      // phase transitions
      if (phase === "fall"   && elapsed > 2500) setPhase("form");
      if (phase === "form"   && elapsed > 2500) setPhase("hold");
      if (phase === "hold"   && elapsed > 1200) { spawnBombs(cx, cy); setPhase("bomb"); }
      if (phase === "bomb"   && bombs.length > 0 && bombs.every((b) => b.done)) setPhase("chaos");
      if (phase === "chaos"  && elapsed > 1800) setPhase("reform");
      if (phase === "reform" && elapsed > 2600) {
        const hpts = heartPoints();
        particles.forEach((p, i) => {
          p.x = Math.random() * window.innerWidth;
          p.y = -Math.random() * window.innerHeight;
          p.vx = 0; p.vy = 0;
          p.tx = hpts[i].x; p.ty = hpts[i].y;
        });
        bombs = [];
        explosions = [];
        setPhase("fall");
      }

      // bombs
      if (phase === "bomb") {
        for (const bomb of bombs) {
          if (bomb.done) continue;
          const dx = bomb.tx - bomb.x;
          const dy = bomb.ty - bomb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 30) {
            bomb.done = true;
            spawnExplosion(bomb.x, bomb.y);
            for (const p of particles) {
              const pdx = p.x - bomb.x;
              const pdy = p.y - bomb.y;
              const pd = Math.sqrt(pdx * pdx + pdy * pdy) + 1;
              const force = Math.max(0, (600 - pd)) / 600 * 28;
              p.vx += (pdx / pd) * force;
              p.vy += (pdy / pd) * force;
            }
          } else {
            bomb.x += (dx / dist) * 5;
            bomb.y += (dy / dist) * 5;
          }
          ctx.font = "22px serif";
          ctx.fillText("💣", bomb.x, bomb.y);
          ctx.font = "12px monospace";
        }
      }

      // explosion particles
      for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.x += e.vx; e.y += e.vy;
        e.vx *= 0.92; e.vy *= 0.92;
        e.life -= 0.02;
        if (e.life <= 0) { explosions.splice(i, 1); continue; }
        ctx.globalAlpha = e.life;
        ctx.fillStyle = `hsl(${20 + Math.random() * 40}, 100%, 60%)`;
        ctx.fillText("i love you", e.x, e.y);
        ctx.globalAlpha = 1;
      }

      // particles
      ctx.fillStyle = "rgba(255,90,140,0.9)";
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const t = pts[i];
        const tx = cx + t.x * sc;
        const ty = cy + t.y * sc;

        if (phase === "fall") {
          p.vy += 0.1;
          p.y  += p.vy;
          p.x  += (tx - p.x) * 0.02;
        } else if (phase === "form") {
          p.vx += (tx - p.x) * 0.04;
          p.vy += (ty - p.y) * 0.04;
        } else if (phase === "hold") {
          p.vx += (tx - p.x) * 0.06;
          p.vy += (ty - p.y) * 0.06;
        } else if (phase === "bomb") {
          if (!bombs.every((b) => b.done)) {
            p.vx += (tx - p.x) * 0.04;
            p.vy += (ty - p.y) * 0.04;
          }
        } else if (phase === "chaos") {
          p.vx += (Math.random() - 0.5) * 1.5;
          p.vy += (Math.random() - 0.5) * 1.5;
        } else if (phase === "reform") {
          p.vx += (tx - p.x) * 0.05;
          p.vy += (ty - p.y) * 0.05;
        }

        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x  += p.vx;
        p.y  += p.vy;

        ctx.fillText("i love you", p.x, p.y);
      }

      raf = requestAnimationFrame(draw);
    };

    const setup = (): void => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full bg-black" />;
}