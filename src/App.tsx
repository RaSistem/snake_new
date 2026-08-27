import type { ReactNode } from "react";
import {
  useSnakeGame,
  DIFFICULTIES,
  type Difficulty,
  BONUS_EVERY,
} from "./game/useSnakeGame";
import {
  IconPlay,
  IconPause,
  IconRestart,
  IconSoundOn,
  IconSoundOff,
  IconTrophy,
  IconCrown,
  IconBolt,
  IconGauge,
  IconChevron,
  IconSwipe,
  LogoMark,
} from "./components/icons";

const FIREFLIES = [
  { left: "8%", top: "78%", dur: 16, delay: 0, amber: false },
  { left: "22%", top: "90%", dur: 19, delay: 3, amber: true },
  { left: "46%", top: "84%", dur: 14, delay: 1.2, amber: false },
  { left: "64%", top: "92%", dur: 21, delay: 5, amber: true },
  { left: "80%", top: "76%", dur: 17, delay: 2.2, amber: false },
  { left: "91%", top: "88%", dur: 15, delay: 4, amber: true },
  { left: "35%", top: "96%", dur: 23, delay: 7, amber: false },
];

function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#06120e]" />
      <div className="bg-grid absolute inset-0" />
      <div className="absolute -top-44 -left-44 h-[540px] w-[540px] rounded-full bg-[#123d2c] opacity-55 blur-[130px]" />
      <div className="absolute -bottom-52 -right-36 h-[560px] w-[560px] rounded-full bg-[#403012] opacity-35 blur-[140px]" />
      <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-[#0e4a3a] opacity-45 blur-[110px]" />
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className={`firefly ${f.amber ? "firefly--amber" : ""}`}
          style={{
            left: f.left,
            top: f.top,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
      <div className="vignette absolute inset-0" />
    </div>
  );
}

function Overlay({ children, dim = true }: { children: ReactNode; dim?: boolean }) {
  return (
    <div
      className={`animate-fade absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-6 text-center ${
        dim ? "bg-[rgba(4,14,10,0.78)] backdrop-blur-[3px]" : "pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-extrabold tracking-[0.28em] text-[#5f8874] uppercase">
      {children}
    </p>
  );
}

function StatBox({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="rounded-[10px] border border-[#1d4634] bg-[#0a1d16] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#5f8874] uppercase">
        {icon}
        {label}
      </div>
      <div className="font-display mt-1 text-lg font-bold text-[#cdeedd]">{value}</div>
    </div>
  );
}

function LengthIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2.4" opacity="0.45" />
      <circle cx="12" cy="12" r="2.4" opacity="0.7" />
      <circle cx="19" cy="12" r="2.4" />
    </svg>
  );
}

function DBtn({
  onPress,
  label,
  children,
  accent = false,
}: {
  onPress: () => void;
  label: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`dpad-btn ${accent ? "border-[#2e6b51] text-[#7cf0a0]" : ""}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
    >
      {children}
    </button>
  );
}

export default function App() {
  const game = useSnakeGame();
  const d = DIFFICULTIES[game.difficulty];
  const { status } = game;
  const clickable = status === "idle" || status === "over" || status === "paused";

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        {/* ---------- шапка ---------- */}
        <header className="anim-rise flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <LogoMark />
            <div>
              <h1 className="font-display text-[22px] leading-none font-black tracking-tight text-[#eafff1] sm:text-[26px]">
                ЗМЕЙ<span className="text-[#52e07d]">КА</span>
              </h1>
              <p className="mt-1.5 text-[10px] font-bold tracking-[0.32em] text-[#5f8874] uppercase">
                неоновая аркада
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="chip hidden items-center gap-2 text-xs font-bold text-[#9fe8bb] sm:flex">
              <IconBolt className="h-3.5 w-3.5 text-[#ffc857]" />
              очки ×{game.mult}
            </div>
            <button
              className="icon-btn"
              onClick={game.toggleMuted}
              aria-label={game.muted ? "Включить звук" : "Выключить звук"}
              title={game.muted ? "Включить звук" : "Выключить звук"}
            >
              {game.muted ? <IconSoundOff /> : <IconSoundOn />}
            </button>
          </div>
        </header>

        <main className="mt-5 grid gap-5 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          {/* ---------- игровое поле ---------- */}
          <section className="anim-rise" style={{ animationDelay: "0.06s" }}>
            {/* компактный HUD на телефонах */}
            <div className="mb-3 grid grid-cols-[1fr_1fr_auto_auto] gap-2 sm:hidden">
              <div className="chip">
                <Label>Счёт</Label>
                <div key={game.score} className="score-pop font-display text-xl font-extrabold text-[#eafff1]">
                  {game.score}
                </div>
              </div>
              <div className="chip">
                <Label>Рекорд</Label>
                <div className="font-display flex items-center gap-1.5 text-xl font-extrabold text-[#ffc857]">
                  <IconTrophy className="h-4 w-4" />
                  {game.best}
                </div>
              </div>
              <button
                className="icon-btn h-auto"
                onClick={game.togglePause}
                aria-label={status === "paused" ? "Продолжить" : "Пауза"}
              >
                {status === "paused" ? <IconPlay /> : <IconPause />}
              </button>
              <button className="icon-btn h-auto" onClick={game.start} aria-label="Начать заново">
                <IconRestart />
              </button>
            </div>

            <div
              ref={game.wrapRef}
              onClick={game.tap}
              className={`board-frame relative aspect-square w-full touch-none select-none ${
                clickable ? "cursor-pointer" : ""
              }`}
            >
              <canvas ref={game.canvasRef} className="absolute inset-0 h-full w-full" />

              {status === "idle" && (
                <Overlay>
                  <LogoMark className="h-14 w-14" />
                  <h2 className="font-display text-2xl font-extrabold text-[#eafff1] sm:text-3xl">
                    Готовы играть?
                  </h2>
                  <p className="max-w-xs text-sm leading-relaxed text-[#7fa895]">
                    Собирайте яблоки, ловите бонусные звёзды — и следите, чтобы хвост не догнал
                    голову.
                  </p>
                  <div className="chip text-xs font-bold text-[#9fe8bb]">
                    Сложность: {d.label} · очки ×{game.mult}
                  </div>
                  <button
                    className="btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      game.start();
                    }}
                  >
                    <IconPlay />
                    Начать игру
                  </button>
                  <p className="text-[11px] leading-relaxed text-[#5f8874]">
                    <span className="keycap">Пробел</span> — старт ·{" "}
                    <span className="keycap">↑↓←→</span> / <span className="keycap">WASD</span> —
                    движение
                  </p>
                </Overlay>
              )}

              {status === "countdown" && (
                <Overlay dim={false}>
                  <div
                    key={game.countdown}
                    className="count-pop font-display text-[92px] leading-none font-black text-[#7cf0a0] drop-shadow-[0_0_32px_rgba(82,224,125,0.55)] sm:text-[120px]"
                  >
                    {game.countdown}
                  </div>
                  <p className="text-[11px] font-bold tracking-[0.4em] text-[#7fa895] uppercase">
                    приготовьтесь
                  </p>
                </Overlay>
              )}

              {status === "paused" && (
                <Overlay>
                  <div className="chip flex items-center gap-2 text-xs font-extrabold tracking-[0.25em] text-[#9fe8bb] uppercase">
                    <IconPause className="h-3.5 w-3.5" />
                    Пауза
                  </div>
                  <h2 className="font-display text-2xl font-extrabold text-[#eafff1] sm:text-3xl">
                    Передышка
                  </h2>
                  <p className="text-sm text-[#7fa895]">
                    Змейка замерла. Текущий счёт —{" "}
                    <b className="font-display text-[#eafff1]">{game.score}</b>.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      game.togglePause();
                    }}
                  >
                    <IconPlay />
                    Продолжить
                  </button>
                  <p className="text-[11px] text-[#5f8874]">
                    <span className="keycap">Пробел</span> — продолжить ·{" "}
                    <span className="keycap">R</span> — заново
                  </p>
                </Overlay>
              )}

              {status === "over" && (
                <Overlay>
                  {game.newRecord && (
                    <div className="badge-pulse flex items-center gap-2 rounded-full border border-[#ffc857] bg-[#3d2f10] px-4 py-1.5 text-[11px] font-extrabold tracking-[0.22em] text-[#ffc857] uppercase">
                      <IconCrown className="h-4 w-4" />
                      Новый рекорд!
                    </div>
                  )}
                  <h2 className="font-display text-2xl font-extrabold text-[#ff8a70] sm:text-3xl">
                    Игра окончена
                  </h2>
                  <div className="font-display text-6xl font-black text-[#eafff1]">
                    {game.score}
                  </div>
                  <p className="text-sm text-[#7fa895]">
                    Рекорд на «{d.label}»:{" "}
                    <b className="font-display text-[#ffc857]">{game.best}</b>
                    <span className="mx-2 text-[#3d5c4d]">·</span>
                    длина змейки: <b className="font-display text-[#cdeedd]">{game.length}</b>
                  </p>
                  <button
                    className="btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      game.start();
                    }}
                  >
                    <IconRestart />
                    Ещё раз
                  </button>
                  <p className="text-[11px] text-[#5f8874]">
                    <span className="keycap">Enter</span> — быстрый реванш
                  </p>
                </Overlay>
              )}
            </div>

            {/* крестовина на сенсорных экранах */}
            <div className="mx-auto mt-4 grid w-56 grid-cols-3 gap-2 md:hidden">
              <span />
              <DBtn onPress={() => game.queueDir(0, -1)} label="Вверх">
                <IconChevron />
              </DBtn>
              <span />
              <DBtn onPress={() => game.queueDir(-1, 0)} label="Влево">
                <IconChevron className="h-6 w-6 -rotate-90" />
              </DBtn>
              <DBtn
                accent
                onPress={() => {
                  if (status === "idle" || status === "over") game.start();
                  else game.togglePause();
                }}
                label={status === "paused" ? "Продолжить" : "Пауза"}
              >
                {status === "playing" || status === "countdown" ? <IconPause /> : <IconPlay />}
              </DBtn>
              <DBtn onPress={() => game.queueDir(1, 0)} label="Вправо">
                <IconChevron className="h-6 w-6 rotate-90" />
              </DBtn>
              <span />
              <DBtn onPress={() => game.queueDir(0, 1)} label="Вниз">
                <IconChevron className="h-6 w-6 rotate-180" />
              </DBtn>
              <span />
            </div>
            <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#5f8874] md:hidden">
              <IconSwipe className="h-4 w-4" />
              Свайпы по полю тоже работают
            </p>
          </section>

          {/* ---------- боковая панель ---------- */}
          <aside className="space-y-4">
            <section className="panel anim-rise p-5" style={{ animationDelay: "0.12s" }}>
              <div className="hidden items-start justify-between sm:flex">
                <div>
                  <Label>Счёт</Label>
                  <div
                    key={game.score}
                    className="score-pop font-display mt-1 text-[54px] leading-none font-black text-[#eafff1]"
                  >
                    {game.score}
                  </div>
                </div>
                <div className="chip flex items-center gap-1.5 text-xs font-extrabold text-[#ffc857]">
                  <IconBolt className="h-3.5 w-3.5" />×{game.mult}
                </div>
              </div>

              <div className="mt-1 flex items-center gap-2 border-t border-[#1d4634] pt-4 text-sm first:mt-0 first:border-t-0 first:pt-0 sm:mt-4">
                <IconTrophy className="h-4 w-4 text-[#ffc857]" />
                <span className="text-[#7fa895]">Рекорд · {d.label}</span>
                <span className="font-display ml-auto font-bold text-[#ffc857]">{game.best}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatBox icon={<LengthIcon />} label="Длина" value={game.length} />
                <StatBox
                  icon={<IconGauge className="h-3.5 w-3.5" />}
                  label="Темп"
                  value={`${(1000 / game.step).toFixed(1)}/с`}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  className="btn-ghost justify-center disabled:pointer-events-none disabled:opacity-40"
                  onClick={game.togglePause}
                  disabled={status === "idle" || status === "over" || status === "countdown"}
                >
                  {status === "paused" ? <IconPlay /> : <IconPause />}
                  {status === "paused" ? "Дальше" : "Пауза"}
                </button>
                <button className="btn-ghost justify-center" onClick={game.start}>
                  <IconRestart />
                  Заново
                </button>
              </div>
            </section>

            <section className="panel anim-rise p-5" style={{ animationDelay: "0.18s" }}>
              <Label>Сложность</Label>
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-[10px] border border-[#1d4634] bg-[#0a1d16] p-1">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map((k) => {
                  const active = game.difficulty === k;
                  return (
                    <button
                      key={k}
                      onClick={() => game.changeDifficulty(k)}
                      className={`rounded-lg py-2 text-[13px] transition-all duration-150 ${
                        active
                          ? "bg-[#173d2f] font-extrabold text-[#7cf0a0] shadow-[inset_0_1px_0_rgba(160,255,190,0.12),0_0_18px_-6px_rgba(82,224,125,0.55)]"
                          : "font-bold text-[#7fa895] hover:text-[#cdeedd]"
                      }`}
                    >
                      {DIFFICULTIES[k].label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                <span className="text-[#7fa895]">{d.desc}</span>
                <span className="font-extrabold text-[#ffc857]">очки ×{game.mult}</span>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-[#5f8874]">
                Смена сложности во время партии начинает новый забег. Бонусная звезда — каждая{" "}
                {BONUS_EVERY}-я еда.
              </p>
            </section>

            <section className="panel anim-rise hidden p-5 md:block" style={{ animationDelay: "0.24s" }}>
              <Label>Управление</Label>
              <ul className="mt-3 space-y-2.5 text-[13px] text-[#9fc4b2]">
                <li className="flex items-center justify-between gap-3">
                  <span>Движение</span>
                  <span className="flex gap-1">
                    <span className="keycap">↑↓←→</span>
                    <span className="keycap">WASD</span>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span>Старт и пауза</span>
                  <span className="keycap">Пробел</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span>Перезапуск</span>
                  <span className="keycap">R</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span>Пауза</span>
                  <span className="flex gap-1">
                    <span className="keycap">P</span>
                    <span className="keycap">Esc</span>
                  </span>
                </li>
              </ul>
              <p className="mt-4 flex items-center gap-2 border-t border-[#1d4634] pt-3 text-[11px] text-[#5f8874]">
                <IconSwipe className="h-4 w-4 shrink-0" />
                На сенсорных экранах — свайпы по полю и экранные кнопки.
              </p>
            </section>
          </aside>
        </main>

        <footer
          className="anim-rise mt-8 pb-4 text-center text-[11px] text-[#4f7563]"
          style={{ animationDelay: "0.3s" }}
        >
          <p>
            Рекорды хранятся локально в вашем браузере
            <span className="mx-2 text-[#2c4a3c]">·</span>
            Стены смертельны — как в классике
          </p>
        </footer>
      </div>
    </div>
  );
}
