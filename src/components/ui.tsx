import React, { ReactNode, useState } from 'react';
import type { ListingStatus, TransactionType, Condition } from '../types';

/* ─── Buttons ─── */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3.5 rounded-2xl font-display font-semibold text-base transition-all duration-200
        ${disabled
          ? 'opacity-40 cursor-not-allowed bg-[var(--primary)]'
          : 'bg-[var(--primary)] hover:brightness-110 active:scale-[0.98]'}
        text-white ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3.5 rounded-2xl font-display font-semibold text-base border border-[var(--primary)] text-[var(--primary)]
        hover:bg-[var(--primary)]/10 active:scale-[0.98] transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

export function TextButton({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[var(--primary)] font-medium text-sm hover:opacity-80 transition-opacity ${className}`}
    >
      {children}
    </button>
  );
}

/* ─── Inputs ─── */
export function TextInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  rightEl,
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  rightEl?: ReactNode;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5 font-display">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[var(--secondary)] border rounded-xl px-4 py-3 text-sm text-[var(--foreground)]
            focus:border-[var(--primary)] transition-colors
            ${error ? 'border-red-500' : 'border-[var(--border)]'}
            ${rightEl ? 'pr-12' : ''}`}
        />
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  error?: string;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5 font-display">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`w-full bg-[var(--secondary)] border rounded-xl px-4 py-3 text-sm text-[var(--foreground)]
          focus:border-[var(--primary)] transition-colors resize-none
          ${error ? 'border-red-500' : 'border-[var(--border)]'}`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Dropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5 font-display">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[var(--secondary)] border rounded-xl px-4 py-3 text-sm text-[var(--foreground)]
          focus:border-[var(--primary)] transition-colors appearance-none
          ${error ? 'border-red-500' : 'border-[var(--border)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ─── Badges ─── */
const STATUS_CONFIG: Record<ListingStatus, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-green-500/15 text-green-400' },
  'offer-pending': { label: 'Offer Pending', color: 'bg-amber-500/15 text-amber-400' },
  'proposal-pending': { label: 'Proposal Pending', color: 'bg-amber-500/15 text-amber-400' },
  'request-pending': { label: 'Request Pending', color: 'bg-amber-500/15 text-amber-400' },
  'rental-request': { label: 'Rental Request', color: 'bg-blue-500/15 text-blue-400' },
  reserved: { label: 'Reserved', color: 'bg-blue-500/15 text-blue-400' },
  sold: { label: 'Sold', color: 'bg-gray-500/15 text-gray-400' },
  exchanged: { label: 'Exchanged', color: 'bg-gray-500/15 text-gray-400' },
  'given-away': { label: 'Given Away', color: 'bg-gray-500/15 text-gray-400' },
  'rented-out': { label: 'Rented Out', color: 'bg-gray-500/15 text-gray-400' },
  'return-pending': { label: 'Return Pending', color: 'bg-amber-500/15 text-amber-400' },
  returned: { label: 'Returned', color: 'bg-gray-500/15 text-gray-400' },
  draft: { label: 'Draft', color: 'bg-purple-500/15 text-purple-400' },
  removed: { label: 'Removed', color: 'bg-red-500/15 text-red-400' },
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-500/15 text-gray-400' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-display ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

const TX_CONFIG: Record<TransactionType, { label: string; icon: string; color: string }> = {
  sell: { label: 'Sell', icon: '💰', color: 'bg-violet-500/15 text-violet-300' },
  exchange: { label: 'Exchange', icon: '🔄', color: 'bg-blue-500/15 text-blue-300' },
  'give-away': { label: 'Give Away', icon: '🎁', color: 'bg-green-500/15 text-green-300' },
  rent: { label: 'Rent', icon: '🕒', color: 'bg-amber-500/15 text-amber-300' },
};

export function TransactionBadge({ type }: { type: TransactionType }) {
  const cfg = TX_CONFIG[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-display ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export function VerifiedBadge({ small }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[var(--accent-foreground)] font-semibold font-display ${small ? 'text-[10px]' : 'text-xs'}`}>
      <svg className={small ? 'w-3 h-3' : 'w-3.5 h-3.5'} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Campus Verified
    </span>
  );
}

/* ─── Rating ─── */
export function StarRating({ rating, count, large }: { rating?: number; count?: number; large?: boolean }) {
  if (rating == null) {
    return <span className="text-[var(--muted-foreground)] text-xs">No ratings yet.</span>;
  }
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  return (
    <div className="flex items-center gap-1">
      {stars.map((filled, i) => (
        <svg key={i} className={`${large ? 'w-5 h-5' : 'w-3.5 h-3.5'} ${filled ? 'text-amber-400' : 'text-[var(--border)]'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {count != null && <span className="text-[var(--muted-foreground)] text-xs ml-0.5">({count})</span>}
    </div>
  );
}

/* ─── Card ─── */
export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--card)] border border-[var(--border)] rounded-2xl ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Empty State ─── */
export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <div className="text-5xl mb-2">{icon}</div>
      <p className="font-display font-semibold text-[var(--foreground)] text-base">{title}</p>
      {body && <p className="text-[var(--muted-foreground)] text-sm">{body}</p>}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-3 px-6 py-2.5 bg-[var(--primary)] text-white rounded-xl font-display font-semibold text-sm hover:brightness-110 transition-all"
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ─── Toast ─── */
export function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium font-display shadow-lg
      ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
      {message}
    </div>
  );
}

/* ─── Modal ─── */
export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-[var(--card)] border-t border-[var(--border)] rounded-t-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-5" />
        {children}
      </div>
    </div>
  );
}

/* ─── Top Nav ─── */
export function TopNav({
  title,
  onBack,
  rightEl,
  transparent,
}: {
  title?: string;
  onBack?: () => void;
  rightEl?: ReactNode;
  transparent?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${transparent ? '' : 'border-b border-[var(--border)] bg-[var(--background)]'}`}>
      <div className="w-10">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1 text-[var(--foreground)] hover:opacity-70 transition-opacity">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
      {title && (
        <h1 className="font-display font-semibold text-base text-[var(--foreground)] flex-1 text-center">{title}</h1>
      )}
      <div className="w-10 flex justify-end">{rightEl}</div>
    </div>
  );
}

/* ─── Condition label ─── */
export function conditionLabel(c: Condition): string {
  return { new: 'New', 'like-new': 'Like New', good: 'Good', used: 'Used' }[c];
}

/* ─── Category chip ─── */
export function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-display font-semibold whitespace-nowrap transition-all
        ${active
          ? 'bg-[var(--primary)] text-white'
          : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'}`}
    >
      {label}
    </button>
  );
}

/* ─── Toggle ─── */
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${value ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
    >
      <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
    </button>
  );
}

/* ─── Progress Step ─── */
export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${i < current ? 'w-8 bg-[var(--primary)]' : i === current ? 'w-6 bg-[var(--primary)]/60' : 'w-3 bg-[var(--border)]'}`}
        />
      ))}
    </div>
  );
}

/* ─── WishlistButton ─── */
export function WishlistButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
    >
      <svg className={`w-5 h-5 transition-colors ${saved ? 'text-red-400 fill-red-400' : 'text-[var(--muted-foreground)]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}

/* ─── Safety Banner ─── */
export function SafetyBanner() {
  return (
    <div className="flex items-center gap-2 bg-[var(--accent)]/20 border border-[var(--accent-foreground)]/20 rounded-xl px-4 py-3">
      <span className="text-base">🛡️</span>
      <p className="text-[var(--accent-foreground)] text-xs font-medium">Meet at a public campus exchange point.</p>
    </div>
  );
}

/* ─── Section Header ─── */
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display font-bold text-sm text-[var(--foreground)]">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-[var(--primary)] text-xs font-medium">
          {action}
        </button>
      )}
    </div>
  );
}

/* ─── Image placeholder ─── */
export function ImgPlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={`bg-[var(--secondary)] flex flex-col items-center justify-center gap-2 ${className}`}>
      <svg className="w-8 h-8 text-[var(--border)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {label && <p className="text-[var(--muted-foreground)] text-xs">{label}</p>}
    </div>
  );
}

/* ─── Price input with ₹ prefix ─── */
export function PriceInput({
  label,
  value,
  onChange,
  placeholder = 'Enter amount',
  error,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5 font-display">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] font-semibold text-sm">₹</span>
        <input
          type="number"
          min="0"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[var(--secondary)] border rounded-xl pl-8 pr-4 py-3 text-sm text-[var(--foreground)]
            focus:border-[var(--primary)] transition-colors
            ${error ? 'border-red-500' : 'border-[var(--border)]'}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ─── Smart Savings Display ─── */
export function SmartSavings({ original, thriftly }: { original: number; thriftly: number }) {
  const savings = original - thriftly;
  if (savings <= 0 || !original) return null;
  const pct = Math.round((savings / original) * 100);
  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
      <p className="text-green-400 text-xs font-display font-semibold mb-2">💚 Smart Savings</p>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--muted-foreground)]">New Price</span>
        <span className="text-[var(--foreground)] line-through">₹{original.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between text-sm mt-1">
        <span className="text-[var(--muted-foreground)]">THRIFTLY Price</span>
        <span className="text-[var(--primary)] font-semibold">₹{thriftly.toLocaleString('en-IN')}</span>
      </div>
      <div className="border-t border-green-500/20 mt-2 pt-2 flex justify-between text-sm">
        <span className="text-green-400 font-semibold">You Save</span>
        <span className="text-green-400 font-bold">₹{savings.toLocaleString('en-IN')} ({pct}%)</span>
      </div>
    </div>
  );
}
