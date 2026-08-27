import { useCallback, useEffect, useRef, useState } from "react";
import { sound } from "./audio";

export type Difficulty = "easy" | "normal" | "hard";
export type Status = "idle" | "countdown" | "playing" | "paused" | "over";

export interface Cell {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
  color: string;
  text?: string;
}

export const COLS = 21;
export const ROWS = 21;
export const BONUS_EVERY = 5;
export const BONUS_TTL = 6500;
const COUNT_MS = 650;

export const DIFFICULTIES: Record<
  Difficulty,
  { label: string; step: number; mult: number; desc: string }
> = {
  easy: { label: "Легко", step: 165, mult: 1, desc: "Разминка перед боем" },
  normal: { label: "Средне", step: 115, mult: 2, desc: "Классический темп" },
  hard: { label: "Сложно", step: 78, mult: 3, desc: "Только для смелых" },
};

const bestKey = (d: Difficulty) => `snake-best-${d}`;

function readBest(d: Difficulty): number {
  try {
    return Number(localStorage.getItem(bestKey(d))) || 0;
  } catch {
    return 0;
  }
}

function readDiff(): Difficulty {
  try {
    const v = localStorage.getItem("snake-difficulty");
    if (v === "easy" || v === "normal" || v === "hard") return v;
  } catch {
    /* ignore */
  }
  return "normal";
}

/* палитра тела змейки: хвост -> голова */
const TAIL = [24, 118, 72];
const MID = [82, 224, 125];
const HEAD = [200, 255, 216];

function segColor(f: number): string {
  const a = f < 0.5 ? TAIL : MID;
  const b = f < 0.5 ? MID : HEAD;
  const u = f < 0.5 ? f / 0.5 : (f - 0.5) / 0.5;
  const r = Math.round(a[0] + (b[0] - a[0]) * u);
  const g = Math.round(a[1] + (b[1] - a[1]) * u);
  const bl = Math.round(a[2] + (b[2] - a[2]) * u);
  return `rgb(${r},${g},${bl})`;
}

function starPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  points = 5,
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function useSnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => readBest(readDiff()));
  const [length, setLength] = useState(3);
  const [countdown, setCountdown] = useState(3);
  const [newRecord, setNewRecord] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => readDiff());
  const [muted, setMuted] = useState(sound.muted);

  const g = useRef({
    snake: [] as Cell[],
    prev: [] as Cell[],
    dir: { x: 1, y: 0 } as Cell,
    queue: [] as Cell[],
    food: { x: 15, y: 10 } as Cell,
    bonus: null as null | { x: number; y: number; until: number },
    eaten: 0,
    score: 0,
    grow: 0,
    acc: 0,
    last: 0,
    particles: [] as Particle[],
    shake: 0,
    status: "idle" as Status,
    diff: readDiff(),
    step: DIFFICULTIES[readDiff()].step,
    mult: DIFFICULTIES[readDiff()].mult,
    best: 0,
    countEnd: 0,
    lastCount: 4,
    size: 0,
    dpr: 1,
    cell: 0,
    touchX: 0,
    touchY: 0,
    touchT: 0,
  }).current;

  const syncStatus = useCallback(
    (s: Status) => {
      g.status = s;
      setStatus(s);
    },
    [g],
  );

  const freeCell = useCallback((): Cell | null => {
    const occ = new Set<number>();
    for (const p of g.snake) occ.add(p.y * COLS + p.x);
    occ.add(g.food.y * COLS + g.food.x);
    if (g.bonus) occ.add(g.bonus.y * COLS + g.bonus.x);
    const free: number[] = [];
    for (let i = 0; i < COLS * ROWS; i++) if (!occ.has(i)) free.push(i);
    if (!free.length) return null;
    const v = free[(Math.random() * free.length) | 0];
    return { x: v % COLS, y: (v / COLS) | 0 };
  }, [g]);

  const burst = useCallback(
    (cx: number, cy: number, colors: string[], count = 14, power = 1) => {
      const cell = g.cell || 20;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = (60 + Math.random() * 165) * power;
        g.particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 30,
          life: 0,
          ttl: 420 + Math.random() * 380,
          size: cell * (0.06 + Math.random() * 0.1),
          color: colors[(Math.random() * colors.length) | 0],
        });
      }
    },
    [g],
  );

  const floater = useCallback(
    (text: string, cx: number, cy: number, color: string) => {
      g.particles.push({ x: cx, y: cy, vx: 0, vy: -48, life: 0, ttl: 900, size: 0, color, text });
    },
    [g],
  );

  const reset = useCallback(() => {
    const midY = (ROWS / 2) | 0;
    g.snake = [
      { x: 8, y: midY },
      { x: 7, y: midY },
      { x: 6, y: midY },
    ];
    g.prev = g.snake.map((p) => ({ ...p }));
    g.dir = { x: 1, y: 0 };
    g.queue = [];
    g.grow = 0;
    g.eaten = 0;
    g.score = 0;
    g.acc = 0;
    g.particles = [];
    g.shake = 0;
    g.bonus = null;
    const f = freeCell();
    if (f) g.food = f;
    setScore(0);
    setLength(3);
    setNewRecord(false);
  }, [g, freeCell]);

  const finish = useCallback(() => {
    if (g.score > g.best) {
      g.best = g.score;
      setBest(g.score);
      setNewRecord(g.score > 0);
      try {
        localStorage.setItem(bestKey(g.diff), String(g.score));
      } catch {
        /* ignore */
      }
    }
    syncStatus("over");
  }, [g, syncStatus]);

  const die = useCallback(
    (at: Cell) => {
      const cell = g.cell || 20;
      const cx = (Math.min(COLS - 1, Math.max(0, at.x)) + 0.5) * cell;
      const cy = (Math.min(ROWS - 1, Math.max(0, at.y)) + 0.5) * cell;
      burst(cx, cy, ["#ff5c4d", "#ff9d5c", "#ffd0c0"], 26, 1.5);
      g.shake = 1;
      sound.die();
      finish();
    },
    [g, burst, finish],
  );

  const stepOnce = useCallback(() => {
    let d = g.dir;
    while (g.queue.length) {
      const n = g.queue.shift()!;
      if (!(n.x === -d.x && n.y === -d.y) && !(n.x === d.x && n.y === d.y)) {
        d = n;
        break;
      }
    }
    g.dir = d;
    g.prev = g.snake.map((p) => ({ ...p }));
    const head = g.snake[0];
    const nh = { x: head.x + d.x, y: head.y + d.y };

    if (nh.x < 0 || nh.y < 0 || nh.x >= COLS || nh.y >= ROWS) {
      die(nh);
      return;
    }
    const willGrow = g.grow > 0;
    const body = willGrow ? g.snake : g.snake.slice(0, -1);
    if (body.some((p) => p.x === nh.x && p.y === nh.y)) {
      die(nh);
      return;
    }
    g.snake.unshift(nh);
    if (willGrow) g.grow--;
    else g.snake.pop();
    setLength(g.snake.length);

    const cell = g.cell || 20;
    if (nh.x === g.food.x && nh.y === g.food.y) {
      const pts = 10 * g.mult;
      g.score += pts;
      setScore(g.score);
      g.grow += 1;
      g.eaten++;
      sound.eat();
      const cx = (g.food.x + 0.5) * cell;
      const cy = (g.food.y + 0.5) * cell;
      burst(cx, cy, ["#ff8a70", "#ffc857", "#7ae08a"], 12);
      floater(`+${pts}`, cx, cy - cell * 0.45, "#ffd9a0");
      const f = freeCell();
      if (!f) {
        finish();
        return;
      }
      g.food = f;
      if (g.eaten % BONUS_EVERY === 0) {
        const b = freeCell();
        if (b) {
          g.bonus = { ...b, until: performance.now() + BONUS_TTL };
          sound.tick();
        }
      }
    } else if (g.bonus && nh.x === g.bonus.x && nh.y === g.bonus.y) {
      const pts = 50 * g.mult;
      g.score += pts;
      setScore(g.score);
      g.grow += 2;
      sound.bonus();
      const cx = (g.bonus.x + 0.5) * cell;
      const cy = (g.bonus.y + 0.5) * cell;
      burst(cx, cy, ["#ffc857", "#ffe3a0", "#ff9d5c"], 22, 1.4);
      floater(`+${pts}`, cx, cy - cell * 0.45, "#ffc857");
      g.bonus = null;
    }
  }, [g, die, burst, floater, freeCell, finish]);

  const start = useCallback(() => {
    if (g.status === "countdown") return;
    sound.unlock();
    sound.click();
    reset();
    syncStatus("countdown");
    setCountdown(3);
    g.lastCount = 4;
    g.countEnd = performance.now() + 3 * COUNT_MS + 60;
  }, [g, reset, syncStatus]);

  const pause = useCallback(() => {
    if (g.status === "playing") {
      syncStatus("paused");
      sound.click();
    }
  }, [g, syncStatus]);

  const resume = useCallback(() => {
    if (g.status === "paused") {
      g.last = performance.now();
      syncStatus("playing");
      sound.click();
    }
  }, [g, syncStatus]);

  const togglePause = useCallback(() => {
    if (g.status === "playing") pause();
    else if (g.status === "paused") resume();
  }, [g, pause, resume]);

  const queueDir = useCallback(
    (x: number, y: number) => {
      if (g.status === "idle" || g.status === "over") start();
      if (g.status !== "playing" && g.status !== "countdown") return;
      const lastQ = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
      if ((x === -lastQ.x && y === -lastQ.y) || (x === lastQ.x && y === lastQ.y)) return;
      if (g.queue.length < 3) g.queue.push({ x, y });
    },
    [g, start],
  );

  const tap = useCallback(() => {
    if (g.status === "idle" || g.status === "over") start();
    else if (g.status === "paused") resume();
  }, [g, start, resume]);

  const changeDifficulty = useCallback(
    (d: Difficulty) => {
      if (d === g.diff) return;
      g.diff = d;
      g.step = DIFFICULTIES[d].step;
      g.mult = DIFFICULTIES[d].mult;
      g.best = readBest(d);
      setDifficulty(d);
      setBest(g.best);
      setNewRecord(false);
      try {
        localStorage.setItem("snake-difficulty", d);
      } catch {
        /* ignore */
      }
      sound.click();
      if (g.status === "playing" || g.status === "paused" || g.status === "countdown") start();
    },
    [g, start],
  );

  const toggleMuted = useCallback(() => {
    setMuted(sound.toggle());
  }, []);

  /* ---------- отрисовка ---------- */

  const render = useCallback(
    (now: number, dt: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const S = g.size;
      if (!S) return;

      ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
      ctx.clearRect(0, 0, S, S);
      if (g.shake > 0) {
        g.shake = Math.max(0, g.shake - dt / 480);
        const m = g.shake * g.shake * 9;
        ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
      }
      const cell = S / COLS;

      /* доска */
      ctx.fillStyle = "#081a13";
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = "rgba(126,240,164,0.03)";
      for (let y = 0; y < ROWS; y++) {
        for (let x = y % 2; x < COLS; x += 2) ctx.fillRect(x * cell, y * cell, cell, cell);
      }
      const vg = ctx.createRadialGradient(S / 2, S / 2, S * 0.2, S / 2, S / 2, S * 0.72);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(1,8,5,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, S, S);

      /* еда */
      const fx = (g.food.x + 0.5) * cell;
      const fy = (g.food.y + 0.5) * cell;
      const pulse = 1 + Math.sin(now / 280) * 0.09;
      const fr = cell * 0.32 * pulse;
      ctx.save();
      ctx.shadowColor = "rgba(255,107,82,0.75)";
      ctx.shadowBlur = cell * 0.55;
      const fg = ctx.createRadialGradient(fx - fr * 0.35, fy - fr * 0.35, fr * 0.15, fx, fy, fr);
      fg.addColorStop(0, "#ffb59f");
      fg.addColorStop(0.55, "#ff6b52");
      fg.addColorStop(1, "#e04a35");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#6fe08d";
      ctx.beginPath();
      ctx.ellipse(fx + fr * 0.18, fy - fr * 1.1, fr * 0.36, fr * 0.16, -0.6, 0, Math.PI * 2);
      ctx.fill();

      /* бонусная звезда с кольцом времени */
      if (g.bonus) {
        const bx = (g.bonus.x + 0.5) * cell;
        const by = (g.bonus.y + 0.5) * cell;
        const frac = Math.max(0, (g.bonus.until - now) / BONUS_TTL);
        const wob = 1 + Math.sin(now / 160) * 0.1;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(now / 500);
        ctx.shadowColor = "rgba(255,200,87,0.9)";
        ctx.shadowBlur = cell * 0.7;
        ctx.fillStyle = "#ffc857";
        starPath(ctx, 0, 0, cell * 0.2 * wob, cell * 0.42 * wob, 5);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "rgba(255,200,87,0.85)";
        ctx.lineWidth = Math.max(2, cell * 0.07);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(bx, by, cell * 0.58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
        ctx.stroke();
      }

      /* змейка */
      const t = g.status === "playing" ? Math.min(1, g.acc / g.step) : 1;
      const pts = g.snake.map((p, i) => {
        const q = g.prev[Math.min(i, g.prev.length - 1)] || p;
        return {
          x: (q.x + (p.x - q.x) * t + 0.5) * cell,
          y: (q.y + (p.y - q.y) * t + 0.5) * cell,
        };
      });
      const n = pts.length;
      if (n > 0) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        /* мягкое свечение под телом */
        ctx.strokeStyle = "rgba(94,240,138,0.14)";
        ctx.lineWidth = cell * 0.98;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        /* сегменты тела, от хвоста к голове */
        for (let i = n - 1; i >= 1; i--) {
          const f = 1 - i / Math.max(1, n - 1);
          ctx.strokeStyle = segColor(f);
          ctx.lineWidth = cell * (0.44 + 0.26 * f);
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[i - 1].x, pts[i - 1].y);
          ctx.stroke();
        }
        /* голова */
        const h = pts[0];
        ctx.save();
        ctx.shadowColor = "rgba(140,255,170,0.65)";
        ctx.shadowBlur = cell * 0.5;
        ctx.fillStyle = "#c8ffd6";
        ctx.beginPath();
        ctx.arc(h.x, h.y, cell * 0.36, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        /* глаза по направлению движения */
        const d = g.dir;
        const px = -d.y;
        const py = d.x;
        const eo = cell * 0.17;
        const fo = cell * 0.13;
        for (const s of [1, -1]) {
          const ex = h.x + d.x * fo + px * eo * s;
          const ey = h.y + d.y * fo + py * eo * s;
          ctx.fillStyle = "#f4fff6";
          ctx.beginPath();
          ctx.arc(ex, ey, cell * 0.11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#0a1f16";
          ctx.beginPath();
          ctx.arc(ex + d.x * cell * 0.04, ey + d.y * cell * 0.04, cell * 0.055, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* частицы и всплывающие очки */
      g.particles = g.particles.filter((p) => (p.life += dt) < p.ttl);
      for (const p of g.particles) {
        const k = 1 - p.life / p.ttl;
        p.x += (p.vx * dt) / 1000;
        p.y += (p.vy * dt) / 1000;
        if (!p.text) p.vy += (140 * dt) / 1000;
        ctx.globalAlpha = Math.max(0, k);
        if (p.text) {
          ctx.font = `700 ${cell * 0.46}px Unbounded, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size * k), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      /* рамка поля */
      ctx.strokeStyle =
        g.status === "over" ? "rgba(255,92,77,0.55)" : "rgba(126,240,164,0.28)";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, S - 2, S - 2);
    },
    [g],
  );

  /* ---------- главный цикл + размер ---------- */

  useEffect(() => {
    g.best = readBest(g.diff);
    reset();

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    let ro: ResizeObserver | null = null;
    if (wrap && canvas) {
      ro = new ResizeObserver(() => {
        const w = wrap.clientWidth;
        if (!w) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(w * dpr);
        g.size = w;
        g.dpr = dpr;
        g.cell = w / COLS;
      });
      ro.observe(wrap);
    }

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = g.last ? Math.min(now - g.last, 100) : 0;
      g.last = now;

      if (g.status === "countdown") {
        const rem = Math.ceil((g.countEnd - now) / COUNT_MS);
        if (rem > 0 && rem !== g.lastCount) {
          g.lastCount = rem;
          setCountdown(rem);
          sound.tick();
        }
        if (now >= g.countEnd) {
          syncStatus("playing");
          g.acc = 0;
          sound.go();
        }
      } else if (g.status === "playing") {
        g.acc += dt;
        let guard = 0;
        while (g.status === "playing" && g.acc >= g.step && guard++ < 5) {
          g.acc -= g.step;
          stepOnce();
        }
      }

      if (g.bonus && now > g.bonus.until) {
        const cell = g.cell || 20;
        burst(
          (g.bonus.x + 0.5) * cell,
          (g.bonus.y + 0.5) * cell,
          ["rgba(255,200,87,0.85)", "rgba(255,227,160,0.8)"],
          8,
          0.5,
        );
        g.bonus = null;
      }

      render(now, dt);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [g, reset, syncStatus, stepOnce, render, burst]);

  /* ---------- клавиатура + автопауза ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = e.code;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(c)) {
        e.preventDefault();
      }
      switch (c) {
        case "ArrowUp":
        case "KeyW":
          queueDir(0, -1);
          return;
        case "ArrowDown":
        case "KeyS":
          queueDir(0, 1);
          return;
        case "ArrowLeft":
        case "KeyA":
          queueDir(-1, 0);
          return;
        case "ArrowRight":
        case "KeyD":
          queueDir(1, 0);
          return;
        default:
          break;
      }
      if (c === "Space") {
        if (e.repeat) return;
        if (g.status === "idle" || g.status === "over") start();
        else togglePause();
        return;
      }
      if (c === "Enter") {
        if (g.status === "idle" || g.status === "over") start();
        return;
      }
      if (c === "KeyR") {
        start();
        return;
      }
      if (c === "KeyP" || c === "Escape") {
        togglePause();
      }
    };
    const onVis = () => {
      if (document.hidden) pause();
    };
    const onFirstPointer = () => sound.unlock();

    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointerdown", onFirstPointer, { once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onFirstPointer);
    };
  }, [g, queueDir, start, togglePause, pause]);

  /* ---------- свайпы и тапы по полю ---------- */

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      g.touchX = t.clientX;
      g.touchY = t.clientY;
      g.touchT = performance.now();
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - g.touchX;
      const dy = t.clientY - g.touchY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const dtm = performance.now() - g.touchT;
      if (Math.max(adx, ady) < 14 && dtm < 350) {
        tap();
        return;
      }
      if (adx > ady) queueDir(dx > 0 ? 1 : -1, 0);
      else queueDir(0, dy > 0 ? 1 : -1);
    };
    wrap.addEventListener("touchstart", onStart, { passive: true });
    wrap.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      wrap.removeEventListener("touchstart", onStart);
      wrap.removeEventListener("touchend", onEnd);
    };
  }, [g, queueDir, tap]);

  return {
    canvasRef,
    wrapRef,
    status,
    score,
    best,
    length,
    countdown,
    newRecord,
    difficulty,
    mult: DIFFICULTIES[difficulty].mult,
    step: DIFFICULTIES[difficulty].step,
    muted,
    toggleMuted,
    start,
    togglePause,
    queueDir,
    changeDifficulty,
    tap,
  };
}
