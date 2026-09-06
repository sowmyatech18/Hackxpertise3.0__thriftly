import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { TopNav, StatusBadge, TransactionBadge, WishlistButton, ImgPlaceholder, EmptyState } from '../components/ui';
import type { Screen, Listing, TransactionType, Condition, Category } from '../types';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'savings' | 'relevant';

export function ExploreScreen({
  navigate,
  onProductSelect,
}: {
  navigate: (s: Screen) => void;
  onProductSelect: (id: string) => void;
}) {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [txFilter, setTxFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [conditionFilter, setConditionFilter] = useState<Condition | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const savedIds = new Set(state.wishlist.map((w) => w.listingId));

  const results = useMemo(() => {
    let list = state.listings.filter((l) => l.status === 'available');
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    if (txFilter !== 'all') list = list.filter((l) => l.transactionType === txFilter);
    if (categoryFilter !== 'all') list = list.filter((l) => l.category === categoryFilter);
    if (conditionFilter !== 'all') list = list.filter((l) => l.condition === conditionFilter);
    if (sort === 'price-asc') list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price-desc') list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === 'savings') {
      list = [...list].sort((a, b) => {
        const sa = (a.originalPrice || 0) - (a.price || 0);
        const sb = (b.originalPrice || 0) - (b.price || 0);
        return sb - sa;
      });
    }
    return list;
  }, [state.listings, query, txFilter, categoryFilter, conditionFilter, sort]);

  const txOptions: { value: TransactionType | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🏷️' },
    { value: 'sell', label: 'Sell', icon: '💰' },
    { value: 'exchange', label: 'Exchange', icon: '🔄' },
    { value: 'give-away', label: 'Give Away', icon: '🎁' },
    { value: 'rent', label: 'Rent', icon: '🕒' },
  ];

  function clearFilters() {
    setTxFilter('all');
    setCategoryFilter('all');
    setConditionFilter('all');
    setSort('newest');
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Search Header */}
      <div className="px-5 pt-8 pb-3 border-b border-[var(--border)]">
        <h1 className="font-display font-bold text-xl text-[var(--foreground)] mb-3">Explore</h1>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-[var(--primary)]/20 border-[var(--primary)]' : 'bg-[var(--secondary)] border-[var(--border)]'}`}
          >
            <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)]"
          >
            {viewMode === 'grid' ? (
              <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Transaction type chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {txOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTxFilter(opt.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                txFilter === opt.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--muted)] flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-[var(--muted-foreground)] text-xs font-display mb-1.5">Condition</p>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value as any)}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)]"
              >
                <option value="all">Any Condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div className="flex-1">
              <p className="text-[var(--muted-foreground)] text-xs font-display mb-1.5">Sort by</p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)]"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Lowest Price</option>
                <option value="price-desc">Highest Price</option>
                <option value="savings">Highest Savings</option>
              </select>
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="text-[var(--primary)] text-xs font-semibold font-display self-end"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="px-5 py-2 flex items-center justify-between">
        <p className="text-[var(--muted-foreground)] text-xs">{results.length} item{results.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {results.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No items match your search."
            body="Try changing your filters."
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {results.map((listing) => (
              <div
                key={listing.id}
                onClick={() => { onProductSelect(listing.id); navigate('product-detail'); }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="relative">
                  {listing.photos[0] ? (
                    <img src={listing.photos[0]} alt={listing.title} className="w-full h-32 object-cover" />
                  ) : (
                    <ImgPlaceholder className="w-full h-32" />
                  )}
                  <div className="absolute top-2 left-2">
                    <TransactionBadge type={listing.transactionType} />
                  </div>
                  <div className="absolute top-2 right-2">
                    <WishlistButton
                      saved={savedIds.has(listing.id)}
                      onToggle={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: listing.id })}
                    />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[var(--foreground)] text-xs font-display font-semibold line-clamp-2">{listing.title}</p>
                  <p className="text-[var(--primary)] font-bold text-sm font-display mt-1">
                    {listing.transactionType === 'give-away' ? 'FREE 🎁' : listing.price ? `₹${listing.price.toLocaleString('en-IN')}` : '—'}
                  </p>
                  <div className="mt-1"><StatusBadge status={listing.status} /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map((listing) => (
              <div
                key={listing.id}
                onClick={() => { onProductSelect(listing.id); navigate('product-detail'); }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform flex gap-3"
              >
                {listing.photos[0] ? (
                  <img src={listing.photos[0]} alt={listing.title} className="w-24 h-24 flex-shrink-0 rounded-l-2xl object-cover" />
                ) : (
                  <ImgPlaceholder className="w-24 h-24 flex-shrink-0 rounded-l-2xl rounded-r-none" />
                )}
                <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
                  <div>
                    <TransactionBadge type={listing.transactionType} />
                    <p className="text-[var(--foreground)] text-sm font-display font-semibold mt-1 line-clamp-1">{listing.title}</p>
                    <p className="text-[var(--muted-foreground)] text-xs mt-0.5 line-clamp-1">{listing.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--primary)] font-bold text-sm font-display">
                      {listing.transactionType === 'give-away' ? 'FREE 🎁' : listing.price ? `₹${listing.price.toLocaleString('en-IN')}` : '—'}
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
