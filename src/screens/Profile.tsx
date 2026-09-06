import React, { useState } from 'react';
import { useApp } from '../store';
import { VerifiedBadge, StarRating, EmptyState, StatusBadge, TransactionBadge } from '../components/ui';
import type { Screen } from '../types';

export function ProfileScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, dispatch } = useApp();
  const { user } = state;

  const menuItems: { label: string; icon: string; screen?: Screen }[] = [
    { label: 'My Listings', icon: '📦', screen: 'my-listings' },
    { label: 'Chats', icon: '💬', screen: 'chat-list' },
    { label: 'My Transactions', icon: '🔁', screen: 'my-transactions' },
    { label: 'My Wishlist', icon: '🤍', screen: 'saved' },
    { label: 'My Impact', icon: '♻️', screen: 'impact' },
    { label: 'My Thrift Points', icon: '⭐', screen: 'thrift-points' },
    { label: 'Settings', icon: '⚙️', screen: 'settings' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto">
      {/* Profile header */}
      <div className="px-5 pt-8 pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-display font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg text-[var(--foreground)]">
              {user?.name || '[Student Name]'}
            </h2>
            {user?.verified ? <VerifiedBadge /> : <p className="text-amber-400 text-xs font-display">Not Verified</p>}
            <div className="mt-1">
              <StarRating rating={user?.rating} count={user?.ratingCount} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={state.listings.filter(l => l.sellerId === user?.id).length.toString()} label="Listings" />
          <StatCard value={state.transactions.length.toString()} label="Trades" />
          <StatCard value={user?.thriftPoints.toString() ?? '0'} label="Points" />
        </div>

        {user?.campus && (
          <div className="mt-3 flex items-center gap-2 text-[var(--muted-foreground)] text-xs">
            <span>🏛️</span>
            <span>{user.campus}</span>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="px-5 py-4 flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.screen && navigate(item.screen)}
            className="flex items-center gap-4 py-3.5 px-3 rounded-xl hover:bg-[var(--secondary)] transition-colors text-left"
          >
            <span className="text-xl w-7">{item.icon}</span>
            <span className="flex-1 text-[var(--foreground)] text-sm font-medium">{item.label}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="flex items-center gap-4 py-3.5 px-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
          >
            <span className="text-xl w-7">🚪</span>
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-3 text-center">
      <p className="font-display font-bold text-xl text-[var(--foreground)]">{value}</p>
      <p className="text-[var(--muted-foreground)] text-xs mt-0.5">{label}</p>
    </div>
  );
}

/* ─── My Listings ─── */
type ListingTab = 'active' | 'pending' | 'completed' | 'drafts' | 'removed';

export function MyListingsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<ListingTab>('active');

  const myListings = state.listings.filter((l) => l.sellerId === state.user?.id);

  const tabs: { key: ListingTab; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'drafts', label: 'Drafts' },
    { key: 'removed', label: 'Removed' },
  ];

  const filtered = myListings.filter((l) => {
    if (tab === 'active') return l.status === 'available';
    if (tab === 'pending') return ['offer-pending', 'proposal-pending', 'request-pending', 'rental-request'].includes(l.status);
    if (tab === 'completed') return ['sold', 'exchanged', 'given-away', 'rented-out', 'returned'].includes(l.status);
    if (tab === 'drafts') return l.status === 'draft';
    if (tab === 'removed') return l.status === 'removed';
    return false;
  });

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">My Listings</h1>
        <button
          onClick={() => navigate('create-listing')}
          className="ml-auto px-3 py-1.5 bg-[var(--primary)] text-white rounded-xl text-xs font-display font-semibold"
        >
          + List
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 py-3 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
              tab === t.key ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📦"
            title="You haven't listed anything yet."
            body={tab === 'active' ? 'List something to get started.' : undefined}
            action={tab === 'active' ? 'List an Item' : undefined}
            onAction={() => navigate('create-listing')}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((listing) => (
              <div key={listing.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-display font-semibold text-sm text-[var(--foreground)] flex-1">{listing.title}</p>
                  <StatusBadge status={listing.status} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <TransactionBadge type={listing.transactionType} />
                  {listing.price && <span className="text-[var(--primary)] font-bold text-sm">₹{listing.price.toLocaleString('en-IN')}</span>}
                  {listing.transactionType === 'give-away' && <span className="text-green-400 font-bold text-sm">FREE</span>}
                </div>
                <div className="flex gap-2">
                  {listing.status === 'available' && (
                    <>
                      <button className="flex-1 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-xl text-xs font-display font-semibold text-[var(--foreground)]">Edit</button>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_LISTING', payload: listing.id })}
                        className="flex-1 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-display font-semibold text-red-400"
                      >Remove</button>
                    </>
                  )}
                  {['sold', 'exchanged', 'given-away', 'returned'].includes(listing.status) && (
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_LISTING', payload: { ...listing, status: 'available', updatedAt: new Date().toISOString() } })}
                      className="flex-1 py-2 bg-[var(--primary)]/15 border border-[var(--primary)]/30 rounded-xl text-xs font-display font-semibold text-[var(--primary)]"
                    >Relist</button>
                  )}
                  {listing.status === 'draft' && (
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_LISTING', payload: { ...listing, status: 'available', updatedAt: new Date().toISOString() } })}
                      className="flex-1 py-2 bg-[var(--primary)] rounded-xl text-xs font-display font-semibold text-white"
                    >Publish</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── My Offers ─── */
type OfferTab = 'sent' | 'received' | 'accepted' | 'rejected' | 'expired';

export function MyOffersScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state } = useApp();
  const [tab, setTab] = useState<OfferTab>('sent');

  const sentOffers = state.offers.filter((o) => o.buyerId === state.user?.id);
  const receivedOffers = state.offers.filter((o) => {
    const listing = state.listings.find((l) => l.id === o.listingId);
    return listing?.sellerId === state.user?.id;
  });

  const tabs: { key: OfferTab; label: string }[] = [
    { key: 'sent', label: 'Sent' },
    { key: 'received', label: 'Received' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'expired', label: 'Expired' },
  ];

  const offers =
    tab === 'sent' ? sentOffers.filter((o) => o.status === 'pending') :
    tab === 'received' ? receivedOffers.filter((o) => o.status === 'pending') :
    tab === 'accepted' ? [...sentOffers, ...receivedOffers].filter((o) => o.status === 'accepted') :
    tab === 'rejected' ? [...sentOffers, ...receivedOffers].filter((o) => o.status === 'rejected') :
    [...sentOffers, ...receivedOffers].filter((o) => o.status === 'expired');

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">My Offers</h1>
      </div>
      <div className="flex gap-1 px-5 py-3 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${tab === t.key ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'}`}>{t.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {offers.length === 0 ? (
          <EmptyState icon="💰" title="No offers yet." body="Make or receive an offer on a listing." />
        ) : (
          <div className="flex flex-col gap-3">
            {offers.map((offer) => {
              const listing = state.listings.find((l) => l.id === offer.listingId);
              return (
                <div key={offer.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                  <p className="text-[var(--foreground)] font-display font-semibold text-sm mb-2">{listing?.title ?? '[Item]'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--primary)] font-bold text-lg font-display">₹{offer.amount.toLocaleString('en-IN')}</span>
                    <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded-full ${
                      offer.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                      offer.status === 'accepted' ? 'bg-green-500/15 text-green-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>{offer.status}</span>
                  </div>
                  <p className="text-[var(--muted-foreground)] text-xs mt-1">{new Date(offer.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── My Transactions ─── */
export function MyTransactionsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state } = useApp();
  const myTransactions = state.transactions.filter(
    (t) => t.buyerId === state.user?.id || t.sellerId === state.user?.id
  );

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">My Transactions</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {myTransactions.length === 0 ? (
          <EmptyState icon="🔁" title="No transactions yet." body="Complete a trade to see it here." />
        ) : (
          <div className="flex flex-col gap-3">
            {myTransactions.map((tx) => {
              const listing = state.listings.find((l) => l.id === tx.listingId);
              const isBuyer = tx.buyerId === state.user?.id;
              return (
                <div key={tx.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-display font-semibold text-sm text-[var(--foreground)]">{listing?.title ?? '[Item]'}</p>
                    <span className={`text-[10px] font-bold font-display px-2 py-0.5 rounded-full ${
                      tx.status === 'confirmed' ? 'bg-blue-500/15 text-blue-400' :
                      tx.status === 'completed' ? 'bg-green-500/15 text-green-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>{tx.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                    <TransactionBadge type={tx.transactionType} />
                    <span>{isBuyer ? 'You bought' : 'You sold'}</span>
                    {tx.agreedPrice && <span className="text-[var(--primary)] font-bold">₹{tx.agreedPrice.toLocaleString('en-IN')}</span>}
                  </div>
                  <p className="text-[var(--muted-foreground)] text-xs mt-1.5">📍 {tx.exchangePoint}</p>
                  <p className="text-[var(--muted-foreground)] text-xs mt-0.5">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                  {tx.status === 'confirmed' && (
                    <button
                      className="mt-3 w-full py-2 bg-green-500/15 border border-green-500/30 rounded-xl text-xs font-display font-semibold text-green-400"
                    >
                      Mark as {tx.transactionType === 'sell' ? 'Sold' : tx.transactionType === 'exchange' ? 'Exchanged' : tx.transactionType === 'give-away' ? 'Given Away' : 'Rented Out'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
