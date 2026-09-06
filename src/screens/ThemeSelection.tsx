import React, { useState } from 'react';
import { useApp } from '../store';
import type { Screen, Theme } from '../types';

interface ThemeCardProps {
  id: Theme;
  selected: boolean;
  onSelect: () => void;
  /* preview colors */
  bg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
  icon: string;
  name: string;
  description: string;
}

function ThemeCard({
  id, selected, onSelect,
  bg, cardBg, textPrimary, textSecondary, accent, border,
  icon, name, description,
}: ThemeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-3xl border-2 transition-all duration-200 overflow-hidden active:scale-[0.98]
        ${selected
          ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20'
          : 'border-[var(--border)]'
        }`}
    >
      {/* Mini UI preview */}
      <div className="h-40 relative overflow-hidden" style={{ background: bg }}>
        {/* Fake top bar */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-16 rounded-full" style={{ background: textSecondary, opacity: 0.5 }} />
            <div className="h-2.5 w-24 rounded-full" style={{ background: textPrimary, opacity: 0.8 }} />
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: accent + '33' }}>
            <div className="w-4 h-4 rounded-full" style={{ background: accent }} />
          </div>
        </div>

        {/* Fake search bar */}
        <div className="mx-3 mb-2 h-7 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }} />

        {/* Fake category chips */}
        <div className="flex gap-1.5 px-3 mb-2">
          {[accent, cardBg, cardBg].map((c, i) => (
            <div key={i} className="h-5 w-10 rounded-full" style={{ background: i === 0 ? accent : cardBg, border: `1px solid ${border}` }} />
          ))}
        </div>

        {/* Fake cards row */}
        <div className="flex gap-2 px-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex-1 rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="h-10" style={{ background: textSecondary, opacity: 0.15 }} />
              <div className="p-1.5">
                <div className="h-1.5 w-12 rounded-full mb-1" style={{ background: textPrimary, opacity: 0.5 }} />
                <div className="h-2 w-8 rounded-full" style={{ background: accent }} />
              </div>
            </div>
          ))}
        </div>

        {/* Selected overlay checkmark */}
        {selected && (
          <div className="absolute inset-0 bg-[var(--primary)]/8 flex items-start justify-end p-3">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center shadow">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-sm text-[var(--foreground)]">{name}</p>
            {selected && (
              <span className="text-[10px] font-display font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
                ✓ Selected
              </span>
            )}
          </div>
          <p className="text-[var(--muted-foreground)] text-xs mt-0.5 leading-snug">{description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          selected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

export function ThemeSelectionScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, dispatch } = useApp();
  const [selected, setSelected] = useState<Theme | null>(state.theme);

  function handleSelect(t: Theme) {
    setSelected(t);
    dispatch({ type: 'SET_THEME', payload: t });
  }

  function handleContinue() {
    if (!selected) return;
    navigate('home');
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)] px-5 overflow-y-auto">
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <div className="text-4xl mb-4">✨</div>
        <h1 className="font-display font-bold text-2xl text-[var(--foreground)] leading-tight mb-2">
          Make THRIFTLY yours.
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
          Choose how you want your campus marketplace to look.
        </p>
      </div>

      {/* Theme cards */}
      <div className="flex flex-col gap-4 flex-1">
        <ThemeCard
          id="dark"
          selected={selected === 'dark'}
          onSelect={() => handleSelect('dark')}
          bg="#07071A"
          cardBg="#0F0F24"
          textPrimary="#EDE9FF"
          textSecondary="#7B72A8"
          accent="#9B6EF3"
          border="#242050"
          icon="🌙"
          name="Dark Mode"
          description="Easy on the eyes with THRIFTLY's signature dark look."
        />

        <ThemeCard
          id="light"
          selected={selected === 'light'}
          onSelect={() => handleSelect('light')}
          bg="#F5F4FA"
          cardBg="#FFFFFF"
          textPrimary="#1A1730"
          textSecondary="#7B72A8"
          accent="#7C4FD4"
          border="#D9D3EE"
          icon="☀️"
          name="Light Mode"
          description="Clean, bright and easy to browse."
        />
      </div>

      {/* CTA */}
      <div className="py-6">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-3.5 rounded-2xl font-display font-semibold text-base transition-all duration-200
            ${selected
              ? 'bg-[var(--primary)] text-white hover:brightness-110 active:scale-[0.98]'
              : 'bg-[var(--border)] text-[var(--muted-foreground)] cursor-not-allowed'
            }`}
        >
          Continue
        </button>
        {!selected && (
          <p className="text-center text-[var(--muted-foreground)] text-xs mt-2">
            Select a theme to continue
          </p>
        )}
      </div>
    </div>
  );
}
