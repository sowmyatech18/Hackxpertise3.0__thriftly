import React, { useState } from 'react';
import { useApp } from '../store';
import {
  Card, EmptyState, SectionHeader, StatusBadge, TransactionBadge,
  WishlistButton, ImgPlaceholder, CategoryChip, VerifiedBadge,
} from '../components/ui';
import type { Screen, Listing, Category } from '../types';

const CATEGORIES: { value: Category | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🏷️' },
  { value: 'books', label: 'Books', icon: '📚' },
  { value: 'electronics', label: 'Electronics', icon: '💻' },
  { value: 'furniture', label: 'Furniture', icon: '🪑' },
  { value: 'fashion', label: 'Fashion', icon: '👕' },
  { value: 'bags', label: 'Bags', icon: '🎒' },
  { value: 'stationery', label: 'Stationery', icon: '✏️' },
  { value: 'hostel-essentials', label: 'Hostel', icon: '🛏️' },
  { value: 'other', label: 'Other', icon: '📦' },
];

function ListingCard({
  listing,
  onTap,
  onWishlist,
  isSaved,
}: {
  listing: Listing;
  onTap: () => void;
  onWishlist: () => void;
  isSaved: boolean;
}) {
  const savings =
    listing.originalPrice && listing.price && listing.originalPrice > listing.price
      ? listing.originalPrice - listing.price
      : null;

  return (
    <Card onClick={onTap} className="overflow-hidden flex-shrink-0 w-44">
      <div className="relative">
        {listing.photos[0] ? (
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="w-full h-36 rounded-t-2xl object-cover"
          />
        ) : (
          <ImgPlaceholder className="w-full h-36 rounded-t-2xl" />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <TransactionBadge type={listing.transactionType} />
          {listing.isUrgent && (
            <span className="bg-red-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-display">⚡ URGENT</span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <WishlistButton saved={isSaved} onToggle={onWishlist} />
        </div>
      </div>
      <div className="p-3">
        <p className="text-[var(--foreground)] text-xs font-display font-semibold line-clamp-2 leading-tight mb-1.5">
          {listing.title || '[Item Name]'}
        </p>
        <div className="flex items-center justify-between">
          {listing.transactionType === 'give-away' ? (
            <span className="text-green-400 font-bold text-sm font-display">FREE 🎁</span>
          ) : listing.transactionType === 'rent' ? (
            <span className="text-amber-400 font-bold text-sm font-display">
              ₹{listing.rentalRateDay?.toLocaleString('en-IN')}/day
            </span>
          ) : listing.price ? (
            <span className="text-[var(--primary)] font-bold text-sm font-display">
              ₹{listing.price.toLocaleString('en-IN')}
            </span>
          ) : (
            <span className="text-[var(--muted-foreground)] text-sm">₹ —</span>
          )}
          {savings && (
            <span className="text-green-400 text-[9px] font-semibold bg-green-500/10 px-1.5 py-0.5 rounded-full">
              Save ₹{savings.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div className="mt-1.5">
          <StatusBadge status={listing.status} />
        </div>
      </div>
    </Card>
  );
}

function SectionRow({
  title,
  listings,
  onItemTap,
  onWishlist,
  savedIds,
  onListItem,
}: {
  title: string;
  listings: Listing[];
  onItemTap: (l: Listing) => void;
  onWishlist: (id: string) => void;
  savedIds: Set<string>;
  onListItem: () => void;
}) {
  if (listings.length === 0) {
    return (
      <div className="mb-6">
        <SectionHeader title={title} />
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <p className="text-[var(--muted-foreground)] text-sm">No items listed yet.</p>
          <p className="text-[var(--muted-foreground)] text-xs">Be the first to list something.</p>
          <button
            onClick={onListItem}
            className="px-4 py-2 bg-[var(--primary)]/15 text-[var(--primary)] rounded-xl text-xs font-display font-semibold"
          >
            List an Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <SectionHeader title={title} action="See All" />
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {listings.map((l) => (
          <ListingCard
            key={l.id}
            listing={l}
            onTap={() => onItemTap(l)}
            onWishlist={() => onWishlist(l.id)}
            isSaved={savedIds.has(l.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function HomeScreen({
  navigate,
  onProductSelect,
}: {
  navigate: (s: Screen) => void;
  onProductSelect: (id: string) => void;
}) {
  const { state, dispatch } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const { user, listings, wishlist } = state;

  const savedIds = new Set(wishlist.map((w) => w.listingId));

  const availableListings = listings.filter((l) => l.status === 'available');
  const filtered =
    activeCategory === 'all' ? availableListings : availableListings.filter((l) => l.category === activeCategory);

  const giveAway = filtered.filter((l) => l.transactionType === 'give-away');
  const rents = filtered.filter((l) => l.transactionType === 'rent');
  const urgent = filtered.filter((l) => l.isUrgent);
  const withSavings = filtered.filter(
    (l) => l.originalPrice && l.price && l.originalPrice > l.price
  );

  function toggleWishlist(id: string) {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
  }

  function goToListing(l: Listing) {
    onProductSelect(l.id);
    navigate('product-detail');
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[var(--muted-foreground)] text-xs mb-0.5">Good morning 👋</p>
            <h1 className="font-display font-bold text-xl text-[var(--foreground)]">
              {user?.name ? `Hi, ${user.name}` : 'Hi there 👋'}
            </h1>
            {user?.verified && <VerifiedBadge small />}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('notifications')} className="relative p-2 bg-[var(--secondary)] rounded-xl">
              <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {state.notifications.some((n) => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <button onClick={() => navigate('profile')} className="w-9 h-9 bg-[var(--primary)]/20 rounded-full flex items-center justify-center text-[var(--primary)] font-display font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </button>
          </div>
        </div>

        {/* Search */}
        <button
          onClick={() => navigate('explore')}
          className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 flex items-center gap-3 text-left"
        >
          <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[var(--muted-foreground)] text-sm">Search books, calculators, laptops…</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Categories */}
        <div className="flex gap-2 px-5 py-4 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeCategory === cat.value
                  ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/40'
                  : 'bg-[var(--secondary)] border border-[var(--border)]'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className={`text-[10px] font-display font-semibold whitespace-nowrap ${
                activeCategory === cat.value ? 'text-[var(--primary)]' : 'text-[var(--secondary-foreground)]'
              }`}>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="px-5 pb-6">
          <SectionRow title="🔥 Trending Items" listings={filtered.slice(0, 6)} onItemTap={goToListing} onWishlist={toggleWishlist} savedIds={savedIds} onListItem={() => navigate('create-listing')} />
          <SectionRow title="🆕 Recently Listed" listings={filtered.slice(0, 6)} onItemTap={goToListing} onWishlist={toggleWishlist} savedIds={savedIds} onListItem={() => navigate('create-listing')} />
          <SectionRow title="💸 Best Deals" listings={withSavings} onItemTap={goToListing} onWishlist={toggleWishlist} savedIds={savedIds} onListItem={() => navigate('create-listing')} />
          <SectionRow title="🎁 Give Away" listings={giveAway} onItemTap={goToListing} onWishlist={toggleWishlist} savedIds={savedIds} onListItem={() => navigate('create-listing')} />
          <SectionRow title="⚡ Urgent Sales" listings={urgent} onItemTap={goToListing} onWishlist={toggleWishlist} savedIds={savedIds} onListItem={() => navigate('create-listing')} />
          <SectionRow title="🕒 Rent Nearby" listings={rents} onItemTap={goToListing} onWishlist={toggleWishlist} savedIds={savedIds} onListItem={() => navigate('create-listing')} />
        </div>
      </div>
    </div>
  );
}
