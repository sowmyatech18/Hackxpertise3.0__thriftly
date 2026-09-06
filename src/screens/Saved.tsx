import React from 'react';
import { useApp } from '../store';
import { EmptyState, TransactionBadge, StatusBadge, WishlistButton, ImgPlaceholder } from '../components/ui';
import type { Screen } from '../types';

export function SavedScreen({
  navigate,
  onProductSelect,
}: {
  navigate: (s: Screen) => void;
  onProductSelect: (id: string) => void;
}) {
  const { state, dispatch } = useApp();
  const { wishlist, listings } = state;

  const savedListings = wishlist
    .map((w) => listings.find((l) => l.id === w.listingId))
    .filter(Boolean) as typeof listings;

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)]">
        <h1 className="font-display font-bold text-xl text-[var(--foreground)]">Saved Items</h1>
        <p className="text-[var(--muted-foreground)] text-xs mt-0.5">{savedListings.length} item{savedListings.length !== 1 ? 's' : ''} saved</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {savedListings.length === 0 ? (
          <EmptyState
            icon="🤍"
            title="No saved items yet."
            body="Tap the heart icon on any listing to save it."
            action="Explore Items"
            onAction={() => navigate('explore')}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {savedListings.map((listing) => {
              const isUnavailable = listing.status !== 'available';
              return (
                <div
                  key={listing.id}
                  onClick={() => { if (!isUnavailable) { onProductSelect(listing.id); navigate('product-detail'); } }}
                  className={`bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden flex gap-3 ${isUnavailable ? 'opacity-60' : 'cursor-pointer active:scale-[0.98] transition-transform'}`}
                >
                  <div className="relative">
                    {listing.photos[0] ? (
                      <img src={listing.photos[0]} alt={listing.title} className="w-24 h-24 flex-shrink-0 rounded-l-2xl object-cover" />
                    ) : (
                      <ImgPlaceholder className="w-24 h-24 flex-shrink-0 rounded-l-2xl rounded-r-none" />
                    )}
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold font-display">UNAVAILABLE</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
                    <div>
                      <TransactionBadge type={listing.transactionType} />
                      <p className="text-[var(--foreground)] text-sm font-display font-semibold mt-1 line-clamp-1">{listing.title}</p>
                      <p className="text-[var(--muted-foreground)] text-xs capitalize">{listing.condition}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--primary)] font-bold text-sm font-display">
                        {listing.transactionType === 'give-away' ? 'FREE 🎁' : listing.price ? `₹${listing.price.toLocaleString('en-IN')}` : '—'}
                      </span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={listing.status} />
                        <WishlistButton
                          saved
                          onToggle={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: listing.id })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
