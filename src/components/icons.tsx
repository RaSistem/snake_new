interface IconProps {
  className?: string;
}

export function IconPlay({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export function IconPause({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
    </svg>
  );
}

export function IconRestart({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

export function IconSoundOn({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 6a9 9 0 0 1 0 12" />
    </svg>
  );
}

export function IconSoundOff({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
      <path d="m16 9 5 6" />
      <path d="m21 9-5 6" />
    </svg>
  );
}

export function IconTrophy({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3" />
      <path d="M17 6h3v2a3 3 0 0 1-3 3" />
    </svg>
  );
}

export function IconCrown({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 8.5 7.2 12 12 5.5 16.8 12 21 8.5V17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V8.5Z" />
    </svg>
  );
}

export function IconBolt({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />
    </svg>
  );
}

export function IconGauge({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 14a8 8 0 1 1 16 0" />
      <path d="M12 14 15.5 9" />
      <path d="M4 18h16" />
    </svg>
  );
}

export function IconChevron({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m6 14 6-6 6 6" />
    </svg>
  );
}

export function IconSwipe({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M9 11V6a1.8 1.8 0 0 1 3.6 0v5" />
      <path d="M12.6 11.5V9a1.7 1.7 0 0 1 3.4 0v3.5a7 7 0 0 1-7 7H9a6.6 6.6 0 0 1-4.7-2L2.5 15a1.6 1.6 0 0 1 2.3-2.3L6 14V8" />
      <path d="m18.5 3.5 2 2-2 2" />
    </svg>
  );
}

export function LogoMark({ className = "w-11 h-11" }: IconProps) {
  return (
    <div
      className={`${className} logo-breathe flex items-center justify-center rounded-xl border border-[#2e6b51] bg-gradient-to-b from-[#123528] to-[#0b2018] shadow-[0_0_28px_-8px_rgba(82,224,125,0.6)]`}
    >
      <svg viewBox="0 0 40 40" className="w-[68%] h-[68%]" fill="none" aria-hidden>
        <path
          d="M10 30c0-5 5-5 10-5s10 0 10-5-5-5-10-5-8 0-8-4"
          stroke="#52e07d"
          strokeWidth="4.4"
          strokeLinecap="round"
        />
        <circle cx="12" cy="9.5" r="3.4" fill="#c8ffd6" />
        <circle cx="11" cy="8.8" r="1" fill="#0a1f16" />
        <circle cx="31" cy="31.5" r="2.4" fill="#ff6b52" />
      </svg>
    </div>
  );
}
