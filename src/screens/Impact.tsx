import React from 'react';
import { useApp } from '../store';
import { EmptyState } from '../components/ui';
import type { Screen } from '../types';

function MetricCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1`}>
      <span className="text-2xl">{icon}</span>
      <p className={`font-display font-black text-2xl ${color}`}>{value}</p>
      <p className="text-[var(--muted-foreground)] text-xs">{label}</p>
    </div>
  );
}

export function ImpactScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state } = useApp();
  const { user, transactions } = state;

  const myTx = transactions.filter(
    (t) => t.buyerId === user?.id || t.sellerId === user?.id
  );
  const completed = myTx.filter((t) => t.status === 'completed');
  const itemsReused = completed.length;
  const moneySaved = myTx.filter(t => t.buyerId === user?.id)
    .reduce((sum, t) => sum + (t.agreedPrice ?? 0), 0);
  const givenAway = completed.filter((t) => t.transactionType === 'give-away').length;
  const exchanges = completed.filter((t) => t.transactionType === 'exchange').length;
  const rentals = completed.filter((t) => t.transactionType === 'rent').length;

  const hasActivity = itemsReused > 0 || moneySaved > 0;

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">Your THRIFTLY Impact ♻️</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {!hasActivity && (
          <div className="mb-6">
            <EmptyState
              icon="🌱"
              title="Your impact starts here."
              body="Your impact will appear after you complete your first reuse activity."
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetricCard icon="♻️" value={itemsReused.toString()} label="Items Reused" color="text-[var(--primary)]" />
          <MetricCard icon="💚" value={`₹${moneySaved.toLocaleString('en-IN')}`} label="Money Saved" color="text-green-400" />
          <MetricCard icon="🎁" value={givenAway.toString()} label="Items Given Away" color="text-amber-400" />
          <MetricCard icon="🔄" value={exchanges.toString()} label="Successful Exchanges" color="text-blue-400" />
          <MetricCard icon="🕒" value={rentals.toString()} label="Successful Rentals" color="text-purple-400" />
          <MetricCard icon="⭐" value={(user?.thriftPoints ?? 0).toString()} label="Thrift Points" color="text-yellow-400" />
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <p className="font-display font-semibold text-sm text-[var(--foreground)] mb-1">Keep it going! 🌍</p>
          <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
            Every item reused is one less item wasted. By choosing Thriftly, you&apos;re helping build a more sustainable campus community.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ThriftPointsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state } = useApp();
  const { user, transactions } = state;
  const pts = user?.thriftPoints ?? 0;
  const nextLevel = 100;
  const progress = Math.min((pts % nextLevel) / nextLevel, 1);

  const myTx = transactions.filter(
    (t) => (t.buyerId === user?.id || t.sellerId === user?.id) && t.status === 'completed'
  );

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">Thrift Points ⭐</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {/* Points card */}
        <div className="bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/30 border border-[var(--primary)]/30 rounded-2xl p-6 text-center">
          <p className="text-[var(--muted-foreground)] text-sm mb-1">Your Points</p>
          <p className="font-display font-black text-5xl text-[var(--primary)]">{pts}</p>
          <p className="text-[var(--secondary-foreground)] text-xs mt-1">pts</p>
        </div>

        {/* Progress */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-[var(--foreground)] text-sm font-display font-semibold">Next Level</span>
            <span className="text-[var(--muted-foreground)] text-xs">{pts % nextLevel}/{nextLevel} pts</span>
          </div>
          <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {/* Activity history */}
        <div>
          <p className="font-display font-semibold text-sm text-[var(--foreground)] mb-3">Activity History</p>
          {myTx.length === 0 ? (
            <EmptyState icon="⭐" title="No points yet." body="Complete a reuse activity to earn points." />
          ) : (
            <div className="flex flex-col gap-2">
              {myTx.slice(0, 10).map((tx) => {
                const listing = state.listings.find((l) => l.id === tx.listingId);
                return (
                  <div key={tx.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-[var(--foreground)] text-sm font-medium">{listing?.title ?? 'Item Reused'}</p>
                      <p className="text-[var(--muted-foreground)] text-xs capitalize">{tx.transactionType.replace('-', ' ')}</p>
                    </div>
                    <span className="text-yellow-400 font-display font-bold text-sm">+10 pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LeaderboardScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">Campus Leaderboard 🏆</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <EmptyState
          icon="🏆"
          title="Not enough activity yet."
          body="Leaderboard will appear once students start completing transactions."
        />
      </div>
    </div>
  );
}
