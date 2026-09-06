import React, { useState } from 'react';
import {
  PrimaryButton, SecondaryButton, TopNav, StatusBadge, TransactionBadge,
  VerifiedBadge, StarRating, WishlistButton, ImgPlaceholder, SmartSavings,
  SafetyBanner, Modal, PriceInput, TextArea, Dropdown, Toast,
} from '../components/ui';
import { useApp, genId } from '../store';
import type { Screen } from '../types';
import { SEED_SELLERS } from '../seedData';
import { setPendingChat } from './Chat';

const EXCHANGE_POINTS = ['Main Gate', 'Central Library', 'Cafeteria Block', 'Student Activity Centre', 'Hostel Common Area', 'Other'];

export function ProductDetailScreen({
  listingId,
  navigate,
  onCartNavigate,
}: {
  listingId: string;
  navigate: (s: Screen) => void;
  onCartNavigate: (screen: Screen, data?: any) => void;
}) {
  const { state, dispatch } = useApp();
  const listing = state.listings.find((l) => l.id === listingId)!;
  const [photoIdx, setPhotoIdx] = useState(0);
  const [modal, setModal] = useState<'exchange' | 'rent' | 'give-away' | 'report' | null>(null);
  const [toast, setToast] = useState('');

  /* Exchange state */
  const [selectedMyListing, setSelectedMyListing] = useState('');
  const [exchangeMsg, setExchangeMsg] = useState('');

  /* Rent state */
  const [rentStart, setRentStart] = useState('');
  const [rentEnd, setRentEnd] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [returnPoint, setReturnPoint] = useState('');

  /* Give away state */
  const [giveMsg, setGiveMsg] = useState('');

  /* Report */
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');

  const isSaved = state.wishlist.some((w) => w.listingId === listingId);
  const myListings = state.listings.filter((l) => l.sellerId === state.user?.id && l.status === 'available');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  if (!listing) {
    return (
      <div className="flex flex-col h-full bg-[var(--background)] items-center justify-center gap-4">
        <span className="text-5xl">🔍</span>
        <p className="text-[var(--foreground)] font-display font-semibold">Item not found.</p>
        <button onClick={() => navigate('home')} className="text-[var(--primary)] text-sm">Go back</button>
      </div>
    );
  }

  const savings = listing.originalPrice && listing.price && listing.originalPrice > listing.price
    ? listing.originalPrice - listing.price : null;

  const isOwnListing = listing.sellerId === state.user?.id;

  function handleExchange() {
    if (!selectedMyListing) return;
    dispatch({
      type: 'ADD_PROPOSAL',
      payload: { id: genId(), listingId, proposerId: state.user?.id ?? '', myListingId: selectedMyListing, message: exchangeMsg, status: 'pending', createdAt: new Date().toISOString() },
    });
    dispatch({
      type: 'UPDATE_LISTING',
      payload: { ...listing, status: 'proposal-pending', updatedAt: new Date().toISOString() },
    });
    setModal(null);
    showToast('Exchange proposal sent! ✓');
  }

  function handleRentRequest() {
    if (!rentStart || !rentEnd || !pickupPoint) return;
    const days = Math.max(1, Math.ceil((new Date(rentEnd).getTime() - new Date(rentStart).getTime()) / 86400000));
    const fee = (listing.rentalRateDay || 0) * days;
    dispatch({
      type: 'ADD_RENTAL_REQUEST',
      payload: {
        id: genId(), listingId, requesterId: state.user?.id ?? '', startDate: rentStart, endDate: rentEnd,
        status: 'pending', totalFee: fee, pickupPoint, returnPoint: returnPoint || pickupPoint,
        createdAt: new Date().toISOString(),
      },
    });
    dispatch({
      type: 'UPDATE_LISTING',
      payload: { ...listing, status: 'rental-request', updatedAt: new Date().toISOString() },
    });
    setModal(null);
    const screen: Screen = 'cart-rent';
    onCartNavigate(screen, { listingId, rentStart, rentEnd, fee, deposit: listing.rentalDeposit || 0, pickupPoint, returnPoint: returnPoint || pickupPoint });
  }

  function handleGiveAwayRequest() {
    dispatch({
      type: 'UPDATE_LISTING',
      payload: { ...listing, status: 'request-pending', updatedAt: new Date().toISOString() },
    });
    setModal(null);
    onCartNavigate('cart-give-away', { listingId });
  }

  const rentDays = rentStart && rentEnd
    ? Math.max(1, Math.ceil((new Date(rentEnd).getTime() - new Date(rentStart).getTime()) / 86400000))
    : 0;
  const rentFee = rentDays * (listing.rentalRateDay || 0);

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Image */}
      <div className="relative">
        <div className="h-64 bg-[var(--secondary)] flex items-center justify-center overflow-hidden">
          {listing.photos[photoIdx] ? (
            <img
              src={listing.photos[photoIdx]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImgPlaceholder className="w-full h-full" />
          )}
        </div>
        <div className="absolute top-12 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate('home')} className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            <WishlistButton saved={isSaved} onToggle={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: listingId })} />
            <button className="p-1.5 bg-black/40 backdrop-blur-sm rounded-full" onClick={() => setModal('report')}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </button>
          </div>
        </div>
        {listing.photos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {listing.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === photoIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        )}
        {listing.isUrgent && (
          <div className="absolute top-3 right-4">
            <span className="bg-red-500 text-white text-xs font-display font-bold px-2.5 py-1 rounded-full">⚡ URGENT SALE</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          {/* Title + badges */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display font-bold text-xl text-[var(--foreground)] flex-1 leading-tight">{listing.title}</h1>
            <div className="flex-shrink-0">
              <StatusBadge status={listing.status} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <TransactionBadge type={listing.transactionType} />
            <span className="bg-[var(--secondary)] text-[var(--secondary-foreground)] text-[10px] font-display font-semibold px-2 py-0.5 rounded-full border border-[var(--border)]">
              {listing.condition === 'new' ? 'New' : listing.condition === 'like-new' ? 'Like New' : listing.condition === 'good' ? 'Good' : 'Used'}
            </span>
          </div>

          {/* Price */}
          <div className="mb-4">
            {listing.transactionType === 'give-away' && (
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-3xl text-green-400">FREE</span>
                <span className="text-green-400 text-lg">🎁</span>
              </div>
            )}
            {listing.transactionType === 'sell' && listing.price && (
              <div className="flex items-baseline gap-3">
                <span className="font-display font-black text-3xl text-[var(--primary)]">
                  ₹{listing.price.toLocaleString('en-IN')}
                </span>
                {listing.originalPrice && (
                  <span className="text-[var(--muted-foreground)] text-base line-through">
                    ₹{listing.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
            {listing.transactionType === 'rent' && listing.rentalRateDay && (
              <div>
                <span className="font-display font-black text-3xl text-amber-400">
                  ₹{listing.rentalRateDay.toLocaleString('en-IN')}
                  <span className="text-lg font-normal">/day</span>
                </span>
                {listing.rentalRateWeek && (
                  <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
                    ₹{listing.rentalRateWeek.toLocaleString('en-IN')}/week
                  </p>
                )}
                {listing.rentalDeposit && (
                  <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
                    Refundable deposit: ₹{listing.rentalDeposit.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
            {listing.transactionType === 'exchange' && (
              <div>
                <p className="font-display font-bold text-xl text-blue-400">Exchange 🔄</p>
                {listing.exchangePreference && (
                  <p className="text-[var(--secondary-foreground)] text-sm mt-1">Looking for: {listing.exchangePreference}</p>
                )}
              </div>
            )}
          </div>

          {savings && listing.transactionType === 'sell' && (
            <div className="mb-4">
              <SmartSavings original={listing.originalPrice!} thriftly={listing.price!} />
            </div>
          )}

          {/* Description */}
          <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-4 mb-4">
            <p className="text-[var(--muted-foreground)] text-xs font-display mb-1">Description</p>
            <p className="text-[var(--foreground)] text-sm leading-relaxed">{listing.description}</p>
          </div>

          {/* Exchange point */}
          <div className="flex items-center gap-3 bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-3 mb-4">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-[var(--muted-foreground)] text-xs">Exchange Point</p>
              <p className="text-[var(--foreground)] text-sm font-medium">{listing.exchangePoint}</p>
            </div>
          </div>

          {/* Seller card */}
          {(() => {
            const seedSeller = SEED_SELLERS[listing.sellerId] ?? null;
            const isOwnItem = listing.sellerId === state.user?.id;
            const displayName = isOwnItem
              ? (state.user?.name ?? 'You')
              : (listing.sellerName ?? seedSeller?.name ?? 'VIT Student');
            const initial = displayName[0]?.toUpperCase() ?? '?';
            const rating = seedSeller?.rating ?? 4.5;
            const reviewCount = seedSeller?.reviewCount ?? 0;
            const dept = seedSeller?.dept ?? 'VIT Vellore';
            return (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 mb-4">
                <p className="text-[var(--muted-foreground)] text-xs font-display mb-3">Seller</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-display font-bold text-base">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[var(--foreground)] text-sm font-display font-semibold">{displayName}</p>
                      <VerifiedBadge small />
                    </div>
                    <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">{dept}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-[var(--border)]'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-[var(--muted-foreground)] text-[10px] ml-0.5">{rating} ({reviewCount} reviews)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setPendingChat(listing.sellerId, displayName); navigate('chat-thread'); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-xl text-xs font-display font-semibold"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
                    </svg>
                    Chat
                  </button>
                </div>
              </div>
            );
          })()}

          <SafetyBanner />
        </div>
      </div>

      {/* Action buttons */}
      {!isOwnListing && listing.status === 'available' && (
        <div className="px-5 pb-8 pt-4 border-t border-[var(--border)] flex flex-col gap-3">
          {listing.transactionType === 'sell' && (
            <>
              <PrimaryButton onClick={() => {
                const sn = SEED_SELLERS[listing.sellerId]?.name ?? listing.sellerName ?? 'VIT Student';
                setPendingChat(listing.sellerId, sn);
                navigate('chat-thread');
              }}>
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
                  </svg>
                  Chat with Seller
                </span>
              </PrimaryButton>
              <SecondaryButton onClick={() => onCartNavigate('cart-sell', { listingId })}>Buy at Listed Price</SecondaryButton>
            </>
          )}
          {listing.transactionType === 'exchange' && (
            <PrimaryButton onClick={() => setModal('exchange')}>Propose Exchange</PrimaryButton>
          )}
          {listing.transactionType === 'give-away' && (
            <PrimaryButton onClick={() => setModal('give-away')}>Request Item</PrimaryButton>
          )}
          {listing.transactionType === 'rent' && (
            <PrimaryButton onClick={() => setModal('rent')}>Request to Rent</PrimaryButton>
          )}
        </div>
      )}

      {isOwnListing && (
        <div className="px-5 pb-8 pt-4 border-t border-[var(--border)]">
          <SecondaryButton onClick={() => navigate('my-listings')}>View in My Listings</SecondaryButton>
        </div>
      )}

      {/* Exchange Proposal Modal */}
      {modal === 'exchange' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="font-display font-bold text-lg text-[var(--foreground)] mb-4">Propose Exchange</h2>
          {myListings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted-foreground)] text-sm mb-4">You have no active listings to exchange with.</p>
              <PrimaryButton onClick={() => { setModal(null); navigate('create-listing'); }}>List an Item First</PrimaryButton>
            </div>
          ) : (
            <>
              <p className="text-[var(--muted-foreground)] text-xs mb-3">Choose one of your listings to offer:</p>
              <div className="flex flex-col gap-2 mb-4">
                {myListings.map((ml) => (
                  <button
                    key={ml.id}
                    onClick={() => setSelectedMyListing(ml.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedMyListing === ml.id ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--border)] bg-[var(--secondary)]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-xl">📦</div>
                    <div className="text-left">
                      <p className="text-[var(--foreground)] text-sm font-display font-semibold">{ml.title}</p>
                      {ml.price && <p className="text-[var(--muted-foreground)] text-xs">₹{ml.price.toLocaleString('en-IN')}</p>}
                    </div>
                  </button>
                ))}
              </div>
              {selectedMyListing && (
                <div className="bg-[var(--secondary)] rounded-xl p-3 mb-4">
                  <div className="text-center text-[var(--muted-foreground)] text-xs mb-2">YOUR ITEM ↕ OTHER ITEM</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--foreground)] text-xs">{myListings.find(l => l.id === selectedMyListing)?.title}</span>
                    <span className="text-[var(--muted-foreground)] text-xs">↔️</span>
                    <span className="text-[var(--foreground)] text-xs">{listing.title}</span>
                  </div>
                </div>
              )}
              <TextArea label="Optional Message" placeholder="Any message for the seller?" value={exchangeMsg} onChange={setExchangeMsg} rows={3} />
              <div className="mt-4">
                <PrimaryButton onClick={handleExchange} disabled={!selectedMyListing}>Send Proposal</PrimaryButton>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Rent Request Modal */}
      {modal === 'rent' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="font-display font-bold text-lg text-[var(--foreground)] mb-4">Request to Rent</h2>
          <div className="bg-[var(--secondary)] rounded-xl p-3 mb-4">
            <p className="text-[var(--foreground)] text-sm font-semibold">{listing.title}</p>
            <p className="text-[var(--primary)] font-bold">₹{listing.rentalRateDay?.toLocaleString('en-IN')}/day</p>
            {listing.rentalDeposit && (
              <p className="text-[var(--muted-foreground)] text-xs">Deposit: ₹{listing.rentalDeposit.toLocaleString('en-IN')}</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-display font-medium text-[var(--muted-foreground)] mb-1.5">Start Date</p>
              <input type="date" value={rentStart} onChange={e => setRentStart(e.target.value)} className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)]" />
            </div>
            <div>
              <p className="text-xs font-display font-medium text-[var(--muted-foreground)] mb-1.5">Return Date</p>
              <input type="date" value={rentEnd} onChange={e => setRentEnd(e.target.value)} className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)]" />
            </div>
            <Dropdown label="Pickup Point" placeholder="Select pickup point" value={pickupPoint} onChange={setPickupPoint} options={EXCHANGE_POINTS.map(p => ({ value: p, label: p }))} />
            <Dropdown label="Return Point" placeholder="Same as pickup" value={returnPoint} onChange={setReturnPoint} options={EXCHANGE_POINTS.map(p => ({ value: p, label: p }))} />
          </div>
          {rentDays > 0 && (
            <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-4 mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--muted-foreground)]">Duration</span>
                <span className="text-[var(--foreground)]">{rentDays} day{rentDays !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--muted-foreground)]">Rental Fee</span>
                <span className="text-[var(--foreground)]">₹{rentFee.toLocaleString('en-IN')}</span>
              </div>
              {listing.rentalDeposit && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted-foreground)]">Deposit</span>
                  <span className="text-[var(--foreground)]">₹{listing.rentalDeposit.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-[var(--border)] mt-2 pt-2 flex justify-between">
                <span className="text-[var(--foreground)] font-display font-semibold text-sm">Total at Handover</span>
                <span className="text-[var(--primary)] font-display font-bold">₹{(rentFee + (listing.rentalDeposit || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
          <div className="mt-4">
            <PrimaryButton onClick={handleRentRequest} disabled={!rentStart || !rentEnd || !pickupPoint}>Send Rental Request</PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Give Away Modal */}
      {modal === 'give-away' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="font-display font-bold text-lg text-[var(--foreground)] mb-2">Request Item</h2>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4 text-center">
            <p className="text-[var(--foreground)] text-sm font-semibold">{listing.title}</p>
            <p className="text-green-400 font-display font-black text-2xl mt-1">FREE 🎁</p>
          </div>
          <TextArea label="Optional Message" placeholder="Say something to the giver…" value={giveMsg} onChange={setGiveMsg} rows={3} />
          <div className="mt-4">
            <PrimaryButton onClick={handleGiveAwayRequest}>Send Request</PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Report Modal */}
      {modal === 'report' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="font-display font-bold text-lg text-[var(--foreground)] mb-4">Report Listing</h2>
          <Dropdown
            label="Reason"
            placeholder="Select a reason"
            value={reportReason}
            onChange={setReportReason}
            options={[
              { value: 'scam', label: 'Scam' },
              { value: 'wrong-info', label: 'Wrong Information' },
              { value: 'prohibited', label: 'Prohibited Item' },
              { value: 'inappropriate', label: 'Inappropriate Content' },
              { value: 'duplicate', label: 'Duplicate' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <div className="mt-3">
            <TextArea label="Description (Optional)" placeholder="Tell us more…" value={reportDesc} onChange={setReportDesc} rows={3} />
          </div>
          <div className="mt-4">
            <PrimaryButton onClick={() => { setModal(null); showToast('Report submitted. Thank you.'); }}>Submit Report</PrimaryButton>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
