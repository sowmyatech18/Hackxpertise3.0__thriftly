import React, { useState } from 'react';
import { PrimaryButton, SafetyBanner, TopNav, Toast } from '../components/ui';
import { useApp, genId } from '../store';
import type { Screen } from '../types';

const EXCHANGE_POINTS = ['Main Gate', 'Central Library', 'Cafeteria Block', 'Student Activity Centre', 'Hostel Common Area', 'Other'];

interface CartData {
  listingId: string;
  agreedPrice?: number;
  rentStart?: string;
  rentEnd?: string;
  fee?: number;
  deposit?: number;
  pickupPoint?: string;
  returnPoint?: string;
}

function ConfirmedState({
  type,
  onChat,
  onTransaction,
}: {
  type: 'sell' | 'exchange' | 'give-away' | 'rent';
  onChat: () => void;
  onTransaction: () => void;
}) {
  const msgs: Record<typeof type, { icon: string; title: string; body: string }> = {
    sell: { icon: '✅', title: 'Request Confirmed ✓', body: 'Coordinate the handover through Chat.' },
    exchange: { icon: '✅', title: 'Exchange Request Confirmed ✓', body: 'Chat with the other user to arrange the exchange.' },
    'give-away': { icon: '✅', title: 'Request Confirmed ✓', body: 'The owner will reach out to coordinate.' },
    rent: { icon: '✅', title: 'Rental Request Confirmed ✓', body: 'Chat to confirm pickup details.' },
  };
  const m = msgs[type];

  return (
    <div className="flex flex-col h-full bg-[var(--background)] items-center justify-center px-8 text-center gap-6">
      <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
        <span className="text-5xl">{m.icon}</span>
      </div>
      <div>
        <h2 className="font-display font-bold text-2xl text-green-400 mb-2">{m.title}</h2>
        <p className="text-[var(--secondary-foreground)] text-sm">{m.body}</p>
      </div>
      <div className="bg-blue-500/15 border border-blue-400/30 rounded-xl px-4 py-2">
        <span className="text-blue-400 text-xs font-display font-bold">● RESERVED</span>
      </div>
      <SafetyBanner />
      <div className="w-full flex flex-col gap-3 mt-4">
        <PrimaryButton onClick={onChat}>View Chat</PrimaryButton>
        <button
          onClick={onTransaction}
          className="w-full py-3.5 rounded-2xl border border-[var(--border)] text-[var(--secondary-foreground)] font-display font-semibold text-sm"
        >
          View Transaction
        </button>
      </div>
    </div>
  );
}

export function CartSellScreen({
  data,
  navigate,
}: {
  data: CartData;
  navigate: (s: Screen) => void;
}) {
  const { state, dispatch } = useApp();
  const listing = state.listings.find((l) => l.id === data.listingId);
  const [confirmed, setConfirmed] = useState(false);
  const [exchangePoint, setExchangePoint] = useState(listing?.exchangePoint ?? EXCHANGE_POINTS[0]);

  if (!listing) return null;
  const price = data.agreedPrice ?? listing.price ?? 0;
  const savings = listing.originalPrice && listing.originalPrice > price ? listing.originalPrice - price : null;

  if (confirmed) {
    return (
      <ConfirmedState
        type="sell"
        onChat={() => navigate('chat-list')}
        onTransaction={() => navigate('my-transactions')}
      />
    );
  }

  function handleConfirm() {
    if (!listing) return;
    dispatch({
      type: 'UPDATE_LISTING',
      payload: { ...listing, status: 'reserved', updatedAt: new Date().toISOString() },
    });
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: genId(), listingId: data.listingId, buyerId: state.user?.id ?? '', sellerId: listing.sellerId,
        transactionType: 'sell', agreedPrice: price, exchangePoint, status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
    });
    setConfirmed(true);
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('product-detail')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">🛒 THRIFTLY CART</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <p className="text-[var(--muted-foreground)] text-xs font-display mb-2">Item</p>
          <p className="text-[var(--foreground)] font-display font-bold text-base">{listing.title}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2">
          <Row label="Price" value={`₹${price.toLocaleString('en-IN')}`} />
          {listing.originalPrice && <Row label="Original New Price" value={`₹${listing.originalPrice.toLocaleString('en-IN')}`} crossed />}
          {savings && <Row label="You Save" value={`₹${savings.toLocaleString('en-IN')}`} green />}
          <div className="border-t border-[var(--border)] pt-2 mt-1">
            <Row label="TOTAL" value={`₹${price.toLocaleString('en-IN')}`} bold />
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <p className="text-[var(--muted-foreground)] text-xs font-display mb-2">Handover Point</p>
          <select
            value={exchangePoint}
            onChange={(e) => setExchangePoint(e.target.value)}
            className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)]"
          >
            {EXCHANGE_POINTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <SafetyBanner />
      </div>
      <div className="px-5 pb-8 pt-4 border-t border-[var(--border)]">
        <PrimaryButton onClick={handleConfirm}>CONFIRM & CONTACT SELLER</PrimaryButton>
      </div>
    </div>
  );
}

export function CartExchangeScreen({
  data,
  navigate,
}: {
  data: CartData & { myListingId?: string };
  navigate: (s: Screen) => void;
}) {
  const { state, dispatch } = useApp();
  const listing = state.listings.find((l) => l.id === data.listingId);
  const myListing = state.listings.find((l) => l.id === data.myListingId);
  const [confirmed, setConfirmed] = useState(false);
  const [exchangePoint, setExchangePoint] = useState(EXCHANGE_POINTS[0]);

  if (!listing) return null;

  if (confirmed) {
    return <ConfirmedState type="exchange" onChat={() => navigate('chat-list')} onTransaction={() => navigate('my-transactions')} />;
  }

  function handleConfirm() {
    if (!listing) return;
    dispatch({ type: 'UPDATE_LISTING', payload: { ...listing, status: 'reserved', updatedAt: new Date().toISOString() } });
    setConfirmed(true);
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('product-detail')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">🔄 EXCHANGE SUMMARY</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <p className="text-[var(--muted-foreground)] text-xs font-display mb-2">YOUR ITEM</p>
          <p className="text-[var(--foreground)] font-display font-bold">{myListing?.title || '[Your Item]'}</p>
        </div>
        <div className="flex justify-center text-2xl">↕️</div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <p className="text-[var(--muted-foreground)] text-xs font-display mb-2">OTHER ITEM</p>
          <p className="text-[var(--foreground)] font-display font-bold">{listing.title}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <p className="text-[var(--muted-foreground)] text-xs font-display mb-2">Exchange Point</p>
          <select value={exchangePoint} onChange={(e) => setExchangePoint(e.target.value)} className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)]">
            {EXCHANGE_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <SafetyBanner />
      </div>
      <div className="px-5 pb-8 pt-4 border-t border-[var(--border)]">
        <PrimaryButton onClick={handleConfirm}>CONFIRM EXCHANGE</PrimaryButton>
      </div>
    </div>
  );
}

export function CartGiveAwayScreen({
  data,
  navigate,
}: {
  data: CartData;
  navigate: (s: Screen) => void;
}) {
  const { state, dispatch } = useApp();
  const listing = state.listings.find((l) => l.id === data.listingId);
  const [confirmed, setConfirmed] = useState(false);
  const [exchangePoint, setExchangePoint] = useState(listing?.exchangePoint ?? EXCHANGE_POINTS[0]);

  if (!listing) return null;
  if (confirmed) return <ConfirmedState type="give-away" onChat={() => navigate('chat-list')} onTransaction={() => navigate('my-transactions')} />;

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('product-detail')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">🎁 GIVE AWAY REQUEST</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-center">
          <p className="text-[var(--foreground)] font-display font-bold text-base mb-2">{listing.title}</p>
          <span className="font-display font-black text-3xl text-green-400">FREE 🎁</span>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <p className="text-[var(--muted-foreground)] text-xs font-display mb-2">Exchange Point</p>
          <select value={exchangePoint} onChange={(e) => setExchangePoint(e.target.value)} className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)]">
            {EXCHANGE_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <SafetyBanner />
      </div>
      <div className="px-5 pb-8 pt-4 border-t border-[var(--border)]">
        <PrimaryButton onClick={() => setConfirmed(true)}>REQUEST ITEM</PrimaryButton>
      </div>
    </div>
  );
}

export function CartRentScreen({
  data,
  navigate,
}: {
  data: CartData;
  navigate: (s: Screen) => void;
}) {
  const { state } = useApp();
  const listing = state.listings.find((l) => l.id === data.listingId);
  const [confirmed, setConfirmed] = useState(false);
  if (!listing) return null;
  if (confirmed) return <ConfirmedState type="rent" onChat={() => navigate('chat-list')} onTransaction={() => navigate('my-transactions')} />;

  const fee = data.fee ?? 0;
  const deposit = data.deposit ?? 0;
  const total = fee + deposit;

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('product-detail')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">🕒 RENTAL SUMMARY</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <p className="text-[var(--foreground)] font-display font-bold text-base mb-1">{listing.title}</p>
          <p className="text-amber-400 font-semibold text-sm">₹{listing.rentalRateDay?.toLocaleString('en-IN')}/day</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2">
          {data.rentStart && data.rentEnd && (
            <Row label="Rental Period" value={`${data.rentStart} → ${data.rentEnd}`} />
          )}
          <Row label="Rental Fee" value={`₹${fee.toLocaleString('en-IN')}`} />
          {deposit > 0 && <Row label="Refundable Deposit" value={`₹${deposit.toLocaleString('en-IN')}`} />}
          <div className="border-t border-[var(--border)] pt-2 mt-1">
            <Row label="Total at Handover" value={`₹${total.toLocaleString('en-IN')}`} bold />
          </div>
        </div>
        {data.pickupPoint && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2">
            <Row label="Pickup Point" value={data.pickupPoint} />
            {data.returnPoint && <Row label="Return Point" value={data.returnPoint} />}
          </div>
        )}
        <SafetyBanner />
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <p className="text-amber-400 text-xs font-medium">⚠️ No online payment is processed. Settle the amount at the campus handover point.</p>
        </div>
      </div>
      <div className="px-5 pb-8 pt-4 border-t border-[var(--border)]">
        <PrimaryButton onClick={() => setConfirmed(true)}>CONFIRM RENTAL REQUEST</PrimaryButton>
      </div>
    </div>
  );
}

function Row({ label, value, crossed, green, bold }: { label: string; value: string; crossed?: boolean; green?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'text-[var(--foreground)] font-display font-bold' : 'text-[var(--muted-foreground)]'}`}>{label}</span>
      <span className={`text-sm ${crossed ? 'line-through text-[var(--muted-foreground)]' : green ? 'text-green-400 font-semibold' : bold ? 'text-[var(--primary)] font-display font-bold' : 'text-[var(--foreground)] font-medium'}`}>{value}</span>
    </div>
  );
}
